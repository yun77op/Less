define(function(require) {
    var MiniRepostList = require('./mini-repost-list');
    var TweetComment = require('./tweet-comment');
    var MiniCommentBody = require('./mini-comment-body');

    var MiniCommentList = MiniRepostList.extend({
        name: 'mini-comment-list',
        initialize: function() {
            MiniCommentList.__super__.initialize.apply(this, arguments);
            this.__textModule = TweetComment;
            this.__bodyModule = MiniCommentBody;
        }
    });

    return MiniCommentList;

});
