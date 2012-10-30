define(function(require, exports) {

    return function config(application, routeManager) {

        var userTimeline = application.getModuleByName('user-timeline');
        var ProfileNav = application.getModuleByName('profile-nav');
        var tpl = require('../views/profile.tpl');

        var slice = Array.prototype.slice;

        var ProfileViewState = Backbone.ViewState.extend({
            name: 'profile',
            path: '!/:uid',
            template: tpl,
            el: application.el,
            beforeEnter: function() {
                if (routeManager.activeViewState != this) return;
                ProfileNav.onReady(function() {
                    this.trigger('nav', 'tweets');
                });
            },
            enter: function() {
                if (routeManager.activeViewState != this) return;
                var args = slice.call(arguments);
                this.append(userTimeline, '.content-main', args);
            },
            transition: function() {
                userTimeline.destroy();
            }
        });

        routeManager.register(ProfileViewState);


        var Following = application.getModuleByName('following');

        var ProfileFollowingViewState = ProfileViewState.extend({
            name: 'profile-following',
            path: 'following',
            beforeEnter: function() {
                ProfileNav.onReady(function() {
                    this.trigger('nav', 'following');
                });
            },
            enter: function() {
                var args = slice.call(arguments);
                this.append(Following, '.content-main', args);
            },
            transition: function() {
                Following.destroy();
            }
        });

        routeManager.registerSubViewState(ProfileFollowingViewState, ProfileViewState);

//        routeManager.registerSubViewState(profileFollowersViewState, profileViewState);
    };
});