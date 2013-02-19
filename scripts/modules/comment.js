define(function (require) {

    var tpl = require('../views/comment.tpl');
    var weibo = require('../weibo');

    return Backbone.Module.extend({
        name: 'comment',

        className:'stream-item',

        tagName: 'li',

        template: tpl,

        events: {
            'click .action-reply': 'reply',
            'click .action-del': 'del'
        },

        reply: function() {
            var TweetReply = require('./tweet-reply');
            var tweetReply = new TweetReply({
                model: this.model.clone()
            });
            tweetReply.show();
        },

        del: function(e) {
            var self = this;
            var currentTarget = e.currentTarget;

            // prevent race
            if (currentTarget.disabled) return;
            currentTarget.disabled = true;

            weibo.request({
                method: 'POST',
                path: 'comments/destroy.json',
                params: { cid: this.model.get('id') }
            }, function () {
                currentTarget.disabled = false;
                self.$el.slideUp(function () {
                    self.destroy();
                });
            });
        }
    });
});
