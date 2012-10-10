define(function(require, exports) {

    var StreamModuleModel = require('../models/stream.js');
    var tpl = require('../views/home-timeline.tpl');

    var HomeTimelineModule = Backbone.Module.extend({
        name: 'home-timeline',
        template: tpl
    });


    var homeTimelineModule = new HomeTimelineModule({
        model: new StreamModuleModel({
            url: 'statuses/home_timeline.json'
        })
    });

    return homeTimelineModule;
});