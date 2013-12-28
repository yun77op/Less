define(function(require, exports) {

    var WeiboModel = require('./weibo');
    return WeiboModel.extend({
        url: 'users/show.json'
    });
});