define(function(require, exports) {

    var tpl = require('../views/mini_profile.tpl');
    var StreamModuleModel = require('../models/stream.js');

    var MiniProfileModule = Backbone.Module.extend({
        name: 'mini-profile',
        className: 'module',
        template: tpl
    });

    var miniProfileModule = new MiniProfileModule({
        model: new StreamModuleModel({
            url: 'users/show.json',
            urlParams: {
                uid: localStorage['uid']
            }
        }),
        placeholder: 'Loading..'
    });

    return miniProfileModule;
});