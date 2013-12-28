define(function (require) {
    var TweetPublisherInline = require('./tweet-publisher-inline');

    var TweetRepostModule = TweetPublisherInline.extend({
        name: 'tweet-repost',

        url: 'statuses/repost.json',

        __onRefresh: function() {
            if (this.model.get('retweeted_status')) {
                this.model.set({
                    comment_ori: true,
                    ori_username: chrome.i18n.getMessage('commentToOrigin', this.model.get('retweeted_status').user.name)
                });
            }

            this.model.set({
                comment: chrome.i18n.getMessage('commentTo', this.model.get('user').name)
            })
        },

        getTextareaQuote: function() {
            return '//@' + this.model.get('user').name + ':' + this.model.get('text');
        },

        getParameters: function() {
            var params = {
                id: this.model.get('id'),
                status: this.getTextareaValue()
            };

            var is_comment = 0;
            if (this.el.querySelector('.js-comment').checked) is_comment++;
            if (this.el.querySelector('.js-commentOrigin') &&
                this.el.querySelector('.js-commentOrigin').checked) is_comment++;
            params.is_comment = is_comment;

            return params;
        }
    });

    return TweetRepostModule;
});
