app.define('app.weibo.tweetPlugins', function() {

	function url(content) {
		return content.replace(/\b(http:\/\/[\w\.\/]+)/g, function(s0, url) {
			return '<a target="_blank" href="' + url + '">' + url + '</a>';
		});
	}

	function tag(content) {
		return content.replace(/#([^\#]*?)#/g, function(s0, tag) {
			return '<a target="_blank" href="http://weibo.com/k/' + app.util.fromRfc3986(tag) + '">' + s0 + '</a>';
		});
	}

	var emoticonsObj;

	function initializeEmoticons() {
		emoticonsObj = {};
		var emoticons = app.weibo.emoticons;
		emoticons.forEach(function(emoticon) {
			emoticonsObj[emoticon.value] = emoticon.url;
		});
	}

	function emoticons(content) {
		if (!emoticonsObj) { initializeEmoticons(); }
		return content.replace(/\[([^\]]*?)\]/g, function(value, title) {
			var url = emoticonsObj[value];
			if (url) {
				return '<img src="' + url + '" title="' +
					title + '" alt="' + value + '">';
			} else {
				return value;
			}
		});
	}

	function mention(content) {
		return content.replace(/@([\u4e00-\u9fa5\w-]+)/g, function(s0, user) {
			return '<a class="name" href="#user/' +
					app.util.toRfc3986(user) + '">@' +
					user + '</a>';
		});
	}
	
	return {
		url: url,
		tag: tag,
		mention: mention,
		emoticons: emoticons
	};
});

app.define('app.weibo', function() {
	function processTweetPlugins(content) {
		for (var i in app.weibo.tweetPlugins) {
			content = app.weibo.tweetPlugins[i](content);
		}
		return content;
	}

	return {
		processTweetPlugins: processTweetPlugins
	};
});