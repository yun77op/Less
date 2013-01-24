define(function(require, exports) {

    var UserModel = require('./user.js');
    return UserModel.extend({
        storeID: 'user'
    });
});
