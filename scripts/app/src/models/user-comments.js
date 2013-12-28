define(function(require, exports) {
    var StreamModel = require('./stream.js');
    var Statuses = require('./statuses');

    return Statuses.extend({

        url: 'comments/timeline.json',

        parse: function(resp, xhr) {
          return resp.comments;
        }
    });
});
