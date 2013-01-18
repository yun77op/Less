define(function(require, exports) {

    var StreamModel = require('./stream');
    var UserModel = StreamModel.extend({
        url: 'users/show.json',
        sync: function(method, model, options) {

            var success = options.success;

            if (method == 'read') {
               var data = localStorage.getItem('user');

               if (data) {
                  data = JSON.parse(data);
                  return success(data);
               }
            }

            options.success = function(resp, status, xhr) {
                localStorage.setItem('user', JSON.stringify(resp));
                success(resp, status, xhr);
            };

            UserModel.__super__['sync'].call(this, method, model, options);
        }
    });

    return UserModel;
});
