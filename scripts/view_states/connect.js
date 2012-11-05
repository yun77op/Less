define(function(require, exports) {

    var tpl = require('../views/connect.tpl');

    return function config(application, routeManager) {
        var ConnectViewState = Backbone.ViewState.extend({
            name: 'connect',
            path: '!/connect',
            template: tpl,
            el: application.el
        });

        routeManager.register(ConnectViewState);
    };
});
