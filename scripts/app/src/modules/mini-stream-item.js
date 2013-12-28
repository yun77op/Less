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

        __onRefresh: function(options) {
            var data = {};
            data[options.action] = true;
            this.model.set('action_list', data);
        },

        reply: function() {
            var TweetReply = require('./tweet-reply');
            var model = this.model.clone();
            model.url = null;
            var tweetReply = new TweetReply({
                model: model
            });
            tweetReply.show();
        },

        repost: function() {
            var text = '//@' + this.model.get('user').name + ':' + this.model.get('text');
            this.trigger('repost', text);
        }
    });
});
