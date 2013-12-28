(function() {

    // shorthands
    var slice = Array.prototype.slice;

    // Helper function to get a value from a Backbone object as a property
    // or as a function.
    var getValue = function(object, prop) {
        if (!(object && object[prop])) return null;
        return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    };


    /**
     * A data structure which is a combination of an array and a set. Adding a new
     * member is O(1), testing for membership is O(1), and finding the index of an
     * element is O(1). Removing elements from the set is not supported. Only
     * strings are supported for membership.
     */
    function ArraySet() {
        this._array = [];
        this._set = {};
    }

    /**
     * Static method for creating ArraySet instances from an existing array.
     */
    ArraySet.fromArray = function ArraySet_fromArray(aArray) {
        var set = new ArraySet();
        for (var i = 0, len = aArray.length; i < len; i++) {
            set.add(aArray[i]);
        }
        return set;
    };

    /**
     * Add the given string to this set.
     *
     * @param {String} str
     * @param {*} [obj]
     */
    ArraySet.prototype.add = function ArraySet_add(str, obj) {
        if (this.has(str)) {
            // Already a member; nothing to do.
            return;
        }
        if (!obj) obj = str;
        var idx = this._array.length;
        this._array.push(obj);
        this._set[str] = idx;
    };

    ArraySet.prototype.forEach = function ArraySet_each(callback, thisArg) {
        this._array.forEach(callback, thisArg);
    };

    ArraySet.prototype.remove = function ArraySet_remove(str) {
      if (!this.has(str)) return;

      var idx = this._set[str];
      delete this._set[str];
      this._array.splice(idx, 1);
    };

    // Proxy to _'s chain
    ArraySet.prototype.chain = function ArraySet_chain() {
        return _(this._array).chain();
    };


    var undersocreMethods = ['filter'];

    undersocreMethods.forEach(function(method) {
        ArraySet.prototype[method] = function() {
            args = slice.call(arguments);
            args.unshift(this._array);
            return _[method].apply(_, args);
        }
    });

    /**
     * Is the given string a member of this set?
     *
     * @param String str
     */
    ArraySet.prototype.has = function ArraySet_has(aStr) {
        return Object.prototype.hasOwnProperty.call(this._set, aStr);
    };

    /**
     * What is the index of the given string in the array?
     *
     * @param {String} str
     */
    ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
        if (this.has(aStr)) {
            return this._set[aStr];
        }
		return null;
        //throw new Error('"' + aStr + '" is not in the set.');
    };

    ArraySet.prototype.get = function ArraySet_get(str) {
       return this.at(this.indexOf(str));
    };

    /**
     * What is the element at the given index?
     *
     * @param Number idx
     */
    ArraySet.prototype.at = function ArraySet_at(aIdx) {
        if (aIdx >= 0 && aIdx < this._array.length) {
            return this._array[aIdx];
        }
		return null;
        //throw new Error('No element indexed by ' + aIdx);
    };

    /**
     * Returns the array representation of this set (which has the proper indices
     * indicated by indexOf). Note that this is a copy of the internal array used
     * for storing the members so that no one can mess with internal state.
     */
    ArraySet.prototype.toArray = function ArraySet_toArray() {
        return this._array.slice();
    };




    Backbone.install = function(options, callback) {
        var application = new Application(options);
        Backbone.application = application;
        callback(application);

        Backbone.history.start();
        Backbone.history.checkUrl();
    };



    var Application = function(options) {
        this._configure(options || {});
    };

    Application.prototype._configure = function(options) {
        this.el = options.el;
        this.$el = $(this.el);
        this.modules = {};
        this.__umi = {};
        this.__activePath = [];

        this.__router = options.router;

        if (!this.__router) {
            this.__router = new Backbone.Router();
        }
    };

    Application.prototype.registerModule = function(Module) {
        this.modules[Module.prototype.name] = Module;
    };

    Application.prototype.__findCommonRoot = function(ary1, ary2) {
        var commonRoot = -1, item;

        for (var i = 0, l = Math.min(ary1.length, ary2.length); i < l; ++i) {
            if (ary2[i] == ary1[i]) {
                commonRoot = i;
            } else {
                return commonRoot;
            }
        }

        return commonRoot;
    };

    Application.prototype.__handleEnter = function(path) {

        var Modules = this.__umi[path];
        var self = this;

        var lastActivePath = this.__lastActivePath;

        if (typeof lastActivePath != 'undefined') {
            var lastActiveModuleAry = this.__umi[lastActivePath];
            var commonRoot = this.__findCommonRoot(lastActiveModuleAry, Modules);
            for (var i = lastActiveModuleAry.length - 1; i > commonRoot; i--) {
                this.__activePath.splice(i, 1)[0].destroy();
            }
        }


        var options = {
            path: path,
            params: slice.call(arguments, 1)
        };

        // Refresh

        for (; i >= 0; i--) {
            this.__activePath[i].__traverseSubModules(['__onRefresh'], [options]);
        }

        this.__lastActivePath = path;

        var each = function(Modules, idx, parentMod) {
            var Module = Modules[idx];
            if (idx >= Modules.length) return;
            var mod = new Module();
            var parent = mod.__parseParent(parentMod);
            if (typeof parent == 'string' && parentMod) {
                parent = parentMod.$el.find(parent);
            }
            mod.__onRefresh(options);
            mod.render().$el.appendTo(parent);
            mod.__traverseSubModules(['__onRefresh', 'render'], [options]);
            self.__activePath.push(mod);
            each(Modules, ++idx, mod);
        };

        var idx = typeof commonRoot != 'undefined' ? commonRoot + 1 : 0;
        each(Modules, idx, this.__activePath[idx > 0 ? commonRoot : 0]);
    };

    Application.prototype.register = function(path) {
        this.__umi[path] = slice.call(arguments, 1);
        this.__router.route(path, path, _.bind(this.__handleEnter, this, path));
    };

    var Module = Backbone.View.extend({
        initialize: function() {
            this.modules = new ArraySet();
        },

        __traverseSubModules: function(methodAry, args) {
            this.modules.forEach(function(mod) {
                methodAry.forEach(function(method) {
                    mod[method].apply(mod, args);
                });
                mod.__traverseSubModules(methodAry, args);
            });
        },

        __enter: function(options) {
            this.__onRefresh(options);
            this.render();
            this.__traverseSubModules(['__onRefresh', 'render'], [options]);
            return this;
        },

        __onRefresh: function() {

        },

        render: function(options) {
            var self = this;

            if (typeof this.model != 'undefined' && getValue(this.model, 'url') && (options && options.force || this.model.isNew())) {
                this.model.fetch({
                    data: this.options.data,
                    success: function(resp) {
                        self.__render();
                    }
                });
            } else {
                this.__render();
            }

            return this;
        },

        __render: function() {
            var html;

            if (this.templateType == 0) {
                html = this.template;
            } else {
                html = (Handlebars.compile(this.template))(this.model.toJSON());
            }

            this.$el.html(html);
            return this;
        },

        __parseParent: function(parentMod) {
            var parent = parentMod.__exports[this.name];
            if (typeof parent == 'undefined') throw new Error('Invalid parent');
            return parent;
        },

        /**
         * Append one module to another module with an optional dom selector
         *
         * @param module {Backbone.Module}
         * @param selector [String]
         * @param options {Object}
         */
        append: function(Module, selector, options) {
            var container = selector ? (typeof selector === 'string' ? this.el.querySelector(selector) : selector) : this.el;
            var mod = new Module(options || {});
            container.appendChild(mod.el);

            this.modules.add(mod.id, mod);
//            this.registerModule(module);
//            module._handleEnter.apply(module, args);
            return mod;
        },

        appendModule: function(mod) {
            this.modules.add(mod.id, mod);
        },

        destroy: function() {
            this.modules.forEach(function(mod) {
                mod.destroy();
            });

            this.undelegateEvents();
            this.$el.remove();
        },

        _ensureElement: function() {
          if (!this.el) {
            var attrs = getValue(this, 'attributes') || {};
            this.id = this.id || _.uniqueId('m');
            attrs.id = this.id;
            var className = this.name;
            if (this.className) className += ' ' + this.className;
            attrs['class'] = className;
            var content = typeof this.placeholder == 'string' ? this.placeholder : '';
            this.setElement(this.make(this.tagName, attrs, content), false);
          } else {
            this.setElement(this.el, false);
          }
        }
    });

    Module.extend = Backbone.View.extend;

    _.extend(Module.prototype, Backbone.Events);


    var getValue = function(object, prop) {
        if (!(object && object[prop])) return null;
        return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    };

    Backbone.Module = Module;
}());
