define(function(require, exports) {

    var TimelineModule = Backbone.Module.extend({
        initialize: function() {
          this.onReady(function() {
              document.addEventListener('scroll', this._handleScroll, false);
          });

          this.unreadQueue = [];
          this.model.on( 'add', this.queueUnread, this );
          _.bindAll(this, 'addUnread', '_handleScroll');

          this.options.cursor = this.options.cursor || 'maxid';

          var self = this;
          if (this.options.cursor == 'cursor') {
            var parse = this.model.parse;
            this.model.parse = function(resp, xhr) {
              self.next_cursor = resp.next_cursor;
              return parse.apply(this, arguments);
            };
          }

          TimelineModule.__super__.initialize.apply(this, arguments);
        },

        _handleScroll: function() {
            var body = document.body;
            var offset = 100;
            if (this._scrollFetching
                || window.innerHeight + body.scrollTop + offset < body.scrollHeight) return;

            var cursorMap = {
                'cursor': { cursor: this.next_cursor },
                'maxid': { max_id: this.model.last().id }
            };

            var data = _.extend({}, this.options.data, cursorMap[this.options.cursor]);

            var options = {
                data: data,
                success: function() {
                    this._scrollFetching = false;
                }.bind(this)
            };

            this._scrollFetching = true;
            this.fetch(options);
        },

        fetch: function(options) {
            var mergedOptions = _.extend({}, options, {
                add: true
            });

            this.model.fetch(mergedOptions);
        },

        queueUnread: function(status, coll, options) {
            status.url = null;
            this.unreadQueue.push(status);
            if (!this.unreadTimeout) {
                setTimeout(this.addUnread, 0);
                this.unreadQueueOptions = options;
                this.unreadTimeout = true;
            }
        },

        addUnread: function() {
            var docFragment = document.createDocumentFragment();
            var StreamItem = this.StreamItem;
            this.unreadQueue.forEach(function(status) {
                var el = new StreamItem({ model: status }).render().el;
                docFragment.appendChild(el);
            });
            var position = this.unreadQueueOptions.position || 'append';
            this.$el.find('.stream')[position](docFragment);
            this.unreadQueue = [];
            this.unreadQueueOptions = null;
            this.unreadTimeout = false;
        },

        destroy: function() {
            document.removeEventListener('scroll', this._handleScroll, false);
            TimelineModule.__super__.destroy.apply(this, arguments);
        }

    });

    return TimelineModule;

});
