define(function(require, exports) {

    var tpl = require('../views/index.tpl');

    return function config(application, routeManager) {
        var IndexViewState = Backbone.ViewState.extend({
            name: 'index',
            path: '',
            template: tpl,
            el: application.el,
            enter: function() {
                IndexViewState.__super__['render'].apply(this, arguments);
                return this;
            }
        });

        routeManager.register(IndexViewState);
    };
});
