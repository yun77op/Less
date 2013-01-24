define(function(require, exports) {

    var StreamModel = require('../models/stream.js');
    var tpl = require('../views/users.tpl');

    var Followers = StreamModel.extend({
        url: 'friendships/followers.json'
    });

    var UserTimelineModule = Backbone.Module.extend({
        name: 'followers',
        template: tpl,
        beforeEnter: function(uid) {
            this.options.data.uid = uid;
        },
        initialize: function() {
            this.model = new Followers();
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
