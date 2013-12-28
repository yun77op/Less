seajs.use(['app/src/util', 'app/src/lib/oauth2'], function(util, OAuth2) {
		var oauth2 = new OAuth2('3271047289',
                            'https://api.weibo.com/oauth2/authorize',
                            'http://mystaff.herokuapp.com/static/less.html');

		document.getElementById('signin').onclick = function(e) {
			e.preventDefault();
		    var url = oauth2.getAccessURL();
            location.href = url;
		};
});
