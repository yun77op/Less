define(function (require) {

    var tpl = require('../views/mini-stream-item.tpl');

    var MiniStreamItemModule = Backbone.Module.extend({
        name: 'mini-stream-item',

        className:'stream-item',

        template: tpl,

        events:{
            'click .action-reply': 'reply'
        },

        reply: function() {
            var TweetReplyModule = require('./tweet-reply');
            var tweetReplyModule = new TweetReplyModule({
                model: this.model.clone()
            });

            tweetReplyModule.show();
        }

    });

    return MiniStreamItemModule;

});