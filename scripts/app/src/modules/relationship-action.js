define(function(require, exports) {

    var tpl = require('../views/relationship-action.tpl');
    var weibo = require('../weibo');

    var RelationshipActionModule = Backbone.Module.extend({
        name: 'relationship-action',

        template: tpl,

        events: {
            'click .action-unfollow': 'unfollow',
            'click .action-follow': 'follow'
        },

        initialize: function(options) {
            this.model = new Backbone.Model(options);
            this.model.url = null;
            RelationshipActionModule.__super__.initialize.apply(this, arguments);
        },

        unfollow: function(e) {
            e.preventDefault();

            weibo.request({
                method: 'POST',
                path: 'friendships/destroy.json',
                params: {
                    uid: this.model.get('user_id')
                }
            }, function() {
                var $container = $(e.currentTarget).parents('.relationship-container');
                $container.removeClass('following');
            });
        },

        follow: function(e) {
            e.preventDefault();

            weibo.request({
                method: 'POST',
                path: 'friendships/create.json',
                params: {
                    uid: this.model.get('user_id')
                }
            }, function() {
                var $container = $(e.currentTarget).parents('.relationship-container');
                $container.addClass('following');
            });
        }
    });

    return RelationshipActionModule;
});
