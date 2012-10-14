define(function (require, exports) {
    var TweetModalModule = require('./tweet-modal');

    var TweetReplyModule = TweetModalModule.extend({
        url: 'comments/reply.json',

        initialize: function() {
            this.model.set({
                title: chrome.i18n.getMessage('statusReplyTitle', this.model.get('username'))
            });
            TweetReplyModule.__super__['initialize'].apply(this, arguments);
        },

        getTextareaQuote: function() {
            return chrome.i18n.getMessage('reply') + '@' + this.model.get('username') + ':';
        },

        getParameters: function() {
            var parameters = {
                comment: this.getTextareaValue(),
                cid: this.model.get('cid'),
                id: this.model.get('id')
            };

            return parameters;
        }
    });

    return TweetReplyModule;
});