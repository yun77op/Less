define(function(require) {
    var tpl = require('../views/mini-comment-body.tpl');
    var MiniRepostBody = require('./mini-repost-body');
    var Comments = require('../models/comments');

    var MiniCommentBody = MiniRepostBody.extend({
        name: 'mini-comment-body',
        template: tpl,
        collection: new Comments(),
        initialize: function() {
            MiniCommentBody.__super__.initialize.apply(this, arguments);
            this.__action = 'reply';
        }
    });

    return MiniCommentBody;
});
