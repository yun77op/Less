define(function(require) {

    var tpl = require('../views/connect-nav.tpl');
    var ProfileNavModule = require('./profile-nav');

    return ProfileNavModule.extend({
        name: 'connect-nav',

        template: tpl,

        __onRefresh: function(options) {
            var nav = options.path;
            if (typeof this.__activeNav !== 'undefined') {
                this.__setupNav(nav);
            }

            this.__activeNav = nav;
        }
    });
});