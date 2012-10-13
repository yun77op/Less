define(function (require, exports) {
    var TweetModalModule = require('./tweet-modal');

    var TweetCommentModule = TweetModalModule.extend({
        initialize: function() {
            this.model.set({
                title: chrome.i18n.getMessage('statusCommentTitle', this.model.get('username')),
                comment_ori: chrome.i18n.getMessage('commentToOrigin', this.model.get('ori_username'))
            });
            TweetCommentModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return TweetCommentModule;
});