define(function(require, exports) {

    var tpl = require('../views/profile-card.tpl');
    var UserModel = require('../models/user');

    var ProfileCardModule = Backbone.Module.extend({
        name: 'profile-card',
        template: tpl,
        beforeEnter: function(uid) {
            this.options.data.uid = uid;
        }
    });


    var profileCardModule = new ProfileCardModule({
        model: new UserModel(),
        data: {}
    });

    return profileCardModule;
});