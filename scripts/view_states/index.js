define(function(require, exports) {

    var tpl = require('../views/index.tpl');

    return function config(application, routeManager) {
        var IndexViewState = Backbone.ViewState.extend({
            name: 'index',
            path: '',
            template: tpl,
            enter: function() {
                application.$el.html(this.template());
                return this;
            }
        });

        routeManager.register(new IndexViewState());
    };
});
