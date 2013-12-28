define(function(require) {

    var Statuses = require('../models/statuses');
    var StreamItem = require('./stream-item');
    var TimelineModule = require('./timeline.js');

    var Mentions = Statuses.extend({
        url: 'statuses/mentions.json'
    });

    var MentionsModule = TimelineModule.extend({
        name: 'mentions-timeline',

        initialize: function() {
            this.collection = new Mentions();
            this.__item = StreamItem;
            MentionsModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return MentionsModule;
});
