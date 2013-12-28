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
        __onRefresh: function(options) {
            var uidOrName = options.params[0];
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data = {};
            this.options.data[type] = uidOrName;
        },
        initialize: function() {
            this.collection = new UserStatuses();
            this.options = {};
            this.__item = StreamItem;
            UserTimelineModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return UserTimelineModule;
});
