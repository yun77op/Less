define(function(require) {

    var tpl = require('../views/profile-nav.tpl');

    var ProfileNav = Backbone.Module.extend({
        name: 'profile-nav',

        template: tpl,

        initialize: function() {
            this.on('nav', this._changeNavStatus, this);
            ProfileNav.__super__['initialize'].apply(this, arguments);
        },

        beforeEnter: function(uid) {
            this.model.set({ id: uid });
        },

        _changeNavStatus: function(nav_val) {
            var activeClassName = 'active';
            var $target = $('li[data-nav=' + nav_val + ']', this.$el).addClass(activeClassName);
            $target.siblings().removeClass(activeClassName);
        }
    });

    return ProfileNav;
});
