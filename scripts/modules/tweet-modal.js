define(function (require) {

    var tpl = require('../views/tweet-modal.tpl');
    var TweetBase = require('./tweet');

    var TweetModalModule = TweetBase.extend({
        name:'tweet-modal',

        className: 'modal hide',

        id: 'status-modal',

        template: tpl,

        initialize: function() {
            TweetModalModule.__super__['initialize'].apply(this, arguments);

            var self = this;

            this.$el.on('hidden', function () {
                self.destroy();
            });

            this.on('connected', function() {
                self.$el.modal('hide');
            });


            this.$el.appendTo('body');
        },

        show: function() {
            this.on('load', function () {
                this.$el.modal('show');
            }, this);

            this.load();
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
