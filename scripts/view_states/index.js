define(function(require, exports) {

    var tpl = require('../views/index.tpl');

    return function config(application, routeManager) {
        var IndexViewState = Backbone.ViewState.extend({
            name: 'index',
            path: '',
            template: tpl,
            el: application.el
        });

        routeManager.register(IndexViewState);
    };
});
