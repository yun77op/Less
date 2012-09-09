
(function() {

	var dismiss = '[data-dismiss="alert"]';

	var Alert2 = function(el, options) {
		this.$el = $(el);
		this.el= this.$el[0];
		this.option(options);
		_.bindAll(this, 'hide');
		this.$el.on('click', dismiss, this.hide);
	};

	Alert2.prototype = {
		constructor: Alert2,

		show: function(content, autoHide) {
			this.clearTimer();

			if (typeof content == 'boolean') {
				autoHide = content;
				content = null;
			}

			var $el, self = this;

			if (content != null) {
				$el = $(content);
				this.$el.children().filter(':not(' + dismiss + ')').remove();
				this.$el.append($el);
			}

			this.$el.show().addClass('in');

			autoHide = typeof autoHide != 'undefined' ? autoHide : this.option('autoHide');
			if (autoHide) this.addTimer();	
		},
	
		hide: function() {
			var self = this,
				hide = function() {
					self.$el.hide();
				};
				
			this.$el.removeClass('in');

			$.support.transition
				? this.$el.on($.support.transition.end, hide)
				: hide;
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

	_.extend(Alert2.prototype, app.Options);

	$.fn.alert2 = function(option) {
		var args = Array.prototype.slice.call(arguments);

		return this.each(function() {
			var $this = $(this),
				data = $this.data('alert2'),
				options = $.extend({}, $.fn.alert2.defaults, $this.data(), typeof option == 'object' && option);
			
			if (!data) {
				data = new Alert2(this, options);
				$this.data('alert2', data);
			}
			
			args.shift();
			if (typeof option == 'string') return data[option].apply(data, args);
			else if (options.show) data.show();
		});
	};

	$.fn.alert2.defaults = {
		show: false,
		autoHide: false,
		hideTimeout: 4000
	};
		
})();
