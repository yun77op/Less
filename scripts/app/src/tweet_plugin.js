define(function(require) {

    var emoticonsObj;

    function initializeEmoticons() {
        emoticonsObj = {};
        var emoticons = {};
        emoticons.forEach(function(emoticon) {
            emoticonsObj[emoticon.value] = emoticon.url;
        });
    }

    var util = require('./util');

    var plugins = [
	    function url(content) {
            return content.replace(/\b(http:\/\/[\w\.\/]+)/g, function(s0, url) {
                return '<a target="_blank" href="' + url + '">' + url + '</a>';
            });
        },

        function tag(content) {
            return content.replace(/#([^\#]*?)#/g, function(s0, tag) {
                return '<a target="_blank" href="http://weibo.com/k/' + util.fromRfc3986(tag) + '">' + s0 + '</a>';
            });
        },

        function emoticons(content) {
            if (!emoticonsObj) {
//                initializeEmoticons();
                return content;
            }
            return content.replace(/\[([^\]]*?)\]/g, function(value, title) {
                var url = emoticonsObj[value];
                if (url) {
                    return '<img src="' + url + '" title="' +
                        title + '" alt="' + value + '">';
                } else {
                    return value;
                }
            });
        },

        function mention(content) {
            return content.replace(/@([\u4e00-\u9fa5\w-]+)/g, function(s0, user) {
                return '<a class="name" href="#user/' +
                        util.toRfc3986(user) + '">@' +
                        user + '</a>';
            });
        }
    ];

	return {
		process: function(content) {
            return plugins.reduce(function(content, fn) {
                return fn(content);
            }, content);
        }
	};
});
