define(function(require) {

    var tpl = require('../views/user-timeline.tpl');
    var Statuses = require('../models/statuses');
    var StreamItem = require('./stream-item');
    var TimelineModule = require('./timeline.js');

    var Mentions = Statuses.extend({
        url: 'statuses/mentions.json'
    });

    var MentionsModule = TimelineModule.extend({
        name: 'mentions',
        template: tpl,
        StreamItem: StreamItem,
        initialize: function() {
            this.model = new Mentions();
            MentionsModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return {
        main: MentionsModule,
        args: {
            data: {}
        }
    };
});
