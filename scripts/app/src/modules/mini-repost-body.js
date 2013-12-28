define(function(require) {
    var tpl = require('../views/mini-repost-body.tpl');
    var loadingBlock = require('../views/loading.tpl');
    var MiniStreamItem = require('./mini-stream-item');
    var Reposts = require('../models/reposts');

    var MiniRepostBody = Backbone.Module.extend({
        name: 'mini-repost-body',
        tagName: 'ul',
        placeholder: loadingBlock,

        collection: new Reposts(),
        initialize: function() {
            MiniRepostBody.__super__.initialize.apply(this, arguments);

            var self = this;

            this.__item = MiniStreamItem;
            this.__action = 'repost';

            this.collection.on('reset', function(collection) {
                var docFragment = document.createDocumentFragment();
                collection.each(function(model) {
                    model.url = null;
                    var mod = self.append(self.__item, docFragment, { model: model });
                    mod.__enter({ action: self.__action });
                });

                self.$el.empty();
                self.el.appendChild(docFragment);

                self.trigger('fetch', self.options.data.page, self.collection.total_number);
            });

            this.collection.on('add', function(model) {
                var mod = self.append(self.__item, self.el, { model: model });
                mod.__enter();
            });
        },

        __setupCollectionEvent: function() {

        },

        render: function() {
            var self = this;
            this.collection.fetch({
                data: this.options.data
            });
            return this;
        },

        fetch: function(page) {
            this.options.data.page = page;
            this.render();
        }
    });

    return MiniRepostBody;
});
