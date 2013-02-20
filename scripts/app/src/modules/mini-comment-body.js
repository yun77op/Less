define(function(require) {
    var tpl = require('../views/mini-comment-body.tpl');
    var MiniRepostBody = require('./mini-repost-body');

    return MiniRepostBody.extend({
        name: 'mini-comment-body',
        template: tpl,
        fetch: function(page) {
            this.options.data.page = page;
            this.refresh('reply');
        }
    });
});
