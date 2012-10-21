define(function(require) {

    var tpl = require('../views/profile-nav.tpl');

    var ProfileNavModule = Backbone.Module.extend({
        name: 'profile-nav',

        template: tpl,

        syncOnStart: false,

        initialize: function() {
            this.on('nav', this._changeNavStatus, this);
            ProfileNavModule.__super__['initialize'].apply(this, arguments);
        },

        enter: function(uid) {
            this.model.set({ id: uid });
        },

        _changeNavStatus: function(nav_val) {
            var activeClassName = 'active';
            var $target = $('li[data-nav=' + nav_val + ']', this.$el).addClass(activeClassName);
            $target.siblings().removeClass(activeClassName);
        }
    });

    return new ProfileNavModule({
        model: new Backbone.Model()
    });
});