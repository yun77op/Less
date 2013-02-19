define(function(require, exports) {
    var tpl = require('../views/comments-timeline.tpl');
    var slice = Array.prototype.slice;
    var StreamItem = require('./comment');
    var Comments = require('../models/user-comments');
    var TimelineModule = require('./timeline.js');

    var CommentsTimelineModule = TimelineModule.extend({
        name: 'comments-timeline',
        template: tpl,
        StreamItem: StreamItem,
        initialize: function() {
            var args = slice.call(arguments);
            this.model = new Comments();
            CommentsTimelineModule.__super__['initialize'].apply(this, args);
        }
    });

    return {
        main: CommentsTimelineModule
    };
})
