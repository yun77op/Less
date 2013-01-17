define(function (require) {

    var tpl = require('../views/tweet-modal.tpl');
    var TweetBase = require('./tweet');

    var TweetModalModule = TweetBase.extend({
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

        connectCallback: function() {
            this.$el.modal('hide');
        },

        counterCallback: function(counter, limit) {
            var diff = counter - limit;
            var counterEl = this.el.querySelector('.status-counter');
            counterEl.textContent = String(-diff);
            counterEl.classList[diff > 0 ? 'add' : 'remove']('danger');
        }
    });

    return TweetModalModule;
});