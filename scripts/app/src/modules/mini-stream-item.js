define(function (require) {

    var tpl = require('../views/mini-stream-item.tpl');

    return Backbone.Module.extend({
        name: 'mini-stream-item',

        className:'stream-item',

        tagName: 'li',

        template: tpl,

        events: {
            'click .action-reply': 'reply',
            'click .action-repost': 'repost'
        },

        beforeEnter: function(action) {
            var data = {};
            data[action] = true;
            this.model.set('action_list', data);
        },

        reply: function() {
            var TweetReply = require('./tweet-reply');
            var tweetReply = new TweetReply({
                model: this.model.clone()
            });
            tweetReply.show();
        },

        repost: function() {
            var text = '//@' + this.model.get('user').name + ':' + this.model.get('text');
            this.trigger('repost', text);
        }
    });
});
