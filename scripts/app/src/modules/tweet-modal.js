define(function (require) {

    var tpl = require('../views/tweet-modal.tpl');
    var TweetBase = require('./tweet');
    var Emoticons = require('./weibo-emoticons');

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
        },

        render: function() {
            TweetModalModule.__super__.render.apply(this, arguments);
            this.append(Emoticons, '.tweet-emotion-container');
        },

        show: function() {
            this
              .__enter()
              .$el.appendTo('body');

            this.$el.modal('show');
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
