define(function (require) {

    var weibo = require('../weibo');
    var message = require('../message');

    var TweetBase = Backbone.Module.extend({
        name:'tweet-base',

        initialize: function() {
            this.on('repost', function(text) {
                var textarea = this.el.querySelector('.status-editor');
                textarea.value = text;
                setTimeout(function() {
                    textarea.focus();
                }, 0);
            }, this);

            TweetBase.__super__['initialize'].apply(this, arguments);
        },

        render: function() {
            TweetBase.__super__.render.apply(this, arguments);
            this.submitBtn = this.el.querySelector('.status-submit-btn');
            var text = this.getTextareaQuote && this.getTextareaQuote() || '';
            this.trigger('repost', text);
            this.indicateCounter();
        },

        events:{
            'click .status-submit-btn': 'connect',
            'keyup .status-editor':'indicateCounter',
            'focus .status-editor':'indicateCounter'
        },

        getTextareaValue: function() {
            var textarea = this.el.querySelector('.status-editor');
            return String(textarea.value).trim();
        },

        connect:function (e) {
            e.preventDefault();
            var text = this.getTextareaValue();
            var textarea = this.el.querySelector('.status-editor');
            var self = this;

            if (text === '') {
                textarea.focus();
                return message.createMessage({
                  text: chrome.i18n.getMessage('fieldEmpty')
                });
            }

            var parameters = this.getParameters();

            var loadingMessage = message.createMessage({
              text: chrome.i18n.getMessage('loading'),
              autoHide: false
            });

            var options = {
                method:'POST',
                path: this.url,
                params: parameters
            };
            if (parameters.pic) options.multi = true;
            weibo.request(options, function () {
                textarea.value = '';
                self.trigger('connected');
                loadingMessage.hide();
                message.createMessage({
                  text: 'Success'
                });
            });

            return false;
        },

        indicateCounter: function () {
            var text = this.getTextareaValue();
            var textLen = text.length;

            var result = text.match(/[^\x00-\xff]/g);
            var counter = text.length + (result && result.length) || 0;
            counter = Math.ceil(counter / 2);
            var limit = 140;

            this.submitBtn.disabled = !(counter > 0 && counter <= 140);
            if (this.counterCallback) this.counterCallback(counter, limit);
        }
    });

    return TweetBase;
});
