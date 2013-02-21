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
        beforeEnter: function(uidOrName) {
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data[type] = uidOrName;
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
