define(function(require, exports) {
    var Cursor = require('./cursor.js');

    var Users = Cursor.extend({
        parse: function(resp, xhr) {
            Users.__super__.parse.apply(this, arguments);
            return resp.users;
        }
    });

    return Users;
});
