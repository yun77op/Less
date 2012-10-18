define(function (require) {

    var MiniCommentRepostListModule = require('./mini-comment-repost-list');

    var MiniCommentListModule = MiniCommentRepostListModule.extend({
        name: 'min-comment-list'
    });

    return MiniCommentListModule;
});