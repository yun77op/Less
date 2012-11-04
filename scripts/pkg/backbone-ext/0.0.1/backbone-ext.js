(function() {

    // shorthands
    var slice = Array.prototype.slice;

    // Helper function to get a value from a Backbone object as a property
    // or as a function.
    var getValue = function(object, prop) {
        if (!(object && object[prop])) return null;
        return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    };

    var defaultAvailables = {
        dom: function(selector) {
            return $(selector).length > 0;
        }
    };

    var Available = function(tests, func) {
        this.tests = tests;
        this._timer = null;
        this.ready = false;
        this.callbacks = [];

        if (func) {
            this.push(func);
        }

        _.bindAll(this, '_poll');
        this.startInterval();
        this._poll();
    };

    Available.prototype.startInterval = function() {
        this._timer = setInterval(this._poll, 1000);
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

    Available.prototype._poll = function() {
        if (this._test()) {
            clearInterval(this._timer);
            this._excute()
        }
    };

    Available.prototype._test = function() {
        var item, test, args;
        var passed = 0;
        var count = this.tests.length;

        for (var i = 0, l = this.tests.length; i < l; ++i) {
            item = this.tests[i];

            if (typeof item == 'function') {
                test = item;
            } else if (test = defaultAvailables[item.type]) {
                args = item.value;
            } else {
                throw new Error('Available test item ' + item + 'not found.');
            }

            if (!Array.isArray(args)) {
                args = [args];
            }

            passed += test.apply(null, args);
        }

        return passed == count;
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

        _handleRoute: function(targetViewState) {
            var previousViewState = this.activeViewState;
            var args = slice.call(arguments).slice(1);
            this.activeViewState = targetViewState;


            if (previousViewState && previousViewState.isParentOf(targetViewState)) {
                previousViewState.transition();
            } else if (targetViewState == previousViewState || targetViewState.isParentOf(previousViewState)) {
                while (previousViewState) {
                    if (previousViewState != targetViewState) {
                        previousViewState.destroy();
                        previousViewState = previousViewState.parent;
                    } else {
                        targetViewState.destroy();
                        break;
                    }
                }
            } else {
                // different view state
                while (previousViewState) {
                    previousViewState.destroy();
                    previousViewState = previousViewState.parent;
                }
            }

            targetViewState._handleEnter.apply(targetViewState, args);
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

    var Module = Backbone.View.extend({
        initialize: function() {
            var tpl;

            if (this.template instanceof Element) {
                tpl = this.template.innerHTML;
            } else if (typeof this.template == 'string') {
                tpl = this.template;
            }

            if (tpl) this.template = Handlebars.compile(tpl);

            this.mid = this.el.id || _.uniqueId('m');
            this.active = false;
        },

        _handleEnter: function() {
            if (this.active) return;

            var args = slice.call(arguments);

            this.beforeEnter.apply(this, args);

            if (!this.ready) {
                this._render({
                    success: this._handleChildEnter.bind(this, args)
                });
            }
            this.enter.apply(this, args);
            this.active = true;
            return this;
        },

        _handleChildEnter: function(args) {
            this.modules && _.chain(this.modules).filter(function(module) {
                return !module.active;
            }).each(function(module) {
                module._handleEnter.apply(module, args);
            });
        },

        registerModule: function(moduleOrName) {
            var module = _.isString(moduleOrName) ? Backbone.application.getModuleByName(moduleOrName) : moduleOrName;
            this.modules || (this.modules = []);
            this.modules.push(module);
            return this;
        },

        render: function() {
            var data = this.model ? this.model.toJSON() : {};
            var html = typeof this.template == 'function' ? this.template(data) : this.template;

            this.$el.html(html);
            return this;
        },

        // events
        beforeEnter: function() {},

        enter: function() {},

        destroy: function() {
            this.active = false;
            this.ready = false;
            this.off(); // remove all events

            this.modules && this.modules.forEach(function(module) {
                module.destroy();
            });

            if (!(this instanceof ViewState)) {
                this.$el.remove();
            }
            this.modules = null;
        },

        append: function(module, selector, args) {
            if (Array.isArray(selector)) {
                args = selector;
                selector = null;
            }

            args = args || [];

            var container = selector ? this.el.querySelector(selector) : this.el;
            var el = module.prepareEl();
            container.appendChild(el);

            this.registerModule(module);
            module._handleEnter.apply(module, args);
            return this;
        },

        onReady: function(func) {
            if (this.ready) return func.call(this);
            this.on('ready', func, this);
        },

        prepareEl: function(type) {
            var attrs = {
                class: this.name + (this.className ? ' ' + this.className : ''),
                id: this.mid
            };

            var content = typeof this.placeholder == 'string' ? this.placeholder : '';
            var el = this.make(this.tagName, attrs, content);
            return type && type.toLowerCase() == 'html' ? el.outerHTML : el;
        },

        _render: function(options) {
            var model = this.model;
            var changed = true;
            options = options || {};

            Backbone.application._currentModule = this;

            if (getValue(model, 'url')) {
                changed = false;
                var fetchOptions = {
                    data: this.options.data,
                    success: function() {
                        changed = true;
                    }
                };
                model.fetch(fetchOptions);
            }

            var tests = [{
                type: 'dom',
                value: '#' + this.mid
            }, function() {
                return changed;
            }];

            new Available(tests, function() {
                var el = document.getElementById(this.mid);
                this.setElement(el, true)
                    .render();
                this.trigger('ready').ready = true;
                options.success && options.success.call(this);
            }.bind(this));

            return this;
        }
    });

    Module.extend = Backbone.View.extend;

    _.extend(Module.prototype, Backbone.Events);


    var ViewState = Module.extend({

        transition: function() {},

        _handleEnter: function() {
            if (this.parent) {
                this.parent._handleEnter.apply(this.parent, arguments);
                this.ready = true;
            }

            ViewState.__super__['_handleEnter'].apply(this, arguments);
        },

        isParentOf: function(viewState) {
            var tmp = viewState, result = false;

            do {
                tmp = tmp && tmp.parent;
                if (tmp == this) {
                    result =  true;
                    break;
                }
            } while(tmp);

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
        if (_.isUndefined(options)) {
            options = context;
            context = {};
        }

        var name = options.hash.name;
        var application = Backbone.application;
        var module = application.getModuleByName(name);

        if (_.isFunction(module)) {
            module = new module();
        }

        if (!module.model) {
            var Model = Backbone.Model.extend({ url: null });
            module.model = new Model(context);
        }

        application._currentModule.registerModule(module);

        return module.prepareEl('html');
    });


    ViewState.extend = Backbone.View.extend;

    Backbone.ViewState = ViewState;
    Backbone.Module = Module;
    Backbone.RouteManager = RouteManager;
}());
