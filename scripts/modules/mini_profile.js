define(function(require, exports) {

    var tpl = require('../views/mini_profile.tpl');
    var SignedUserModel = require('../models/signed-user');

    var MiniProfileModule = Backbone.Module.extend({
        name: 'mini-profile',
        className: 'module',
        template: tpl,
        placeholder: 'Loading..',
        initialize: function() {
            this.model = new SignedUserModel();
            MiniProfileModule.__super__['initialize'].apply(this, arguments);
        }
    });


    return {
        main: MiniProfileModule,
        args: {
            data: {
                uid: localStorage.uid
            }
        }
    };
});
