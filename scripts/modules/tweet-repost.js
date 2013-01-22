define(function (require) {
    var TweetBase = require('./tweet');
    var tpl = require('../views/tweet-comment.tpl');

    var TweetRepostModule = TweetBase.extend({
        name: 'tweet-repost',

        url: 'statuses/repost.json',

        template: tpl,

        beforeEnter: function() {
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
            is_comment += this.el.querySelector('.js-comment').checked ? 1 : 0;
            is_comment += this.el.querySelector('.js-commentOrigin') &&
                          this.el.querySelector('.js-commentOrigin').checked ? 2 : 0;
            params.is_comment = is_comment;

            return params;
        }
    });

    return TweetRepostModule;
});
