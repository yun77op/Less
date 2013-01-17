define(function(require) {
    var tpl = require('../views/mini-comment-body.tpl');

    return Backbone.Module.extend({
        name: 'mini-comment-body',
        tagName: 'ul',
        template: tpl
    });
});