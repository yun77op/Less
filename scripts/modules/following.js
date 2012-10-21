define(function(require, exports) {

    var StreamModel = require('../models/stream.js');
    var tpl = require('../views/users.tpl');

    var FriendsModel = StreamModel.extend({
        url: 'friendships/friends.json'
    });

    var FollowingModule = Backbone.Module.extend({
        name: 'followers',
        template: tpl,
        enter: function(uid) {
            this.options.data.uid = uid;
        }
    });

    return new FollowingModule({
        model: new FriendsModel(),
        data: {}
    });
});