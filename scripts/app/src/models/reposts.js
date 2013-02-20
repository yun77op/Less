define(function (require) {
    var Stream = require('../models/stream');

    return Stream.extend({
        url: 'statuses/repost_timeline.json'
    });
});
