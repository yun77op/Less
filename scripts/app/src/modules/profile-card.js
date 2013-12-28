define(function(require, exports) {

    var tpl = require('../views/profile-card.tpl');
    var UserModel = require('../models/user');

    var ProfileCardModule = Backbone.Module.extend({
        name: 'profile-card',
        template: tpl,

        __onRefresh: function(options) {
            var uidOrName = options.params[0];
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data = {};
            this.options.data[type] = uidOrName;
            if (typeof this.__id != 'undefined' && this.__id !== uidOrName) {
                this.render({force: true});
            }
            this.__id = uidOrName;
        },

        initialize: function() {
            this.model = new UserModel();
            this.options = {};
            ProfileCardModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return ProfileCardModule;
});
