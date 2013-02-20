define(function(require, exports) {

	/**
	 * Decodes a URL-encoded string into key/value pairs.
	 * @param {String} encoded An URL-encoded string.
	 * @param {String} sep Separator.
	 * @return {Object} An object representing the decoded key/value pairs found
	 *     in the encoded string.
	 */
	function formDecode(encoded, sep) {
		sep = sep === undefined ? '&' : sep;
		var params = encoded.split(sep);
		var decoded = {};
		for (var i = 0, param; param = params[i]; i++) {
			var keyval = param.split("=");
			if (keyval.length == 2) {
				var key = fromRfc3986(keyval[0]);
				var val = fromRfc3986(keyval[1]);
				decoded[key] = val;
			}
		}
		return decoded;
	}


	/**
	 * Decodes a string that has been encoded according to RFC3986.
	 * @param {String} val The string to decode.
	 */
	function fromRfc3986(val) {
		var tmp = val
			.replace(/%21/g, "!")
			.replace(/%2A/g, "*")
			.replace(/%27/g, "'")
			.replace(/%28/g, "(")
			.replace(/%29/g, ")");
		 return decodeURIComponent(tmp);
	}

	function toRfc3986(val) {
		return encodeURIComponent(val).replace(/\!/g, "%21").replace(/\*/g, "%2A")
			.replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
	}

	function addURLParam(url, key, value) {
		if (typeof key == 'object') {
			var obj = key;
			if (!isEmptyObject(obj)) {
				return url + '?' + stringify(obj);
			}
		} else {
			var sep = (url.indexOf('?') >= 0) ? "&" : "?";
			return url + sep + toRfc3986(key) + "="
					+ toRfc3986(value);
		}
		return url;
	}

	function stringify(obj) {
		var result = '';
		for (var key in obj) {
			result += toRfc3986(key) + '=' + toRfc3986(obj[key]) + '&';
		}
		return result.slice(0, -1);
	}

	//@see http://stackoverflow.com/questions/728360/copying-an-object-in-javascript
	function clone(obj) {
		// Handle the 3 simple types, and null or undefined
		if (null == obj || "object" != typeof obj) return obj;

		// Handle Date
		if (obj instanceof Date) {
			var copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}

		// Handle Array
		if (obj instanceof Array) {
			var copy = [];
			for (var i = 0, len = obj.length; i < len; ++i) {
				copy[i] = clone(obj[i]);
			}
			return copy;
		}

		// Handle Object
		if (obj instanceof Object) {
			var copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	function isEmptyObject(obj) {
		for ( var key in obj ) {
			return false;
		}
		return true;
	}


	/**
	 * Returns the current window's querystring decoded into key/value pairs.
	 *
	 * @return {Object} A object representing any key/value pairs found in the
	 *         current window's querystring.
	 */
	function parseQueryString() {
		var query;
		if (query = window.location.search) {
			query = query.slice(1);
			return formDecode(query);
		}
		return {};
	}

	function parseHashString() {
		var query;
		if (query = window.location.hash) {
			query = query.slice(1);
			return formDecode(query);
		}
		return {};
	}

	var EN_AMP_RE = /&/g;
	var EN_LT_RE  = /</g;
	var EN_GT_RE  = />/g;
	var EN_QUOT_RE = /"/g;
	var EN_SINGLE_RE = /'/g;

	// encode text into HTML to avoid XSS attacks.
	// underscore templates do not auto encode. If in doubt, use this!
	function htmlEncode(text) {
		text = ""+text;
		text = text.toString().replace(EN_AMP_RE, "&amp;");
		text = text.replace(EN_LT_RE, "&lt;");
		text = text.replace(EN_GT_RE, "&gt;");
		text = text.replace(EN_QUOT_RE, "&quot;");
		text = text.replace(EN_SINGLE_RE, "&#39;");
		return text;
	}

	var DE_GT_RE = /\&gt\;/g;
	var DE_LT_RE = /\&lt\;/g;
	var DE_QUOT_RE = /\&quot\;/g;
	var DE_SINGLE_RE = /\&#39\;/g;

	function htmlDecode(text) {
		text = ""+text;
		text = text.toString().replace(DE_GT_RE, ">");
		text = text.replace(DE_LT_RE, "<");
		text = text.replace(DE_QUOT_RE, '"');
		text = text.replace(DE_QUOT_RE, '"');
		text = text.replace(DE_SINGLE_RE, '\'');
		return  text;
	}


	function loadStyle(href, id) {
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		if (id) {
			link.id = id;
		}
		document.head.appendChild(link);
	}

	function scale(width, height, widthLimit, heightLimit) {
		var ratio = 0;
		if (widthLimit) {
			ratio = Math.max(ratio, width / widthLimit);
		}
		if (heightLimit) {
			ratio = Math.max(ratio, height / heightLimit);
		}
		if (ratio > 1) {
			width = parseInt(width / ratio);
			height = parseInt(height / ratio)
		}
		return {
			width: width,
			height: height
		};
	}

    function dateFormat(date, options) {
        date = new Date(date);
        var	timeStamp = date.getTime(),
            diff = new Date().getTime() - timeStamp,
            second = 1000,
            minute = 1000 * 60,
            hour = 60 * minute,
            day = 24 * hour,
            result;

        var cycle = {
            days: day,
            hours: hour,
            minutes: minute,
            seconds: second
        };

        var immediate = diff / day;
        if (immediate > 5) {
            result = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-') +
                ' ' + date.toLocaleTimeString();
        } else {
            for (var metric in cycle) {
                immediate = diff / cycle[metric];
                if (immediate > 1) {
                    result = Math.round(immediate) + ' '+
                        chrome.i18n.getMessage(metric) + ' ' +
                        chrome.i18n.getMessage('ago');
                    break;
                }
            }
        }

        return result;
    }

	return {
		clone: clone,
		formDecode: formDecode,
		toRfc3986: toRfc3986,
		fromRfc3986: fromRfc3986,

		addURLParam: addURLParam,
		stringify: stringify,

		parseQueryString: parseQueryString,
		parseHashString: parseHashString,

		htmlDecode: htmlDecode,
		htmlEncode: htmlEncode,
		html: htmlEncode,

		loadStyle: loadStyle,
		scale: scale,

    dateFormat: dateFormat
	};

});
