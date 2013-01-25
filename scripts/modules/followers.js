define(function(require, exports) {

    var UsersModel = require('../models/users.js');
    var tpl = require('../views/users.tpl');
    var TimelineModule = require('./timeline.js');
    var StreamItem = require('./user.js');

    var Followers = UsersModel.extend({
        url: 'friendships/followers.json'
    });

    var FollowersModule = TimelineModule.extend({
        name: 'followers',
        template: tpl,
        StreamItem: StreamItem,
        beforeEnter: function(uid) {
            this.options.data.uid = uid;
        },
        initialize: function() {
            this.model = new Followers();
            FollowersModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return {
        main: FollowersModule,
        args: {
            data: {},
            cursor: 'cursor'
        }
    };
});
