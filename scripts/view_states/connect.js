define(function(require, exports) {

    var tpl = require('../views/connect.tpl');
    var slice = Array.prototype.slice;

    return function config(application, routeManager) {
        var ConnectViewState = Backbone.ViewState.extend({
            name: 'connect',
            path: '!/connect',
            template: tpl,
            el: application.el,
            enter: function() {
              if (!this.isActive()) return;

              profileNav = this.getChildModuleByName('connect-nav')[0];
              profileNav.onReady(function() {
                  this.trigger('nav', 'connect');
              });

              var userTimeline = application.getModuleInstance('comments-timeline');
              var args = [JSON.parse(localStorage.getItem('uid'))];
              this.append(userTimeline, '.content-main', args);
            },
            transition: function() {
                this.getChildModuleByName('comments-timeline')[0].destroy();
            }
        });

        routeManager.register(ConnectViewState);


        var MentionsViewState = Backbone.ViewState.extend({
            name: 'vs-mentions',
            path: '!/mentions',
            el: application.el,
            enter: function() {
                this.parent.delegateReady('connect-nav', function() {
                    this.trigger('nav', 'mentions');
                });
                var args = slice.call(arguments);
                var mentionsModule = application.getModuleInstance('mentions');
                this.append(mentionsModule, '.content-main', args);
            },
            transition: function() {
                this.getChildModuleByName('mentions')[0].destroy();
            }
        });

        routeManager.registerSubViewState(MentionsViewState, ConnectViewState);
    }
});
