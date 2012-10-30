define(function(require, exports) {

    var tpl = require('../views/relationship-action.tpl');
    var weibo = require('../weibo');

    var RelationshipActionModule = Backbone.Module.extend({
        name: 'relationship-action',

        template: tpl,

        syncOnStart: false,

        events: {
            'click .action-unfollow': 'unfollow',
            'click .action-follow': 'follow'
        },

        unfollow: function(e) {
            e.preventDefault();

            weibo.request({
                method: 'POST',
                path: 'friendships/destory.json',
                params: {
                    uid: this.model.attributes.id
                }
            }, function() {
                var $btn = $(e.currentTarget).parent();
                $btn.removeClass('following');
            });
        },

        follow: function(e) {
            e.preventDefault();

            weibo.request({
                method: 'POST',
                path: 'friendships/create.json',
                params: {
                    uid: this.model.attributes.id
                }
            }, function() {
                var $btn = $(e.currentTarget).parent();
                $btn.addClass('following');
            });
        }
    });

    return RelationshipActionModule;
});