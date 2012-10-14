define(function (require) {
    var StreamModel = require('../models/stream');
    var MiniCommentRepostListModule = require('./mini-comment-repost-list');

    var CommentsModel = StreamModel.extend({
        url: 'comments/show.json'
    });

    var MiniCommentListModule = MiniCommentRepostListModule.extend({
        name: 'min-comment-list',
        model: CommentsModel
    });

    return MiniCommentListModule;
});