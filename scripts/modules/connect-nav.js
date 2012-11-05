define(function(require) {

    var tpl = require('../views/connect-nav.tpl');
    var ProfileNavModule = require('./profile-nav');

    return ProfileNavModule.extend({
        name: 'connect-nav',
        template: tpl
    });
});