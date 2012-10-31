define(function(require, exports) {

    var Reminder = require('../reminder.js');
    var tpl = require('../views/home-timeline.tpl');
    var slice = Array.prototype.slice;
    var StreamItem = require('./stream-item');
    var Statuses = require('../models/statuses');

    var HomeTimelineModule = Backbone.Module.extend({
        name: 'home-timeline',
        template: tpl,
        events: {
            'click .status-unread-count': '_renderUnread'
        },
        initialize: function() {
            var args = slice.call(arguments);
            Reminder.on('status', this._handleUnread, this);

            this.onReady(function() {
                this.$unreadCount = this.$el.find('.status-unread-count');
            });

            this.model.on( 'add', this.addOne, this );

            HomeTimelineModule.__super__['initialize'].apply(this, args);
        },
        _handleUnread: function(count) {
            this.$unreadCount.text('有 ' + count + ' 条新微博，点击查看').show();
        },
        addOne: function(status) {
            var $status = new StreamItem({ model: status }).render().$el;
            this.$el.find('.stream').prepend($status);
        },
        _renderUnread: function() {
            this.$unreadCount.hide();

            var data = _.extend({}, this.options.data, { since_id: this.model.at(0).id });
            var options = {
                data: data,
                add: true
            };
            this.model.fetch(options);
        },
        destroy: function() {
            Reminder.off('status', this._handleUnread);
            HomeTimelineModule.__super__['destroy'].apply(this, arguments);
        }
    });

    return new HomeTimelineModule({
        model: new Statuses()
    });
});