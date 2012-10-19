define(function(require, exports) {

    var StreamModel = require('../models/stream.js');
    var tpl = require('../views/user-timeline.tpl');

    var UserTimelineModel = StreamModel.extend({
        url: 'statuses/user_timeline.json'
    });

    var UserTimelineModule = Backbone.Module.extend({
        name: 'followers',
        template: tpl,
        enter: function(uid) {
            this.options.data.uid = uid;
        }
    });

    return new UserTimelineModule({
        model: new UserTimelineModel(),
        data: {}
    });
});