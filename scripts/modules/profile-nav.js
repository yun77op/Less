define(function(require) {

    var tpl = require('../views/profile-nav.tpl');

    return Backbone.Module.extend({
        name: 'profile-nav',

        template: tpl,

        beforeEnter: function(uid) {
            this.on('nav', this._changeNavStatus, this);
            this.model.set({ id: uid });
        },

        _changeNavStatus: function(nav_val) {
            var activeClassName = 'active';
            var $target = $('li[data-nav=' + nav_val + ']', this.$el).addClass(activeClassName);
            $target.siblings().removeClass(activeClassName);
        }
    });
});