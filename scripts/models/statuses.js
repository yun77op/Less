define(function(require, exports) {
    var StreamModel = require('./stream.js');

    var Statuses = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Backbone.Model,

        url: 'statuses/home_timeline.json',

        fetch: function(options) {
            options = options ? _.clone(options) : {};
            if (options.parse === undefined) options.parse = true;
            var collection = this;
            var success = options.success;
            options.success = function(resp, status, xhr) {
                collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr)['statuses'], options);
                if (success) success(collection, resp);
            };
            options.error = Backbone.wrapError(options.error, collection, options);
            return (this.sync || Backbone.sync).call(this, 'read', this, options);
        },

        comparator: function( statusA, statusB ) {
            return statusB.get('id') - statusA.get('id');
        },

        sync: StreamModel.prototype.sync
    });

    return Statuses;
});
