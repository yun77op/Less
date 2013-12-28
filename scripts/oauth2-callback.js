seajs.use(['app/src/util', 'app/src/lib/oauth2'], function(util, OAuth2) {

    'use strict';

		var oauth2 = new OAuth2('3271047289',
                            'https://api.weibo.com/oauth2/authorize',
                            'http://mystaff.herokuapp.com/static/less.html');

    window.onload = function() {
        var params = util.parseHashString();
        var token = params.access_token;

        localStorage.uid = params.uid;
        localStorage.oauth2_token = token;

        oauth2.setToken(token);
        location.href = chrome.extension.getURL('main.html');
    };
});
