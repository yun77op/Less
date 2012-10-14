define(function(require, exports) {

    var tpl = require('../views/mini_profile.tpl');
    var StreamModel = require('../models/stream.js');

    var MiniProfileModule = Backbone.Module.extend({
        name: 'mini-profile',
        className: 'module',
        template: tpl
    });

    var UserModel = StreamModel.extend({
        url: 'users/show.json'
    });

    var miniProfileModule = new MiniProfileModule({
        model: new UserModel(),
        placeholder: 'Loading..',
        data: {
            uid: localStorage.uid
        }
    });

    return miniProfileModule;
});