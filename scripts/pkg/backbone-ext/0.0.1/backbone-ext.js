(function() {

    var defaultAvailables = {
        dom: function(selector) {
            return $(this.selector).length > 0;
        }
    };

    var Available = function() {
        var args = Array.prototype.slice.call(arguments);
        var fn = args.pop();

        this.testItems = args;
        this._timer = null;
        this.ready = false;
        this.callbacks = [];

        if (fn) {
            this.push(fn);
        }

        _.bindAll(this, '_poll');
        this.startInterval();
    };

    Available.prototype.startInterval = function() {
        this._timer = setInterval(this._poll, 50);
    };

    Available.prototype.push = function(fn) {
        if (!Array.isArray(fn)) {
            fn = [fn];
        }

        this.callbacks = this.callbacks.concat(fn);

        if (this.ready) {
            this._excute();
        }
    };

    Available.prototype._poll = function(selector) {
        if (this._test()) {
            clearInterval(this._timer);
            this._excute()
        }
    };

    Available.prototype._test = function() {
        var item, test, args, result = false;

        for (var i = 0, l = this.testItems.length; i < l; ++i) {
            item = this.testItems[i];

            if (typeof item == 'function') {
                test = item;
            } else if (test = defaultAvailables[item.type]) {
                args = item.value;
            }

            if (!Array.isArray(args)) {
                args = [args];
            }

            result = test.apply(null, args);
            if (result) break;
        }

        return result;
    };

    Available.prototype._excute = function() {
        this.callbacks.forEach(function(fn) {
            fn();
        });
        this.callbacks = [];
        this.ready = true;
    };



    // RouteManager

    var RouteManager = function() {
        this.router = new Backbone.Router();
        this.viewStates = {};
    };

    RouteManager.prototype = {
        constructor: RouteManager,

        _getInstance: function(ViewState) {
            var name = ViewState.prototype.name;
            return this.viewStates[name] || (this.viewStates[name] = new ViewState());
        },

        _handleRoute: function(viewState) {
            var activeViewState = this.activeViewState;
            var args = Array.prototype.slice.call(arguments).slice(1);

            if (activeViewState && !activeViewState.isParentOf(viewState)) {
                while (activeViewState) {
                    activeViewState._handleLeave();
                    activeViewState = activeViewState.parent;
                }
            }

            this.activeViewState = viewState;
            viewState._handleEnter.apply(viewState, args);
        },

        register: function(ViewState) {
            var viewState = this._getInstance(ViewState);
            this.route(viewState);
            return this;
        },

        registerSubViewState: function(ViewState, parentViewState) {
            this._getInstance(ViewState).parent = this._getInstance(parentViewState);
            this.register(ViewState);
            return this;
        },

        route: function(viewState) {
            var self = this;
            var fullPath = viewState.getFullPath();

            this.router.route(fullPath, viewState.name, this._handleRoute.bind(this, viewState));
        }
    };

    _.extend(RouteManager.prototype, Backbone.Events);


    Backbone.install = function(options, callback) {
        var application = new Application(options);
        var routerManager = new RouteManager();
        Backbone.application = application;
        Backbone.routerManager = routerManager;
        callback(application, routerManager);
    };



    var Application = function(options) {
        this._configure(options || {});
    };

    Application.prototype._configure = function(options) {
        this.el = options.el;
        this.$el = $(this.el);
        this.modules = {};
    };

    Application.prototype.registerModule = function(module) {
        var moduleName = _.isFunction(module) ? module.prototype.name : module.name;
        this.modules[moduleName] = module;
    };

    Application.prototype.getModuleByName = function(name) {
        var module = this.modules[name];
        if (!module) throw Error('Can not find module ' + name);
        return module;
    };


    var modulePattern = /{{#module.+?name=(['"])([^'"]+)\1/g;

    var Module = Backbone.View.extend({
        _configure: function(options) {
            var key, clonedOptions = _.clone(options);

            for (key in options) {
                if (~Module.mergedOptions.indexOf(key)) {
                    delete clonedOptions[key];
                    this[key] = options[key];
                }
            }

            Backbone.View.prototype._configure.call(this, clonedOptions);
        },

        initialize: function(options) {
            var tpl;

            if (this.template instanceof Element) {
                tpl = this.template.innerHTML;
            } else if (typeof this.template == 'string') {
                tpl = this.template;
            }

            if (tpl) this.template = Handlebars.compile(tpl);
            this.active = false;

            _.defaults(this, {
                syncOnStart: true
            });
        },

        _handleEnter: function() {
            var args = arguments;

            this.beforeEnter.apply(this, args);
            this.enter.apply(this, args);
            this.active = true;

            this.modules && this.modules.forEach(function(module) {
                module._handleEnter.apply(module, args);
            });
        },

        _handleLeave: function() {
            this.modules && this.modules.forEach(function(module) {
                module._handleLeave();
            });

            this.destroy();
            this.active = false;
        },

        registerModule: function(moduleOrName) {
            var module = _.isString(moduleOrName) ? Backbone.application.getModuleByName(moduleOrName) : moduleOrName;
            this.modules || (this.modules = []);
            this.modules.push(module);
            return this;
        },

        render: function() {
            var data = this.model ? this.model.attributes : {};
            var html = typeof this.template == 'function' ? this.template(data) : this.template;

            this.$el.html(html);
            return this;
        },

        destroy: function() {},

        beforeEnter: function() {},

        enter: function() {},

        start: function(el) {
            el.innerHTML = this.prepareEl().outerHTML;
            this.prepareRender();
            return this;
        },

        prepareEl: function() {
            var mid = this.mid = _.uniqueId('m');

            var attrs = {
                class: this.name + (this.className ? ' ' + this.className : ''),
                id: mid
            };

            var content = typeof this.placeholder == 'string' ? this.placeholder : '';
            return this.make(this.tagName, attrs, content);
        },

        prepareRender: function(options) {
            var self = this;
            var model = this.model;
            var changed = true;
            var selector = '#' + this.mid;
            options = options || {};

            if (this.syncOnStart && model && model.isNew()) {
                changed = false;
                var fetchOptions = {
                    data: this.options.data,
                    success: function() {
                        changed = true;
                    }
                };
                model.fetch(fetchOptions);
            }

            new Available({
                type: 'dom',
                value: selector
            }, function() {
                return changed;
            }, function() {
                self.setElement(document.querySelector(selector), true)
                    .render();
                self._handleEnter();
                self.trigger('ready');
                options.success && options.success.call(self);
            });

            return this;
        }
    });

    Module.mergedOptions = ['placeholder'];
    Module.extend = Backbone.View.extend;

    _.extend(Module.prototype, Backbone.Events);


    var ViewState = Module.extend({

        _handleEnter: function() {
            if (this.parent && !this.parent.active) {
                this.parent._handleEnter.apply(this.parent, arguments);
            }

            ViewState.__super__['_handleEnter'].apply(this, arguments);
        },

        isParentOf: function(viewState) {
            var tmp, result = false;
            while(tmp = viewState.parent) {
                if (tmp == this) {
                    result =  true;
                    break;
                }
                tmp = viewState.parent
            }
            return result;
        },

        getFullPath: function() {
            var path = this.path;

            // Don't expand
            if (typeof path == 'string' && path[0] == '#') {
                return path.slice(1);
            }

            if (path instanceof RegExp) return path;

            var pathAry = [path];
            var slash = '/';

            if (this.parent && this.parent.path) {
                pathAry.unshift(this.parent.path);
            }

            return pathAry.join(slash);
        }
    });

    ViewState.mergedOptions = ['path'];


    Handlebars.registerHelper('module', function(context, options) {
        if (typeof options == 'undefined') {
            options = context;
            context = {};
        }

        var hash = options.hash;
        var name = hash.name;
        var module = Backbone.application.getModuleByName(name);

        if (_.isFunction(module)) {
            module = new module();
        }

        if (!module.model) {
            module.model = new Backbone.Model(context);
        }

        if (!hash.parent) {
            Backbone.routerManager.activeViewState.registerModule(module);
        } else {
            Backbone.application.getModuleByName(hash.parent).registerModule(module);
        }

        var handleEnter_tmp = module._handleEnter;
        module._handleEnter = function() {
            handleEnter_tmp.apply(module, arguments);
            module.prepareRender();
        };

        return module.prepareEl().outerHTML;
    });



    ViewState.extend = Backbone.View.extend;

    Backbone.ViewState = ViewState;
    Backbone.Module = Module;
    Backbone.RouteManager = RouteManager;
}());
