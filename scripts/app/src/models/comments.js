define(function (require) {

    var StreamModel = require('../models/stream');

    var CommentsModel = StreamModel.extend({

        url: 'comments/show.json',

        parse: function(resp) {
            this.total_number = resp.total_number;
            return resp.comments;
        }
    });

    return CommentsModel;
});
