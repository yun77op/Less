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
            document.onscroll = this._handleScroll.bind(this);
            HomeTimelineModule.__super__['initialize'].apply(this, args);
        },
        _handleScroll: function() {
            var body = document.body;
            var offset = 100;
            if (this._scrollFetching || window.innerHeight + body.scrollTop + offset < body.scrollHeight) return;

            var options = {
                data: {
                    max_id: this.model.last().id
                },
                success: function() {
                    this._scrollFetching = false;
                }.bind(this)
            };

            this._scrollFetching = true;
            this.fetch(options);
        },
        _handleUnread: function(count) {
            this.$unreadCount.text('有 ' + count + ' 条新微博，点击查看').show();
        },
        addOne: function(status, coll, options) {
            var $status = new StreamItem({ model: status }).render().$el;
            var position = options.position || 'append';
            this.$el.find('.stream')[position]($status);
        },

        _renderUnread: function() {
            this.fetch({
                data: { since_id: this.model.first().id },
                position: 'prepend'
            });
        },
        fetch: function(options) {
            this.$unreadCount.hide();

            var mergedOptions = _.extend({}, options, {
                add: true
            });

            this.model.fetch(mergedOptions);
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