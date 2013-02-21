define(function(require, exports) {

    var tpl = require('../views/profile-card.tpl');
    var UserModel = require('../models/user');

    var ProfileCardModule = Backbone.Module.extend({
        name: 'profile-card',
        template: tpl,
        beforeEnter: function(uidOrName) {
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data[type] = uidOrName;
        },
        initialize: function() {
            this.model = new UserModel();
            ProfileCardModule.__super__['initialize'].apply(this, arguments);
        }
    });


    return {
      main: ProfileCardModule,
      args: {
        data: {}
      }
    };
});
