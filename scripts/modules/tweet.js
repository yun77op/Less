define(function (require) {

    var tpl = require('../views/tweet-comment.tpl');
    var weibo = require('../weibo');
    var Message = require('../Message')('top');
    var util = require('../util');

    var TweetBase = Backbone.Module.extend({
        name:'tweet-base',

        template: tpl,

        initialize: function() {
            this.onReady(function() {
                this.submitBtn = this.el.querySelector('.status-submit-btn');
            });

            TweetBase.__super__['initialize'].apply(this, arguments);
        },

        events:{
            'click .status-submit-btn': 'connect',
            'keyup .status-editor':'indicateCounter'
        },

        getTextareaValue: function() {
            var textarea = this.el.querySelector('.status-editor');
            return String(textarea.value).trim();
        },

        connect:function () {
            var text = this.getTextareaValue();
            var textarea = this.el.querySelector('.status-editor');
            var self = this;

            if (text === '') {
                textarea.focus();
                return Message.show(chrome.i18n.getMessage('fieldEmpty'), true);
            }

            var parameters = this.getParameters();

            Message.show(chrome.i18n.getMessage('loading'));
            weibo.request({
                method:'POST',
                path: this.url,
                params: parameters
            }, function () {
                self.connectCallback && self.connectCallback();
                Message.show('Success', true);
            });
        },

        indicateCounter: function () {
            var text = this.getTextareaValue();
            var textLen = text.length;

            var result = text.match(/[^\x00-\xff]/g);
            var counter = text.length + (result && result.length) || 0;
            counter = Math.ceil(counter / 2);
            var limit = 140;

            this.submitBtn.disabled = (counter > 0 && counter <= 140) ? false : true;
            if (this.counterCallback) this.counterCallback(counter, limit);
        }
    });

    return TweetBase;
});
