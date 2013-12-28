define(function(require, exports) {

    return function config(application) {

        var tpl = require('../views/profile.tpl');
        var profileNavView = require('../modules/profile-nav');
        var profileCardView = require('../modules/profile-card');

        var profileFollowing = require('../modules/following');
        var profileFollowers = require('../modules/followers');
        var UserTimeline = require('../modules/user-timeline');

        var ProfileViewState = Backbone.Module.extend({
            name: 'profile',
            __parseParent: function() {
                return application.el;
            },

            initialize: function() {
                this.__exports = {
                    'profile-timeline': '.content-main',
                    'profile-following': '.content-main',
                    'profile-followers': '.content-main'
                };
                ProfileViewState.__super__['initialize'].apply(this, arguments);
            },

            render: function() {
                this.$el.html(tpl);
                this.append(profileNavView, '.dashboard');
                this.append(profileCardView, '.profile-card-container');
                return this;
            }
        });

        var ProfileTimeline = Backbone.Module.extend({
            name: 'profile-timeline',

            render: function() {
                this.append(UserTimeline, this.el, {
                    uid: JSON.parse(localStorage.getItem('uid'))
                });
                return this;
            }
        });

        application.register('u/:uid', ProfileViewState, ProfileTimeline);


        var ProfileFollowingViewState = Backbone.Module.extend({
            name: 'profile-following',

            render: function() {
                this.append(profileFollowing, this.el, {
                    uid: JSON.parse(localStorage.getItem('uid'))
                });
                return this;
            }
        });

        application.register('u/:uid/following', ProfileViewState, ProfileFollowingViewState);


        var ProfileFollowersViewState = Backbone.Module.extend({
            name: 'profile-followers',
            render: function() {
                this.append(profileFollowers, this.el, {
                    uid: JSON.parse(localStorage.getItem('uid'))
                });
                return this;
            }
        });

        application.register('u/:uid/followers', ProfileViewState, ProfileFollowersViewState);
    };
});
