define(function(require, exports) {
  var oauth2 = require('./lib/oauth2').getInstance();
  var message = require('./message');

	const API_SHORTHANDS = {
		'timeline': 'statuses/home_timeline.json',
		'mentions': 'statuses/mentions.json',
		'user': 'statuses/user_timeline.json',
		'comments': 'comments/to_me.json',
		'comments-tome': 'comments/to_me.json',
		'comments-byme': 'comments/by_me.json',
		'favorites': 'favorites.json',
		'follows': 'friendships/friends.json',
		'followers': 'friendships/followers.json'
	};


	function shorthandRequest(hash, params, callback) {
		var path = API_SHORTHANDS[hash];
		if (!path) { return; }

		if (typeof params == 'function') {
			callback = params;
			params = {};
		}

		request({
			path: path,
			params: params
		}, callback);
	}

	//Request weibo API
	function request(options, callback) {
		var base_url = options.base_url || 'https://api.weibo.com/2/',
				url =  base_url + options.path,
				method = options.method || 'GET',
				multi = options.multi || false;

		oauth2.request(method, url, options.params, multi, function (data, xhr) {
			if (data.error_code && data.error_code <= 21332 && data.error_code >= 21322) {
				window.location.href = chrome.extension.getURL('login.html');
				return;
			}

			var isObj = typeof callback == 'object';
			var errorHandler = isObj && callback.error ?
					callback.error : request.errorHandler;
			var successHandler = isObj ? callback.success : callback;

			if (xhr.status == 200) {
				successHandler(data, xhr.status, xhr);
			} else {
				errorHandler(data, xhr);
			}
		});
	}

	window.errorHandler = request.errorHandler = function(data, xhr) {
		message.createMessage({
      text: data.error,
      actions: [
        {
          label: 'Ok',
          click: function() {
            this.hide();
          }
        }
      ],
      className: 'error'
    });
	};


	return {
		request: request
	};

});
