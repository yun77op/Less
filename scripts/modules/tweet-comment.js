define(function (require) {
    var TweetPublisherInline = require('./tweet-publisher-inline');

    var TweetComment = TweetPublisherInline.extend({
        name: 'tweet-comment',

        url: 'comments/create.json',

        beforeEnter: function() {
            this.model.set({
                repost: 'ksdkf'
            });

            if (this.model.get('retweeted_status')) {
                this.model.set({
                    comment_ori: true,
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
                params.comment_ori = el.querySelector('.js-commentOrigin').checked ? 1 : 0;
            }

            return params;
        }
    });

    return TweetComment;
});
