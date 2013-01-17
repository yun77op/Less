define(function(require, exports) {

    var StreamModel = require('../models/stream.js');
    var tpl = require('../views/users.tpl');

    var FriendsModel = StreamModel.extend({
        url: 'friendships/friends.json'
    });

    var FollowingModule = Backbone.Module.extend({
        name: 'following',
        template: tpl,
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
            data: {}
        }
    };
});
