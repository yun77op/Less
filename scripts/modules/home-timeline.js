define(function(require, exports) {

    var StreamModel = require('../models/stream.js');
    var tpl = require('../views/home-timeline.tpl');

    var HomeTimelineModule = Backbone.Module.extend({
        name: 'home-timeline',
        template: tpl
    });

    var HomeTimelineModel = StreamModel.extend({
        url: 'statuses/home_timeline.json'
    });

    return new HomeTimelineModule({
        model: new HomeTimelineModel()
    });
});