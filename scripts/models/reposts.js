define(function (require) {

    var StreamModel = require('../models/stream');
    var RepostsModel = StreamModel.extend({
        url: 'statuses/repost_timeline.json'
    });

    return RepostsModel;
});