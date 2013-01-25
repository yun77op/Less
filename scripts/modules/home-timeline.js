define(function(require, exports) {

    var Reminder = require('../reminder.js');
    var tpl = require('../views/home-timeline.tpl');
    var slice = Array.prototype.slice;
    var StreamItem = require('./stream-item');
    var Statuses = require('../models/statuses');
    var TimelineModule = require('./timeline.js');

    var HomeTimelineModule = TimelineModule.extend({
        name: 'home-timeline',
        template: tpl,
        StreamItem: StreamItem,
        events: {
            'click .status-unread-count': '_renderUnread'
        },
        initialize: function() {
            var args = slice.call(arguments);
            Reminder.on('status', this._handleUnread, this);

            this.model = new Statuses();

            this.onReady(function() {
                this.$unreadCount = this.$el.find('.status-unread-count');
            });

            HomeTimelineModule.__super__['initialize'].apply(this, args);
        },

        _handleUnread: function(count) {
            this.$unreadCount.text('有 ' + count + ' 条新微博，点击查看').show();
        },

        _renderUnread: function() {
            this.$unreadCount.hide();

            this.fetch({
                data: { since_id: this.model.first().id },
                position: 'prepend'
            });
        },

        destroy: function() {
            Reminder.off('status', this._handleUnread, this);
            HomeTimelineModule.__super__['destroy'].apply(this, arguments);
        }
    });

    return {
        main: HomeTimelineModule
    };
});
