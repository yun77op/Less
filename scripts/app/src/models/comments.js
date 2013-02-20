define(function (require) {

    var StreamModel = require('../models/stream');
    var CommentsModel = StreamModel.extend({
        url: 'comments/show.json'
    });

    return CommentsModel;
});
