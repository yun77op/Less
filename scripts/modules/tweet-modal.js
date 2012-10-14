define(function (require) {

    var tpl = require('../views/tweet-modal.tpl');
    var weibo = require('../weibo');
    var Message = require('../Message')('top');
    var util = require('../util');

    var TweetModalModule = Backbone.Module.extend({
        name:'tweet-modal',

        className: 'modal hide',

        id: 'status-modal',

        template: tpl,

        initialize:function () {
            TweetModalModule.__super__['initialize'].apply(this, arguments);

            var self = this;

            this.$el.on('hidden', function () {
                self.remove();
            });
        },

        render: function () {
            TweetModalModule.__super__['render'].apply(this, arguments);
            this.submitBtn = this.el.querySelector('.status-submit-btn');
            return this;
        },

        show:function () {
            this.render().$el.appendTo('body');
            var textareaValue = this.getTextareaQuote && this.getTextareaQuote() || '';
            var textarea = this.el.querySelector('.status-editor');
            textarea.value = textareaValue;
            this.$el.modal('show');
            textarea.focus();
            this.indicateCounter();
        },

        events:{
            'click .status-submit-btn':'connect',
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
                self.$el.modal('hide');
                Message.show('Success', true);
            });
        },

        indicateCounter:function () {
            var text = this.getTextareaValue();
            var textLen = text.length;
            var counterEl = this.el.querySelector('.status-counter');
            var submitBtn = this.submitBtn;

            var result = text.match(/[^\x00-\xff]/g);
            var counter = text.length + (result && result.length) || 0;
            counter = Math.ceil(counter / 2);
            var limit = 140;
            var diff = counter - limit;

            counterEl.textContent = String(-diff);
            submitBtn.disabled = (counter > 0 && counter <= 140) ? false : true;
            counterEl.classList[diff > 0 ? 'add' : 'remove']('danger');
        }
    });

    return TweetModalModule;
});