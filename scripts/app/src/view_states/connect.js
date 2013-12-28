define(function(require, exports) {
    var tpl = require('../views/connect.tpl');
    var slice = Array.prototype.slice;
    var ConnectNavView = require('../modules/connect-nav.js');
    var CommentsView = require('../modules/comments');
    var MentionsView = require('../modules/mentions');

    return function config(application) {
        var Connect = Backbone.Module.extend({
            name: 'connect',
            __parseParent: function() {
                return application.el;
            },
            initialize: function() {
                this.__exports = {
                    'connect-comment': '.content-main',
                    'mentions': '.content-main'
                };

                Connect.__super__['initialize'].apply(this, arguments);
            },
            render: function() {
                this.$el.html(tpl);
                this.append(ConnectNavView, '.dashboard');
                return this;
            },
            __onRefresh: function() {

            }
        });

        var ConnectComment = Backbone.Module.extend({
            name: 'connect-comment',
            render: function() {

                this.append(CommentsView, this.el, {
                    uid: JSON.parse(localStorage.getItem('uid'))
                });

                return this;
            }
        });

        var Mentions = Backbone.Module.extend({
            name: 'mentions',
            render: function() {

                this.append(MentionsView, this.el, {
                    uid: JSON.parse(localStorage.getItem('uid'))
                });

                return this;
            }
        });


        application.register('connect', Connect, ConnectComment);
        application.register('mentions', Connect, Mentions);
    }
});
