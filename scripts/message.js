define(function (require, exports) {

	var Message = function() {
		this.initialize.apply(this, arguments);
	};

	Message.prototype = {
		constructor: Message,

		initialize: function(name, options) {
			var $el = $('<div id="message-' + name + '" class="message"><div class="message-inner"><span class="message-text"></span></div></div>');

			this.$el = $el.appendTo('body');
			this.options = $.extend({}, Message.defaults);
			options && this.option(options);
			if (this.options.animation != null) {
				$el.addClass(this.options.animation);
			}

			_.bindAll(this, 'hide');

			var self = this,
				hide = function() {
					if (!self.$el.hasClass('in')) self.$el.hide();
				};

			$.support.transition && this.options.animation
				? this.$el.on($.support.transition.end, hide)
				: hide;

			if (this.option('autoOpen')) {
				this.show();
			}
		},

		show: function(text, autoHide) {
			var self = this;

			autoHide = autoHide || this.option('autoHide');
			if (text) this.$el.find('.message-text').html(text);
			this.$el.show();
			//setTimeout(function() {
				self.$el.addClass('in');
				if (autoHide) {
					self.addTimer();
				}
			//}, 0);
		},


		hide: function() {
			this.$el.removeClass('in');
		},

		addTimer: function() {
			this.timer = window.setTimeout(this.hide, this.option('hideTimeout'));
		},

		clearTimer: function () {
			if (this.timer) {
				window.clearTimeout(this.timer);
			}
		}
	};

	_.extend(Message.prototype, app.Options);

	Message.defaults = {
		hideTimeout: 2000,
		animation: 'collapse',
		autoOpen: false,
		autoHide: false
	};

    var instances = {};

	return function(id) {
        var instance = instances[id] || (instances[id] = new Message(id));
        return instance;
    };
});
