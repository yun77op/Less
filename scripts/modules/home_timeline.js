define(function(require, exports) {

    var StreamModule = require('./stream.js');
    var StreamModuleModel = require('../models/stream.js');

    var HomeTimelineModule = StreamModule.extend({
        name: 'home-timeline',
        View: app.weibo.StreamItemTweetView
    });


    var homeTimelineModule = new HomeTimelineModule({
        model: new StreamModuleModel({
            url: 'statuses/home_timeline.json',
            key: 'statuses'
        })
    });

    return homeTimelineModule;
});