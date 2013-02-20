define(function(require, exports) {
    var StreamModel = require('./stream.js');

    var Comments = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Backbone.Model,

        url: 'comments/timeline.json',

        parse: function(resp, xhr) {
          return resp['comments'];
        },

        sync: StreamModel.prototype.sync
    });

    return Comments;
});
