define(function(require, exports) {
    var tpl = require('../views/comments-timeline.tpl');
    var slice = Array.prototype.slice;
    var Comment = require('./comment');
    var CommentModel = require('../models/user-comments');
    var TimelineModule = require('./timeline.js');

    var CommentsTimelineModule = TimelineModule.extend({
        name: 'comments-timeline',
        initialize: function() {
            this.collection = new CommentModel();
            this.__item = Comment;
            CommentsTimelineModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return CommentsTimelineModule;
});