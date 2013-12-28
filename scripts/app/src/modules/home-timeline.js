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
        events: {
            'click .status-unread-count': '_renderUnread'
        },

        initialize: function() {
            Reminder.on('status', this._handleUnread, this);

            this.__item = StreamItem;
            this.collection = new Statuses();

            HomeTimelineModule.__super__['initialize'].apply(this, arguments);
        },
        render: function() {
            var self = this;
            this.$el.html(tpl);
            this.collection.fetch({
                success: function(collection, data) {

                }
            });
            this.$unreadCount = this.$el.find('.status-unread-count');
            return this;
        },
        _handleUnread: function(count) {
            this.$unreadCount.text('有 ' + count + ' 条新微博，点击查看').show();
        },

        _renderUnread: function() {
            this.$unreadCount.hide();

            this.fetch({
                data: { since_id: this.collection.first().id },
                position: 'prepend'
            });
        },

        destroy: function() {
            Reminder.off('status', this._handleUnread, this);
            HomeTimelineModule.__super__['destroy'].apply(this, arguments);
        }
    });

    return HomeTimelineModule;
});
