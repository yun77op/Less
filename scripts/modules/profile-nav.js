define(function(require, exports) {

    var tpl = require('../views/profile-nav.tpl');

    var ProfileNavModule = Backbone.Module.extend({
        name: 'profile-nav',

        template: tpl,


        enter: function(uid) {
            this.model.set('urlParams', {
                uid: uid
            });
        },

        afterEnter: function() {
            var self = this;

//            new Backbone.Available(function() {
//                return self.active;
//            }, function() {
//                self.highlightTab();
//            });
        },

        events: {
            'click .nav-tabs li': 'handleTabClick'
        },

        highlightTab: function() {
            var fragment = Backbone.history.getFragment();
            var ary = fragment.split('/');
            var nav = 'tweets';

            if (ary.length == 3) nav = ary.pop();
            $('[data-nav="' + nav + '"]', this.$el).addClass('active');
        },

        handleTabClick: function(e) {
            var $el = $(e.currentTarget);
            var activeClassName = 'active';

            $el.siblings().removeClass(activeClassName);
            $el.addClass(activeClassName);
        }
    });

    return new ProfileNavModule({
        alone: true,
        model: new Backbone.Model()
    });
});