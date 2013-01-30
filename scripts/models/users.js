define(function(require, exports) {
    var StreamModel = require('./stream.js');

    var Users = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Backbone.Model,

        parse: function(resp, xhr) {
          return resp['users'];
        },

        sync: StreamModel.prototype.sync
    });

    return Users;
});
