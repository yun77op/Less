define(function (require) {
    var Stream = require('../models/stream');

    return Stream.extend({
        url: 'statuses/repost_timeline.json',

        parse: function(resp) {
            this.total_number = resp.total_number;
            return resp.reposts;
        }
    });
});
