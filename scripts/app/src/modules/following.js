define(function(require, exports) {

    var UsersModel = require('../models/users.js');
    var tpl = require('../views/users.tpl');
    var TimelineModule = require('./timeline.js');
    var StreamItem = require('./user.js');

    var FriendsModel = UsersModel.extend({
        url: 'friendships/friends.json'
    });

    var FollowingModule = TimelineModule.extend({
        name: 'followings',
        template: tpl,
        __onRefresh: function(options) {
            var uidOrName = options.params[0];
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data = {};
            this.options.data[type] = uidOrName;
        },
        initialize: function() {
            this.collection = new FriendsModel();
            this.options = {};
            this.__item = StreamItem;
            FollowingModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return FollowingModule;
});
