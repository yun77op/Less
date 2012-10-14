define(function (require, exports) {
    var TweetModalModule = require('./tweet-modal');

    var TweetCommentModule = TweetModalModule.extend({
        url: 'comments/create.json',

        initialize: function() {
            this.model.set({
                title: chrome.i18n.getMessage('statusCommentTitle', this.model.get('user').name)
            });

            if (this.model.get('retweeted_status')) {
                this.model.set({
                    ori_username: chrome.i18n.getMessage('commentToOrigin', this.model.get('retweeted_status').user.name)
                });
            }

            TweetCommentModule.__super__['initialize'].apply(this, arguments);
        },

        getParameters: function() {
            var params = {
                id: this.model.get('id'),
                comment: this.getTextareaValue()
            };

            if (this.model.retweeted_status) {
                params.comment_ori = el.querySelector('#status-commentOrigin').checked ? 1 : 0;
            }

            return params;
        }
    });

    return TweetCommentModule;
});