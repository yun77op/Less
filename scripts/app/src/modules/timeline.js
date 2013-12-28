define(function(require, exports) {
    var tpl = require('../views/timeline.tpl');

    var TimelineModule = Backbone.Module.extend({
        initialize: function(options) {
          this.options = {};
          this.options.cursor = options.cursor || 'maxid';

          var self = this;

          _.bindAll(this, '_handleScroll');

          document.addEventListener('scroll', this._handleScroll, false);

            this.collection.on('reset', function(collection) {
                var docFragment = document.createDocumentFragment();
                collection.each(function(model) {
                    model.url = null;
                    var mod = self.append(self.__item, docFragment, {model: model});
                    mod.__enter();
                });
                self.el.querySelector('.stream').appendChild(docFragment);
            });

            this.collection.on('add', function(model, collection, options) {
                var docFragment = document.createDocumentFragment();
                var position = options.position || 'append';
                var mod = self.append(self.__item, docFragment, { model: model });
                self.$el.find('.stream')[position](docFragment);
                mod.__enter();
            });

          TimelineModule.__super__.initialize.apply(this, arguments);
        },

        _handleScroll: function() {
            var body = document.body;
            var offset = 100;
            if (this._scrollFetching
                || window.innerHeight + body.scrollTop + offset < body.scrollHeight) return;

            var nextCursor = this.collection.getNextCursor();

            if (!nextCursor) return;
            var data = _.extend({}, this.options.data, nextCursor);

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

            this.collection.fetch(mergedOptions);
        },

        render: function() {
            var self = this;
            this.$el.html(tpl);
            this.collection.fetch({
                data: this.options.data
            });
            return this;
        },

        destroy: function() {
            document.removeEventListener('scroll', this._handleScroll, false);
            TimelineModule.__super__.destroy.apply(this, arguments);
        }

    });

    return TimelineModule;

});
