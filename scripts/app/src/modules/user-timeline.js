define(function(require) {

    var tpl = require('../views/user-timeline.tpl');
    var Statuses = require('../models/statuses');
    var StreamItem = require('./stream-item');
    var TimelineModule = require('./timeline.js');

    var UserStatuses = Statuses.extend({
        url: 'statuses/user_timeline.json'
    });

    var UserTimelineModule = TimelineModule.extend({
        name: 'user-timeline',
        template: tpl,
        StreamItem: StreamItem,
        beforeEnter: function(uid) {
            this.options.data.uid = uid;
        },
        initialize: function() {
            this.model = new UserStatuses();
            UserTimelineModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return {
        main: UserTimelineModule,
        args: {
            data: {}
        }
    };
});
