define(function (require, exports) {
    var TweetBase = require('./tweet');

    var TweetComment = TweetBase.extend({
        name: 'tweet-comment',

        url: 'comments/create.json',

        beforeEnter: function() {
            if (this.model.get('retweeted_status')) {
                this.model.set({
                    ori_username: chrome.i18n.getMessage('commentToOrigin', this.model.get('retweeted_status').user.name)
                });
            }
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

    return TweetComment;
});