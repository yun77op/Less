define(function(require, exports) {
    var StreamModel = require('./stream.js');

    var Cursor = Backbone.Collection.extend({

        initialize: function() {
            this.__next_cursor = 0;
        },

        parse: function(resp, xhr) {
            this.__next_cursor = resp.next_cursor;
        },

        getNextCursor: function() {
            if (this.__next_cursor === 0) return null;
            return { cursor: this.__next_cursor };
        },

        sync: StreamModel.prototype.sync
    });

    return Cursor;
});
