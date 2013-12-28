define(function(require, exports) {

    var tpl = require('../views/mini_profile.tpl');
    var SignedUserModel = require('../models/signed-user');

    var MiniProfileModule = Backbone.Module.extend({
        name: 'mini-profile',
        className: 'module',
        placeholder: 'Loading..',
        template: tpl,
        initialize: function() {
            this.model = new SignedUserModel();
            this.options = {};
            this.options.data = {
                uid: localStorage.getItem('uid')
            };
            MiniProfileModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return MiniProfileModule;
});
