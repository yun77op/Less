define(function(require, exports) {

    return function config(application, routeManager) {
        var tpl = require('../views/profile.tpl');
        var userTimeline = require('../modules/user-timeline');
        var ProfileNav = application.getModuleByName('profile-nav');

        var ProfileViewState = Backbone.ViewState.extend({
            name: 'profile',
            path: '!/:uid',
            template: tpl,
            el: application.el,
            beforeEnter: function() {
                if (routeManager.activeViewState != this) return;
                ProfileNav.onReady(function() {
                    ProfileNav.trigger('nav', 'tweets');
                });
                this.registerModule(userTimeline);
            },
            enter: function() {
                ProfileViewState.__super__['render'].apply(this, arguments);
                userTimeline.start(this.el.querySelector('.content-main'));
            }
        });

        routeManager.register(ProfileViewState);


        var Following = require('../modules/following');

        var ProfileFollowingViewState = ProfileViewState.extend({
            name: 'profile-following',
            path: 'following',
            beforeEnter: function() {
                ProfileNav.onReady(function() {
                    this.trigger('nav', 'following');
                });
                this.registerModule(Following);
            },
            enter: function() {
                var Following = require('../modules/following');
                Following.start(this.el.querySelector('.content-main'));
            }
        });

        routeManager.registerSubViewState(ProfileFollowingViewState, ProfileViewState);


//        routeManager.registerSubViewState(profileFollowersViewState, profileViewState);
    };
});