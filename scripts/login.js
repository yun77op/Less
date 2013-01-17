seajs.config({
		base: '/scripts',
		preload: ['seajs/plugin-text']
}).use(['util', 'oauth2'], function(util, OAuth2) {
		var oauth2 = new OAuth2('3271047289', 'https://api.weibo.com/oauth2/authorize',
														'http://mystaff.heroku.com/static/less.html');
		var popup;

		document.getElementById('signin').onclick = function(e) {
				e.preventDefault();
				var url = oauth2.getAccessURL();
				url = util.addURLParam(url, 'state', chrome.i18n.getMessage('@@extension_id'));
				var left = (window.screen.availWidth - 510) / 2;
				popup = window.open(url, 'oauth2_window', 'left=' + left +
								'top=30,width=600,height=450,menubar=no,location=yes,resizable=no,scrollbars=yes,status=yes');
		};

		window.oauth2Callback = function(token) {
				oauth2.setToken(token);
				popup.close();
				window.location.href = chrome.extension.getURL('main.html');
		};
});
