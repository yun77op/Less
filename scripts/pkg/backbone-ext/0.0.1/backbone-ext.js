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

        register: function(viewState) {
            this.viewStates[viewState.name] = viewState;
            this.route(viewState);
        },

        registerSubViewState: function(subViewState, viewState) {
            subViewState.parent = viewState;
            this.register(subViewState);
        },

        route: function(viewState) {
            var self = this;
            var fullPath = viewState.getfullPath();

            if (_.isUndefined(fullPath)) return;

            this.router.route(fullPath, viewState.name, function() {
                viewState._handleEnter.apply(viewState, arguments);
                var activeViewState = self.activeViewState;

                while (activeViewState) {
                    activeViewState.active = false;
                    activeViewState.modules.forEach(function(module) {
                        if (typeof module == 'string') {
                            module = Backbone.application.getModuleByName(module);
                        }

                        module.destroy();
                        module.active = false;
                    });
                    activeViewState = activeViewState.parent;
                }

                self.activeViewState = viewState;
            });
        }
    };

    _.extend(RouteManager.prototype, Backbone.Events);


    Backbone.install = function(options, callback) {
        var application = new Application(options);
        var routerManager = new RouteManager();
        Backbone.application = application;
        callback(application, routerManager);
    };



    var Application = function(options) {
        this._configure(options || {});
    };

    Application.prototype._configure = function(options) {
        this.$el = $(options.el);
        this.modules = {};
    };

    Application.prototype.registerModule = function(module) {
        var moduleName = typeof module == 'function' ? module.prototype.name : module.name;
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
            this._resolveModules(tpl);
            this.active = false;

            _.defaults(this, {
                syncOnStart: true
            });
        },

        _resolveModules: function(tpl) {
            var result, name, module;

            this.modules = [];

            while(result = modulePattern.exec(tpl)) {
                name = result[2];
                module = Backbone.application.getModuleByName(name);
                this.modules.push(module);
            }
        },

        _handleEnter: function() {
            var args = arguments;
            if (_.isUndefined(this.modules)) {
                console.log(this.name);
            }
            this.modules.forEach(function(module) {
                module._handleEnter && module._handleEnter.apply(module, args);
            });

            this.enter.apply(this, args);
            this.active = true;
        },

        start: function(options) {
            this.prepareEl();
            this.prepareRender(options);
        },

        render: function() {
            var data = this.model ? this.model.attributes : {};
            var html = typeof this.template == 'function' ? this.template(data) : this.template;

            this.$el.html(html);
            return this;
        },

        destroy: function() {},

        enter: function() {},

        prepareEl: function() {
            var attrs = {
                class: this.name + (this.className ? ' ' + this.className : ''),
                id: this.mid
            };

            var content = typeof this.placeholder == 'string' ? this.placeholder : '';
            return this.make(this.tagName, attrs, content);
        },

        prepareRender: function(options) {
            var self = this;
            var model = this.model;
            var changed = true;
            var mid = this.mid = _.uniqueId('m');
            var selector = '#' + mid;
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
                self.setElement($(selector).get(0), true);
                self._handleEnter.apply(this, arguments);
                self.render();
                options.success && options.success.call(self);
            });
        }
    });

    Module.mergedOptions = ['placeholder'];

    Module.extend = Backbone.View.extend;


    var ViewState = Module.extend({
        _handleEnter: function() {
            if (this.parent && !this.parent.active) {
                this.parent._handleEnter.apply(this.parent, arguments);
            }

            ViewState.__super__['_handleEnter'].apply(this, arguments);
        },

        getfullPath: function() {
            var path = this.path;

            // Don't expand
            if (typeof path == 'string' && path[0] == '#') {
                return path.slice(1);
            }

            if (path instanceof RegExp) {
                return path;
            }

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
            context = null;
        }

        var name = options.hash.name;
        var module = Backbone.application.getModuleByName(name);

        if (typeof module == 'function') {
            var options = {};
            var Model = _.isFunction(module.model) ? module.model : Backbone.Model;
            options.model = new Model(context || {});
            module = new module(options);
        }

        module.prepareRender();

        return module.prepareEl().outerHTML;
    });



    ViewState.extend = Backbone.View.extend;

    Backbone.ViewState = ViewState;
    Backbone.Module = Module;
    Backbone.RouteManager = RouteManager;
}());
