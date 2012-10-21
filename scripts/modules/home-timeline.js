define(function(require, exports) {

    var StreamModel = require('../models/stream.js');
    var Reminder = require('../reminder.js');
    var tpl = require('../views/home-timeline.tpl');

    var HomeTimelineModel = StreamModel.extend({
        url: 'statuses/home_timeline.json'
    });

    var HomeTimelineModule = Backbone.Module.extend({
        name: 'home-timeline',
        template: tpl,
        initialize: function() {
            Reminder.on('status', this._handleUnread, this);
            HomeTimelineModule.__super__['initialize'].apply(this, arguments);
        },
        _handleUnread: function() {

        }
    });

    return new HomeTimelineModule({
        model: new HomeTimelineModel()
    });
});