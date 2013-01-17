(function() {
		'use strict';

		window.onload = function() {
			var params = parseQuery();
			localStorage.uid = params.uid;
            localStorage.oauth2_token = params.access_token;
            if (window.opener) window.opener.oauth2Callback(params.access_token);
            window.close();
		};

    function parseQuery() {
        var hash = window.location.hash;
        var params = {};

        if (hash) {
            hash.slice(1).split('&').forEach(function (pairStr, i) {
                var pair = pairStr.split('=');
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            });
        }

        return params;
    }
})();
