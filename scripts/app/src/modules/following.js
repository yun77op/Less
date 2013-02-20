define(function(require, exports) {

    var UsersModel = require('../models/users.js');
    var tpl = require('../views/users.tpl');
    var TimelineModule = require('./timeline.js');
    var StreamItem = require('./user.js');

    var FriendsModel = UsersModel.extend({
        url: 'friendships/friends.json'
    });

    var FollowingModule = TimelineModule.extend({
        name: 'following',
        template: tpl,
        StreamItem: StreamItem,
        beforeEnter: function(uid) {
            this.options.data.uid = uid;
        },
        initialize: function() {
            this.model = new FriendsModel();
            FollowingModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return {
        main: FollowingModule,
        args: {
            data: {},
            cursor: 'cursor'
        }
    };
});
