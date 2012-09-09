(function() {

  	var getValue = function(object, prop) {
	    if (!(object && object[prop])) return null;
	    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
	}

	var getVar = function(varStrOrAry) {
		var ary = varStrOrAry;
	
		if (typeof varStrOrAry == 'string')
			ary = varStrOrAry.split('.');

		return _.reduce(ary, function(memo, key) {
			return memo[key];
		}, window);
	};

	var getModule = function(str) {
		var ary = str.split('.'),
			moduleName = ary.pop(),
			host = getVar(ary);

		return host.getModuleByName(moduleName);
	};


	// TODO: Combine with model?
	var ViewState = function(options) {
		this.active = false;
		this._configure(options);
	};

	ViewState.mergedOptions = ['path', 'view', 'modules'];

	ViewState.prototype = {
		_configure: function(options) {
			var key, value; 

			if (!Array.isArray(this.modules)) this.modules = [];

			for (key in options) {
				value = options[key];
				if (key == 'modules') {
					this.useModule(value);
				} else if (~ViewState.mergedOptions.indexOf(key)) {
					this[key] = value;
				}
			}

			this.options = options;
		},

		_handleEnter: function() {
			var args = arguments;

			if (this.parent && !this.parent.active) {
				this.parent._handleEnter.apply(this.parent, arguments);
			}



			this.modules.forEach(function(module, i) {
				if (typeof module == 'string') {
				      module = getModule(module);
				}

				module.enter.apply(module, args);
			});

			this.enter.apply(this, args);

			this.modules.forEach(function(module, i) {
				if (typeof module == 'string') {
				      module = getModule(module);
				}

				module.afterEnter && module.afterEnter.apply(module, args);
			});

			this.active = true;
		},

		useModule: function(modules) {
			var self = this;
			if (typeof modules == 'string') modules = [modules];
			modules.forEach(function(module, i) {
				self.modules.push(module);	
			});
		},

		get fullPath() {
			var path = this.path;

			if (typeof path == 'undefined' || path instanceof RegExp) {
				return path;
			}

			var pathAry = [path],
					slash = '/';

			if (this.parent && this.parent.path) {
				pathAry.unshift(this.parent.path);
			}

			return pathAry.join(slash);
		}
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

			if (typeof viewState.fullPath == 'undefined') return;

			this.router.route(viewState.fullPath, viewState.name, function() {
				viewState._handleEnter.apply(viewState, arguments);
				var activeViewState = self.activeViewState;

				while (activeViewState) {
					activeViewState.active = false;
					activeViewState.modules.forEach(function(module, i) {
						if (typeof module == 'string')
							module = getModule(module);

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



	var Application = function(options) {
		this._configure(options || {});
	};

	Application.prototype._configure = function(options) {
		this.$el = $(options.el);
		this.modules = {}
	};

	Application.prototype.registerModule = function(module) {
		var moduleName = typeof module == 'function' ? module.prototype.name : module.name;
		this.modules[moduleName] = module;
	};

	Application.prototype.getModuleByName = function(name) {
		return this.modules[name] || null;
	};


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
			var html;

			if (this.template instanceof Element) {
				html = this.template.innerHTML;
			} else if (typeof this.template == 'string') {
				html = this.template;
			}

			if (html) {
				this.template = Handlebars.compile(html);
			}

			this.active = false;
		},

		start: function(args) {
			this.enter.apply(this, args);
			this.prepareRender();
			this.prepareEl();
	       	},
			
		render: function() {
			var html = typeof this.template == 'function' ? this.template(this.model ? this.model.attributes : {}) : this.template;
			this.$el.html(html);
			return this;
		},
	    	
	    	destroy: function() {},

		enter: function() {},
		
	    	prepareEl: function() {
			var html = '<' + this.tagName + ' id="' + this.mid + '"',
	    			attrs = getValue(this, 'attributes') || {}, key;

			html += ' class="' + this.name;
			if (this.className) html += ' ' + this.className;
			html += '"';

			for (key in attrs) {
				ret += ' ' + key + '="' + attrs[key] + '"';
			}

			html += '>';
			if (typeof this.placeholder == 'string') {
				html += this.placeholder;
			}
			html += '</' + this.tagName + '>';

			return html;
		},

		prepareRender: function() {
			var self = this,
				model = this.model,
				changed = false,
				mid = _.uniqueId('m'),
				selector = '#' + mid;

			this.mid = mid;

			if (model && model.isNew()) {
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


	Handlebars.registerHelper('module', function(context, options) {
		if (typeof options == 'undefined') {
			options = context;
			context = null;
		}

		var module = getModule(options.hash.name);
	
		if (typeof module == 'function') module = new module();
		if (context && !module.model) module.model = new Backbone.Model(context);
		module.prepareRender();

		return module.prepareEl();
	});


	var buildinAvailables = {
		dom: function(selector) {
			return $(this.selector).length > 0;
		}
	};

	var Available = function() {
		var args = Array.prototype.slice.call(arguments),
				fn = args.pop();

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

	Available.prototype._excute = function(selector) {
		this.callbacks.forEach(function(fn, i) {
			fn();
		});
		this.callbacks = [];
		this.ready = true;
	};
	
	ViewState.extend = Module.extend = Backbone.View.extend;

	Backbone.ViewState = ViewState;
	Backbone.Module = Module;
	Backbone.Available = Available;
	Backbone.RouteManager = RouteManager;
	Backbone.Application = Application;
}());
