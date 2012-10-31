define(function(require) {

    var tpl = require('../views/user-timeline.tpl');
    var Statuses = require('../models/statuses');

    var UserStatuses = Statuses.extend({
        url: 'statuses/user_timeline.json'
    });

    var UserTimelineModule = Backbone.Module.extend({
        name: 'user-timeline',
        template: tpl,
        beforeEnter: function(uid) {
            this.options.data.uid = uid;
        }
    });

    return new UserTimelineModule({
        model: new UserStatuses(),
        data: {}
    });
});