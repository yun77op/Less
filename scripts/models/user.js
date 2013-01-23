define(function(require, exports) {

    var StreamModel = require('./stream');
    var UserModel = StreamModel.extend({
        url: 'users/show.json',
        storeID: 'user'
    });

    return UserModel;
});
