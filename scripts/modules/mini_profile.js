define(function(require, exports) {

    var tpl = require('../views/mini_profile.tpl');
    var UserModel = require('../models/user');

    var MiniProfileModule = Backbone.Module.extend({
        name: 'mini-profile',
        className: 'module',
        template: tpl,
        placeholder: 'Loading..'
    });

    var miniProfileModule = new MiniProfileModule({
        model: new UserModel(),
        data: {
            uid: localStorage.uid
        }
    });

    return miniProfileModule;
});