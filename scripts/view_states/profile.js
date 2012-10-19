define(function(require, exports) {

    var tpl = require('../views/profile.tpl');

    return function config(application, routeManager) {
        var ProfileViewState = Backbone.ViewState.extend({
            name: 'profile',
            path: '!/:uid',
            template: tpl,
            el: application.el,
            enter: function() {
                ProfileViewState.__super__['enter'].apply(this, arguments);
                ProfileViewState.__super__['render'].apply(this, arguments);
                return this;
            }
        });

        var profileViewState = new ProfileViewState({
            model: new Backbone.Model({
                user_timeline: true
            })
        });

        routeManager.register(profileViewState);


        var ProfileFollowingViewState = ProfileViewState.extend({
            name: 'profile-following',
            path: '!/:uid/following',
            initialize: function() {

            }
        });

        new ProfileFollowingViewState({
            model: new Backbone.Model({

            })
        });

//        routeManager.registerSubViewState(profileFollowingViewState, profileViewState);
//        routeManager.registerSubViewState(profileFollowersViewState, profileViewState);
    };
});