define(function (require) {

    var tpl = require('../views/mini-stream-item.tpl');

    return Backbone.Module.extend({
        name: 'mini-stream-item',

        className:'stream-item',

        tagName: 'li',

        template: tpl,

        events: {
            'click .action-reply': 'reply'
        },

        reply: function() {
            var TweetReplyModule = require('./tweet-reply');
            console.log(this.model.attributes);
            var tweetReplyModule = new TweetReplyModule({
                model: this.model.clone()
            });

            tweetReplyModule.show();
        }

    });

});