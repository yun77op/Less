define(function(require, exports) {

    var weibo = require('../weibo');

    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read': 'GET'
    };

    var StreamModel = Backbone.Model.extend({
        sync: function(method, model, options) {
            var params = {
                path: model.url,
                method: methodMap[method],
                params: options.data
            };

            weibo.request(params, {
                success: options.success,
                error: options.error
            });
        }
    });

    return StreamModel;
});