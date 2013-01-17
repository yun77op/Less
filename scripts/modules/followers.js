define(function(require, exports) {

    var StreamModel = require('../models/stream.js');
    var tpl = require('../views/users.tpl');

    var UserTimelineModel = StreamModel.extend({
        url: 'statuses/user_timeline.json'
    });

    var UserTimelineModule = Backbone.Module.extend({
        name: 'followers',
        template: tpl,
        enter: function(uid) {
            this.options.data.uid = uid;
        },
        initialize: function() {
            this.model = new UserTimelineModule();
            UserTimelineModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return {
        main: UserTimelineModule,
        args: {
            data: {}
        }
    });
});
