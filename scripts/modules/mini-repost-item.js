define(function (require) {

    var tpl = require('../views/mini-stream-item.tpl');

    return Backbone.Module.extend({
        name: 'mini-repost-item',

        className:'stream-item',

        tagName: 'li',

        template: tpl,

        events: {
            'click .action-repost': 'repost'
        },

        beforeEnter: function() {
            this.model.set('action_list', {
                repost: true
            })
        },

        repost: function() {

        }

    });

});