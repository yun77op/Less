seajs.use(['app/src/util', 'app/src/lib/oauth2'], function(util, OAuth2) {
		var oauth2 = new OAuth2('3271047289',
                            'https://api.weibo.com/oauth2/authorize',
                            'http://mystaff.herokuapp.com/static/less.html');

		document.getElementById('signin').onclick = function(e) {
			e.preventDefault();
            chrome.tabs.create({ url: oauth2.getAccessURL() }, function(tab) {

            });
		};


    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (!sender.tab) return;

            sendResponse(0);

            location.href = chrome.runtime.getURL('oauth2_callback.html') + request.hash;
        });
});
