define(function (require) {
    var TweetModalModule = require('./tweet-modal');

    var TweetRepostModule = TweetModalModule.extend({
        url: 'statuses/repost.json',

        initialize: function() {
            var comment = [chrome.i18n.getMessage('commentTo', this.model.get('user').name)];
            if (this.model.get('retweeted_status')) {
                comment.push(chrome.i18n.getMessage('commentTo', this.model.get('retweeted_status').user.name));
            }

            this.model.set({
                title: chrome.i18n.getMessage('statusRepostTitle'),
                comment: comment
            });
            TweetRepostModule.__super__['initialize'].apply(this, arguments);
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
            is_comment += el.querySelector('#status-comment').checked ? 1 : 0;
            is_comment += el.querySelector('#status-commentOrigin').checked ? 2 : 0;
            params.is_comment = is_comment;

            return params;
        }
    });

    return TweetRepostModule;
});