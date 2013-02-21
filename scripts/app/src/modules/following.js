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
        beforeEnter: function(uidOrName) {
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data[type] = uidOrName;
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
