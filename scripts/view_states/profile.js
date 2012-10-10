define(function(require, exports) {

    var tpl = require('../views/profile.tpl');

    return function config(application, routeManager) {
        var ProfileViewState = Backbone.ViewState.extend({
            name: 'profile',
            path: '!/:uid',
            template: tpl,
            render: function() {
                application.$el.html(this.template());
            },
            enter: function() {
                if (!this.active) {
                    this.render();
                }

                var $el = $('.content-main');
                var userTimelineModule = application.getModuleByName('user-timeline');

                $el.html(userTimelineModule.start(arguments));

                return this;
            }
        });

        routeManager.register(new ProfileViewState());
    };
});