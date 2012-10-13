define(function (require, exports) {
    var TweetModalModule = require('./tweet-modal');

    var TweetReplyModule = TweetModalModule.extend({
        initialize: function() {
            this.model.set({
                title: chrome.i18n.getMessage('statusReplyTitle', this.model.get('username'))
            });
            TweetReplyModule.__super__['initialize'].apply(this, arguments);
        },

        getTextareaValue: function() {
            return chrome.i18n.getMessage('reply') + '@' + this.model.get('username') + ':';
        }
    });

    return TweetReplyModule;
});