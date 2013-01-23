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

            if (_.isString(model.storeID)) {
                var success = options.success;

                if (method == 'read') {
                   var data = localStorage.getItem(model.storeID);

                   if (data) {
                      data = JSON.parse(data);
                      return success(data);
                   }
                }

                options.success = function(resp, status, xhr) {
                    localStorage.setItem(model.storeID, JSON.stringify(resp));
                    success(resp, status, xhr);
                };
            }

            weibo.request(params, {
                success: options.success,
                error: options.error
            });
        }
    });

    return StreamModel;
});
