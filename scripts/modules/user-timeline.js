define(function(require, exports) {

    var StreamModule = require('./stream.js');
    var StreamModuleModel = require('../models/stream.js');

    var UserTimelineModule = StreamModule.extend({
        name: 'user-timeline',
        View: app.weibo.StreamItemTweetView,
        enter: function(uid) {
            this.model.set('urlParams', {
                uid: uid
            });
        }
    });

    var userTimelineModule = new UserTimelineModule({
        model: new StreamModuleModel({
            url: 'statuses/user_timeline.json',
            key: 'statuses'
        })
    });

    return userTimelineModule;
});