define(function (require, exports) {

	var Message = function() {
		this.initialize.apply(this, arguments);
	};

	Message.prototype = {
		constructor: Message,

		initialize: function(options) {
			var options = $.extend({}, Message.defaults, options)
        , self = this;
			this.option(options);

			var $el = this.$el = $('<div class="message"><div class="message-inner">' +
        '<span class="message-text">' +
        options.text + '</span></div></div>');

      if (options.actions) {
        var $actions = $('<div class="message-actions" />');
        options.actions.forEach(function(item) {
          var $action = $('<button class="btn-link">' + item.label + '</button>');
          $action.click(_.bind(item.click, self));
          $actions.append($action);
        });
        $el.find('.message-inner').append($actions);
      }

			if (typeof options.className == 'string') {
				$el.addClass(this.options.className);
			}

			_.bindAll(this, 'hide');

			if (this.option('autoOpen')) {
				this.show();
			}
		},

		show: function() {
			this.$el.appendTo('body');

      if (this.option('autoHide')) {
        this.addTimer();
      }
		},


		hide: function() {
			this.$el.remove();
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
		hideTimeout: 4000,
		autoOpen: true,
		autoHide: true
	};

  return {
    createMessage: function(options) {
      return new Message(options);
    }
  };

});
