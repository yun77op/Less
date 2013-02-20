define(function(require) {
    var MiniRepostList = require('./mini-repost-list');

    var MiniCommentList = MiniRepostList.main.extend({
        name: 'mini-comment-list',
        getBodyModule: function() {
            var data = _.extend({}, this.options.data, {
                page: 1,
                id: this.model.get('id')
            });
            var Comments = require('../models/comments');
            var MiniCommentBody = require('./mini-comment-body');
            var options = {
                model: new Comments(),
                data: data
            }

            var module = new MiniCommentBody(options);

            return {
                main: module,
                args: ['reply']
            }
        }
    });

    return {
        main: MiniCommentList,
        args: {
            tweetModuleName: 'tweet-comment'
        }
    }

});
