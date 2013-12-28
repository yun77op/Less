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
        __onRefresh: function(options) {
            var uidOrName = options.params[0];
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data = {};
            this.options.data[type] = uidOrName;
        },
        initialize: function(options) {
            this.collection = new Followers();
            this.__item = StreamItem;
            FollowersModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return FollowersModule;
});
