define(function(require, exports) {

    return function config(application, routeManager) {

        var tpl = require('../views/profile.tpl');
        var slice = Array.prototype.slice;
        var profileNav;

        var ProfileViewState = Backbone.ViewState.extend({
            name: 'profile',
            path: '!/:uid',
            template: tpl,
            el: application.el,
            enter: function() {
                if (!this.isActive()) return;

                profileNav = this.getChildModuleByName('profile-nav')[0];
                profileNav.onReady(function() {
                    this.trigger('nav', 'tweets');
                });

                var args = slice.call(arguments);
                var userTimeline = application.getModuleInstance('user-timeline');
                this.append(userTimeline, '.content-main', args);
            },
            transition: function() {
                this.getChildModuleByName('user-timeline')[0].destroy();
            }
        });

        routeManager.register(ProfileViewState);


        var ProfileFollowingViewState = Backbone.ViewState.extend({
            name: 'profile-following',
            path: '!/:uid/following',
            el: application.el,
            enter: function() {
                this.parent.delegateReady('profile-nav', function() {
                    this.trigger('nav', 'following');
                });
                var args = slice.call(arguments);
                var Following = application.getModuleInstance('following');
                this.append(Following, '.content-main', args);
            },
            transition: function() {
                this.getChildModuleByName('following')[0].destroy();
            }
        });

        routeManager.registerSubViewState(ProfileFollowingViewState, ProfileViewState);

        var ProfileFollowersViewState = Backbone.ViewState.extend({
            name: 'profile-followers',
            path: '!/:uid/followers',
            el: application.el,
            enter: function() {
                this.parent.delegateReady('profile-nav', function() {
                    this.trigger('nav', 'followers');
                });
                var args = slice.call(arguments);
                var Following = application.getModuleInstance('followers');
                this.append(Following, '.content-main', args);
            },
            transition: function() {
                this.getChildModuleByName('followers')[0].destroy();
            }
        });

        routeManager.registerSubViewState(ProfileFollowersViewState, ProfileViewState);
    };
});
