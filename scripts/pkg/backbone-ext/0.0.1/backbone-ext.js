(function() {

    var buildinAvailables = {
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
            } else if (test = buildinAvailables[item.type]) {
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

            if (typeof fullPath == 'undefined') return;

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

        initialize: function() {
            var tpl;

            if (this.template instanceof Element) {
                tpl = this.template.innerHTML;
            } else if (typeof this.template == 'string') {
                tpl = this.template;
            }

            if (tpl) {
                this.template = Handlebars.compile(tpl);
            }

            var moduleName, module;

            this.modules = [];

            while(result = modulePattern.exec(tpl)) {
                moduleName = result[2];
                module = Backbone.application.getModuleByName(moduleName);
                this.modules.push(module);
            }

            this.active = false;

            _.defaults(this, {
                syncOnStart: true
            });
        },

        start: function(args) {
            this.enter.apply(this, args);
            this.prepareRender();
            this.prepareEl();
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
            var el = this.make(this.tagName, attrs, content);

            return el;
        },

        prepareRender: function() {
            var self = this;
            var model = this.model;
            var changed = false;
            var mid = _.uniqueId('m');
            var selector = '#' + mid;

            this.mid = mid;

            if (this.syncOnStart && model && model.isNew()) {
                model.fetch({
                    success: function() {
                        changed = true;
                    }
                });
            } else {
                changed = true;
            }

            new Available({
                type: 'dom',
                value: selector
            }, function() {
                return changed;
            }, function() {
                self.setElement($(selector).get(0), true);
                self.render();
                self.active = true;
            });
        }
    });

    Module.mergedOptions = ['placeholder'];

    Module.extend = Backbone.View.extend;



    var ViewState = Module.extend({
        active: false,

        _handleEnter: function() {
            var args = arguments;

            if (this.parent && !this.parent.active) {
                this.parent._handleEnter.apply(this.parent, args);
            }

            this.modules.forEach(function(module) {
                module.enter.apply(module, args);
            });

            this.enter.apply(this, args);

            this.modules.forEach(function(module) {
                module.afterEnter && module.afterEnter.apply(module, args);
            });

            this.active = true;
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

        var moduleName = options.hash.name;
        var module = Backbone.application.getModuleByName(moduleName);

        if (typeof module == 'function') module = new module();

        // module.model instanceof Backbone.Model
        if (typeof module.model == 'function' || !module.model) {
            module.model = new (module.model || Backbone.Model)(context || {});
        }

        module.prepareRender();

        return module.prepareEl().outerHTML;
    });



    ViewState.extend = Backbone.View.extend;

    Backbone.ViewState = ViewState;
    Backbone.Module = Module;
    Backbone.RouteManager = RouteManager;
}());
