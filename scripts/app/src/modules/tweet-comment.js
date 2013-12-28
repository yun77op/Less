define(function (require) {

    var TweetPublisherInline = require('./tweet-publisher-inline');
    var weibo = require('../weibo');

    var TweetComment = TweetPublisherInline.extend({
        name: 'tweet-comment',

        url: 'comments/create.json',

        __onRefresh: function() {
            this.model.set({
                repost: chrome.i18n.getMessage('repostToMyTimeline')
            });

            if (this.model.get('retweeted_status')) {
                this.model.set({
                    comment_ori: true,
                    ori_username: chrome.i18n.getMessage('commentToOrigin', this.model.get('retweeted_status').user.name)
                });
            }
        },

        getParameters: function() {
            var commentOriEl = this.el.querySelector('.js-commentOrigin')
              , commentOri = commentOriEl && commentOriEl.checked
              , status = this.getTextareaValue();

            var params = {
              id: this.model.get('id')
            };

            if (this.el.querySelector('.js-repost').checked) {
              this.url = 'statuses/repost.json';
              params.status = status;
              params.is_comment = commentOri ? 2 : 1;
            } else {
              this.url = 'comments/create.json';
              params.comment = status;

              if (commentOri) {
                params.comment_ori = commentOri ? 1 : 0;
              }
            }

            return params;
        }
    });

    return TweetComment;
});
