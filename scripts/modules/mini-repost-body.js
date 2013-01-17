define(function(require) {
    var tpl = require('../views/mini-repost-body.tpl');
    var loadingBlock = require('../views/loading.tpl');

    var MiniRepostBody = Backbone.Module.extend({
        name: 'mini-repost-body',
        tagName: 'ul',
        template: tpl,
        placeholder: loadingBlock,
        initialize: function() {
            this.onReady(function() {
                this.parent.trigger('fetch', this.options.data.page, this.model.get('total_number'));
            });
            MiniRepostBody.__super__.initialize.apply(this, arguments);
        }
    });

    return MiniRepostBody;
});