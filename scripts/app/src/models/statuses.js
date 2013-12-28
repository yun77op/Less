define(function(require, exports) {
    var StreamModel = require('./stream.js');

    var Statuses = Backbone.Collection.extend({

        url: 'statuses/home_timeline.json',

        parse: function(resp, xhr) {
          return resp.statuses;
        },

        comparator: function( statusA, statusB ) {
            return statusB.get('id') - statusA.get('id');
        },

        sync: StreamModel.prototype.sync,

        getNextCursor: function() {
            return { max_id: this.last().id };
        }
    });

    return Statuses;
});
