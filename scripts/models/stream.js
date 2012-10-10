define(function(require, exports) {

    var weibo = require('../weibo');

    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read': 'GET'
    };

    var StreamModuleModel = Backbone.Model.extend({
        sync: function(method, model, options) {
            var params = {
                path: model.get('url'),
                method: methodMap[method],
                params: model.get('urlParams')
            };

            weibo.request(params, {
                success: options.success,
                error: options.error
            });
        }
    });

    return StreamModuleModel;
});