define(function(require, exports) {

    var tpl = require('../views/profile-card.tpl');
    var StreamModel = require('../models/stream.js');

    var ProfileCardModule = Backbone.Module.extend({
        name: 'profile-card',
        className: 'module',
        template: tpl,
        enter: function(uid) {
            this.model.set('urlParams', {
                uid: uid
            });
        }
    });

    var profileCardModule = new ProfileCardModule({
        model: new StreamModel({
            url: 'users/show.json',
            urlParams: {
                uid: localStorage['uid']
            }
        })
    });

    return profileCardModule;
});