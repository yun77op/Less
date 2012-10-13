define(function (require, exports) {
    var TweetModalModule = require('./tweet-modal');

    var TweetRepostModule = TweetModalModule.extend({
        initialize: function() {
            this.model.set({
                title: chrome.i18n.getMessage('statusRepostTitle'),
                comment: [
                    chrome.i18n.getMessage('commentTo', this.model.get('username')),
                    chrome.i18n.getMessage('commentTo', this.model.get('ori_username'))
                ]
            });
            TweetRepostModule.__super__['initialize'].apply(this, arguments);
        },

        getTextareaValue: function() {
            return '//@' + this.model.get('username') + ':' + this.model.get('text');
        }
    });

    return TweetRepostModule;
});