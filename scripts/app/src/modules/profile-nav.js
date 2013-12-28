define(function(require) {

    var tpl = require('../views/profile-nav.tpl');

    var ProfileNav = Backbone.Module.extend({
        name: 'profile-nav',

        template: tpl,

        initialize: function() {
            this.model = new Backbone.Model();
            this.model.url = null;
            ProfileNav.__super__['initialize'].apply(this, arguments);
        },

        __onRefresh: function(options) {
            var uid = options.params[0];
            var nav = options.path.split('/')[2] || 'timeline';

            var prevId = this.model.get('id');

            if (prevId && prevId !== uid) {
                this.__activeNav = 'timeline';
                this.render({force: true});
                return;
            } else if (typeof this.__activeNav !== 'undefined') {
                this.__setupNav(nav);
            }

            this.model.set({id: uid});
            this.__activeNav = nav;
            this.__id = uid;
        },

        render: function() {
            ProfileNav.__super__.render.apply(this, arguments);
            this.__setupNav(this.__activeNav);
        },

        __setupNav: function(nav) {
            var activeClassName = 'active';
            var $target = $('li[data-nav=' + nav + ']', this.$el).addClass(activeClassName);
            $target.siblings().removeClass(activeClassName);
        }
    });

    return ProfileNav;
});