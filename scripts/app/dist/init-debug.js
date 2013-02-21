define("less/app/0.0.1/lib/oauth2-debug", ["../util-debug"], function(require, exports) {

    var util = require('../util-debug');

    function OAuth2(client_id, request_url, redirect_url) {
		this.client_id = client_id;
		this.request_url = request_url;
		this.redirect_url = redirect_url;
		this.key_token = 'oauth2_token';
	}

	var p = OAuth2.prototype;

	p.hasToken = function() {
		return !!this.getToken();
	};

	p.getToken = function() {
		return this.token || localStorage[this.key_token];
	};

	p.setToken = function(token) {
		this.token = token;
		localStorage[this.key_token] = token;
	};

	p.clearToken = function() {
		delete this.token;
		delete localStorage[this.key_token];
	};

	p.getAccessURL = function() {
		var url = this.request_url;
		var params = {
			client_id: this.client_id,
			redirect_uri: this.redirect_url,
			response_type: 'token'
		};
		return util.addURLParam(url, params);
	};

	p.request = function(method, url, params, multi, callback) {
		callback = arguments[arguments.length - 1];

		if (typeof multi != 'boolean') {
			multi = false;
		}

		if (typeof params == 'function') {
			callback = params;
			params = {};
		}

		var instance = new Request(method, url, params, multi);
		var result = instance.generate();
		if (this.hasToken()) {
			result.headers['Authorization'] = 'OAuth2' + ' ' + this.getToken();
		}
		this.sendRequest(method, result.signed_url, result.headers, result.body, function(data, xhr) {
			callback(data, xhr);
		});
	};

	p.get = function() {
		var args = ['GET'].concat(arguments);
		this.request.apply(this, args);
	};

	p.post = function() {
		var args = ['POST'].concat(arguments);
		this.request.apply(this, args);
	};

	p.sendRequest = function(method, url, headers, body, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				callback(JSON.parse(this.responseText), this);
			}
		};
		xhr.open(method, url, true);
		if (headers) {
			for ( var header in headers) {
				if (headers.hasOwnProperty(header)) {
					xhr.setRequestHeader(header, headers[header]);
				}
			}
		}
		xhr.send(body);
		return xhr;
	};


	function Request(method, url, params, multi) {
		params = params || {};
		this.multi = multi;

		if (multi) {
			this.pic = params.pic;
			delete params.pic;
		}

		this.method = method.toUpperCase();
		this.url = url;
		this.params = params;

		this._nonce_chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	}

	p = Request.prototype;

	p.generate = function() {
		return {
			body: this.getBody(),
			signed_url: this.getSingedURL(),
			headers: this.getHeaders()
		};
	};

	p.getHeaders = function() {
		var headers = {};
		headers['Content-Type'] = this.multi ? 'multipart/form-data; boundary=' + this.boundary :
				'application/x-www-form-urlencoded';
		return headers;
	};

	p.getSingedURL = function() {
		var url = this.url;
		if (this.method == 'GET') {
			url = util.addURLParam(url, this.params);
		}
		this.signed_url = url;
		return url;
	};

	p.getBody = function() {
		if (this.method == 'GET'){
			return null;
		}

		var data;

		if (this.multi) {
			this.getUniqueBoundary();

			var boundary = this.boundary,
					crlf = '\r\n',
					dashdash = '--',
					pic = this.pic;

      var blobHead = ''
        , blobFooter = '';

			blobHead = dashdash + boundary + crlf;
			for (var i in this.params) {
				blobHead += 'Content-Disposition: form-data; name="' + i + '"' + crlf + crlf;
				blobHead += this.params[i] + crlf;
				blobHead += dashdash;
				blobHead += boundary;
				blobHead += crlf;
			}

			blobHead += 'Content-Disposition: form-data; name="pic"; filename="' + pic.fileName + '"' + crlf;
			blobHead += 'Content-Type: ' + pic.fileType + crlf + crlf;
			blobFooter = crlf;
			blobFooter += dashdash;
			blobFooter += boundary;
			blobFooter += dashdash;
			blobFooter += crlf;
      data = new Blob([blobHead, pic, blobFooter], {type: "application/octet-binary"})

			// var data = new FormData();
			// for (var i in this.params) {
			// 	data.append(i, this.params[i]);
			// }
		} else {
			data = util.stringify(this.params);
		}

		return data;
	};

	p.getUniqueBoundary = function() {
		var result = '', length = 10,
			cLength = this._nonce_chars.length;
		for (var i = 0; i < length;i++) {
			var rnum = Math.floor(Math.random() *cLength);
			result += this._nonce_chars.substring(rnum,rnum+1);
		}
		this.boundary = '----boundary' + result;
		return this;
	};

	app.addSingletonGetter(OAuth2);

	return OAuth2;

});

define("less/app/0.0.1/util-debug", [], function(require, exports) {

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

define("less/app/0.0.1/tweet_plugin-debug", ["./util-debug"], function(require) {

    var emoticonsObj;

    function initializeEmoticons() {
        emoticonsObj = {};
        var emoticons = {};
        emoticons.forEach(function(emoticon) {
            emoticonsObj[emoticon.value] = emoticon.url;
        });
    }

    var util = require('./util-debug');

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
                return '<a class="name" href="#!/' +
                    user + '">@' +
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

define("less/app/0.0.1/modules/mini_profile-debug", ["../models/signed-user-debug", "../models/user-debug", "../models/stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function(require, exports) {

    var tpl = '<div class="flex-module"><div class="profile-summary"><a href="#!/{{id}}"><div class="content"><img src="{{profile_image_url}}" class="avatar"> <b class="fullname">{{screen_name}}</b><small class="meta">View my profile page</small></div></a></div></div><div class="flex-module">{{> profile-stats}}</div>';
    var SignedUserModel = require('../models/signed-user-debug');

    var MiniProfileModule = Backbone.Module.extend({
        name: 'mini-profile',
        className: 'module',
        template: tpl,
        placeholder: 'Loading..',
        initialize: function() {
            this.model = new SignedUserModel();
            MiniProfileModule.__super__['initialize'].apply(this, arguments);
        }
    });


    return {
        main: MiniProfileModule,
        args: {
            data: {
                uid: localStorage.uid
            }
        }
    };
});

define("less/app/0.0.1/models/signed-user-debug", ["./user-debug", "./stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function(require, exports) {

    var UserModel = require('./user-debug');
    return UserModel.extend({
        storeID: 'user'
    });
});

define("less/app/0.0.1/models/user-debug", ["./stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function(require, exports) {

    var StreamModel = require('./stream-debug');
    var UserModel = StreamModel.extend({
        url: 'users/show.json',
    });

    return UserModel;
});

define("less/app/0.0.1/models/stream-debug", ["../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function(require, exports) {

    var weibo = require('../weibo-debug');

    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read': 'GET'
    };

    var StreamModel = Backbone.Model.extend({
        sync: function(method, model, options) {
            var params = {
                path: model.url,
                method: methodMap[method],
                params: options.data
            };

            if (_.isString(model.storeID)) {
                var success = options.success;

                if (method == 'read') {
                   var data = localStorage.getItem(model.storeID);

                   if (data) {
                      data = JSON.parse(data);
                      return success(data);
                   }
                }

                options.success = function(resp, status, xhr) {
                    localStorage.setItem(model.storeID, JSON.stringify(resp));
                    success(resp, status, xhr);
                };
            }

            weibo.request(params, {
                success: options.success,
                error: options.error
            });
        }
    });

    return StreamModel;
});

define("less/app/0.0.1/weibo-debug", ["./lib/oauth2-debug", "./util-debug", "./message-debug"], function(require, exports) {
  var oauth2 = require('./lib/oauth2-debug').getInstance();
  var message = require('./message-debug');

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

define("less/app/0.0.1/message-debug", [], function (require, exports) {

	var Message = function() {
		this.initialize.apply(this, arguments);
	};

	Message.prototype = {
		constructor: Message,

		initialize: function(options) {
			var options = $.extend({}, Message.defaults, options)
        , self = this;
			this.option(options);

			var $el = this.$el = $('<div class="message"><div class="message-inner">' +
        '<span class="message-text">' +
        options.text + '</span></div></div>');

      if (options.actions) {
        var $actions = $('<div class="message-actions" />');
        options.actions.forEach(function(item) {
          var $action = $('<button class="btn-link">' + item.label + '</button>');
          $action.click(_.bind(item.click, self));
          $actions.append($action);
        });
        $el.find('.message-inner').append($actions);
      }

			if (typeof options.className == 'string') {
				$el.addClass(this.options.className);
			}

			_.bindAll(this, 'hide');

			if (this.option('autoOpen')) {
				this.show();
			}
		},

		show: function() {
			this.$el.appendTo('body');

      if (this.option('autoHide')) {
        this.addTimer();
      }
		},


		hide: function() {
			this.$el.remove();
		},

		addTimer: function() {
			this.timer = window.setTimeout(this.hide, this.option('hideTimeout'));
		},

		clearTimer: function () {
			if (this.timer) {
				window.clearTimeout(this.timer);
			}
		}
	};

	_.extend(Message.prototype, app.Options);

	Message.defaults = {
		hideTimeout: 4000,
		autoOpen: true,
		autoHide: true
	};

  return {
    createMessage: function(options) {
      return new Message(options);
    }
  };

});

define("less/app/0.0.1/modules/weibo-emoticons-debug", ["../models/stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function (require) {

    var tpl = '<a href="#" class="dropdown-toggle action-emoticons" data-toggle="dropdown" i18n-content="emoticons">Emoticons</a><div class="dropdown-menu emoticons" role="menu"><div class="emoticons-header"><ul class="emoticons-category-list"></ul><div class="emoticons-nav"><button class="nav-prev" disabled>&lt;</button><button class="nav-next" disabled>&gt;</button></div></div><div class="emoticons-body"><div class="loadingArea"><img src="images/loading.gif"><span i18n-content="loading">Loading</span></div></div></div>';
    var StreamModel = require('../models/stream-debug');

    var EmotionsModel = StreamModel.extend({
        url: 'emotions.json',
        storeID: 'emotions'
    });

    var EmoticonsModule = Backbone.Module.extend({
        name: 'weibo-emoticons',

        tagName: 'span',

        className: 'dropdown',

        template: tpl,

        model: new EmotionsModel(),

        initialize: function() {
            EmoticonsModule.__super__['initialize'].apply(this, arguments);
            this.initialized = false;
            this.pageNum = 5;
            this.currentPage = 1;

            this.onReady(function() {
                var self = this;

                if (this.initialized) return;

                this.model.fetch({
                    success: function() {
                        self.initialized = true;
                        self.initializeUI();
                    }
                });
            })

        },

        events: {
            'click .emoticons-body img': 'appendFace',
            'click .nav-prev': 'navPrev',
            'click .nav-next': 'navNext',
            'click .emoticons-category-list a': 'showEmoticonsByCategory'
        },

        initializeUI: function() {
            var emoticons = {};

            _.each(this.model.attributes, function(elm, i) {
                if (i != parseInt(i)) return;

                var category = elm.category || '默认';

                if (!emoticons[category]) {
                    emoticons[category] = [];
                }

                emoticons[category].push(elm);
            });

            var categories = _.keys(emoticons);

            this.model.set({
                emoticons: emoticons,
                categories: categories
            });

            this.setupNav();
        },

        setupFaces: function(category) {
            var body_tpl = '<ul>{{#each emoticons}}<li><img width="22" height="22" title="{{this.title}}" data-emoticon="{{this.phrase}}" src="{{this.icon}}" alt="{{this.phrase}}"></li>{{/each}}</ul>';
            var template = Handlebars.compile(body_tpl);
            var emoticons = this.model.get('emoticons')[category];
            emoticons = emoticons.map(function(elm, i) {
                elm.title = elm.phrase.slice(1, -1);
                return elm;
            });
            var html = template({
                emoticons: emoticons
            });
            this.$el.find('.emoticons-body').html(html);
        },

        setupNav: function() {
            var categories = this.model.get('categories');
            var totalPage = Math.ceil(categories.length / this.pageNum);

            this.totalPage = totalPage;
            this.renderNav(1);
            this.checkNav();
        },

        checkNav: function() {
            this.el.querySelector('.nav-prev').disabled = this.currentPage == 1 ? true : false;
            this.el.querySelector('.nav-next').disabled = this.currentPage == this.totalPage ? true : false;
        },

        appendFace: function(e) {
            var imgEl = e.currentTarget;
            var textarea = document.querySelector('.status-editor');
            var value = textarea.value;
            var start = textarea.selectionStart;
            var emoticon = imgEl.getAttribute('data-emoticon');
            textarea.value = value.slice(0, start) +
                emoticon + value.slice(textarea.selectionEnd);
            textarea.selectionStart = textarea.selectionStart = start + emoticon.length;
        },

        renderNav: function(page) {
            var nav_tpl = '{{#each categories}}<li><a href="#" data-category="{{this}}">{{this}}</a></li>{{/each}}';
            var template = Handlebars.compile(nav_tpl);

            var categories = this.model.get('categories');
            var list = categories.slice((page - 1) * this.pageNum, page * this.pageNum);

            var html = template({
                categories: list
            });
            this.$el.find('.emoticons-category-list').html(html);
            this.setupFaces(list[0]);
            this.el.querySelector('.emoticons-category-list li:first-child').classList.add('active');
            this.currentPage = page;
        },

        navPrev: function(e) {
            e.stopPropagation();
            this.renderNav(this.currentPage - 1);
            this.checkNav();
        },

        navNext: function(e) {
            e.stopPropagation();
            this.renderNav(this.currentPage + 1);
            this.checkNav();
        },

        showEmoticonsByCategory: function(e) {
            e.preventDefault();
            e.stopPropagation();

            this.el.querySelector('.emoticons-category-list .active').classList.remove('active');
            var target = e.currentTarget;
            target.parentNode.classList.add('active');

            var category = target.getAttribute('data-category');
            this.setupFaces(category);
        }
    });

    return EmoticonsModule;
});

define("less/app/0.0.1/modules/stream-picture-debug", ["../util-debug"], function (require, exports) {

    var tpl = '{{#unless expand}}<div class="tweet-pic-thumb" data-original="{{ original_pic }}"><img src="{{ thumbnail_pic }}"></div><img src="images/loading.gif" class="throbber" hidden>{{/unless}}<div class="tweet-pic-origin" {{#unless expand}}hidden{{/unless}}><div class="actions">{{#unless expand}}<a href="#" class="action-collapse">收起</a>{{/unless}}<a href="{{ original_pic }}" target="_blank" class="action-view-origin">查看大图</a><a href="#" class="action-rotate-left">左转</a><a href="#" class="action-rotate-right">右转</a></div>{{#if expand}}<img src="{{ original_pic }}">{{/if}}</div>';
    var util = require('../util-debug');

    var StreamPictureModule = Backbone.Module.extend({
        name: 'stream-picture',

        className: 'tweet-pic',

        template: tpl,

        initialize: function() {
            StreamPictureModule.__super__['initialize'].apply(this, arguments);

            this.widthLimit = 420;
            this.deg = 0;

            if (this.options.expand) {
              this.model.set({ expand: true });
            }

            this.onReady(function() {
              this.originalEl = this.el.querySelector('.tweet-pic-origin');
              if (!this.options.expand) {
                  this.thumbEl = this.el.querySelector('.tweet-pic-thumb');
                  _.bindAll(this, 'collapse');
                  this.$el.on('click', '.tweet-pic-origin img', this.collapse);
                  this.$el.on('click', '.tweet-pic-origin canvas', this.collapse);
              }
            })
        },

        events: {
            'click .tweet-pic-thumb img':'show',
            'click .action-collapse':'collapse',
            'click .action-rotate-left':'rotateLeft',
            'click .action-rotate-right':'rotateRight'
        },


        show:function () {
            if (this.inited) {
                this.expand();
            } else {
                this.load();
            }
        },

        showThrobber: function() {
            var throbberEl = this.el.querySelector('.throbber')
              , img = this.el.querySelector('.tweet-pic-thumb img')
            throbberEl.style.left = (img.width / 2 - 8) + 'px';
            throbberEl.style.top = (img.height / 2 - 8) + 'px';
            throbberEl.style.display = 'block';
        },

        load:function () {
            this.showThrobber();
            var img = new Image();
            img.onload = this.onLoad.bind(this, img);
            img.src = this.model.get('original_pic');
        },

        onLoad:function (img) {
            this.$el.find('.throbber').remove();

            this.inited = true;
            this.expand();
        },

        _show:function () {
            var img = document.createElement('img'), rect;

            img.src = this.model.get('original_pic');
            rect = util.scale(img.width, img.height, this.widthLimit);
            img.width = rect.width;
            img.height = rect.height;

            this.originalEl.style.display = 'block';
            img.style.marginLeft = (this.widthLimit - rect.width) / 2 + 'px';

            this.originalEl.appendChild(img);
        },

        collapse:function () {
            var originalEl = this.originalEl;
            originalEl.removeChild(originalEl.lastChild);
            originalEl.style.display = 'none';
            this.thumbEl.style.display = 'block';
        },

        expand:function () {
            this.thumbEl.style.display = 'none';
            this._show();
        },

        rotateLeft:function (e) {
            e.preventDefault();
            this.deg -= 90;
            this.rotate();
        },

        rotateRight:function (e) {
            e.preventDefault();
            this.deg += 90;
            this.rotate();
        },

        rotate:function () {
            var canvas = this.originalEl.querySelector('canvas'),
                img = document.createElement('img'),
                canvas;

            img.src = this.model.get('original_pic');

            if (!canvas) {
                canvas = document.createElement('canvas');
                this.originalEl.replaceChild(canvas, this.originalEl.querySelector('img'));
            }

            var ctx = canvas.getContext('2d');
            this.deg = this.deg + 360;
            this.deg %= 360;
            var revert,
                imgRect = [img.width, img.height];

            if (this.deg / 90 % 2) {
                revert = true;
                imgRect = [imgRect[1], imgRect[0]];
            }
            var rect = util.scale(imgRect[0], imgRect[1], this.widthLimit);
            var translateData = [];
            switch (this.deg) {
                case 0:
                    translateData[0] = 0;
                    translateData[1] = 0;
                    break;
                case 90:
                    translateData[0] = rect.width;
                    translateData[1] = 0;
                    break;
                case 180:
                    translateData[0] = rect.width;
                    translateData[1] = rect.height;
                    break;
                case 270:
                    translateData[0] = 0;
                    translateData[1] = rect.height;
                    break;
            }
            canvas.width = rect.width;
            canvas.height = rect.height;
            canvas.style.marginLeft = (this.widthLimit - rect.width) / 2 + 'px';
            ctx.save();
            ctx.translate(translateData[0] | 0, translateData[1] | 0);
            if (this.deg > 0) {
                ctx.rotate(Math.PI * (this.deg) / 180);
            }
            if (revert) {
                ctx.drawImage(img, 0, 0, rect.height, rect.width);
            } else {
                ctx.drawImage(img, 0, 0, rect.width, rect.height);
            }

            ctx.restore();
        }
    });

    return StreamPictureModule;
});

define("less/app/0.0.1/modules/stream-item-debug", ["../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function (require) {

    var weibo = require('../weibo-debug');
    var tpl = '{{#with user}}{{> stream-item-vcard}}{{/with}}<div class="stream-item-content"><div class="tweet">{{> stream-item-tweet-content}}{{#if retweeted_status}}{{#with retweeted_status}}<div class="tweet">{{> stream-item-tweet-content}}{{> stream-item-footer}}</div>{{/with}}{{/if}}{{> stream-item-footer}}</div></div>';
    var userID = JSON.parse(localStorage.getItem('uid'));

    var StreamItem = Backbone.Module.extend({
        name: 'stream-item',

        className:'stream-item',

        template: tpl,

        events:{
            'click .stream-item-primary-footer .action-repost':'repost',
            'click .stream-item-primary-footer .action-comment':'comment',
            'click .stream-item-primary-footer .action-favorite':'favorite',
            'click .stream-item-primary-footer .action-del':'del'
        },

        initialize: function() {
          if (userID == this.model.get('user').id) {
            this.model.set({ action_del: true });
          }

          this.model.set({ action_fav: true });

          StreamItem.__super__['initialize'].apply(this, arguments);
        },

        repost:function (e) {
            e.preventDefault();
            this._removeActiveCommentRepostList();

            if (this.activeListName == 'mini-repost-list') {
                this.activeListName = null;
                return;
            }

            this._setupList('mini-repost-list');
        },

        comment:function (e) {
            e.preventDefault();
            this._removeActiveCommentRepostList();

            if (this.activeListName == 'mini-comment-list') {
                this.activeListName = null;
                return;
            }

            this._setupList('mini-comment-list');
        },

        _setupList: function(moduleName) {
            var module = Backbone.application.getModuleInstance(moduleName, {
                model: this.model.clone()
            });
            this.append(module, '.stream-item-content > .tweet');

            this.activeListName = module.name;
            this.miniCommentRepostList = module;
        },

        _removeActiveCommentRepostList: function() {
            if (this.miniCommentRepostList) {
                this.miniCommentRepostList.destroy();
                this.miniCommentRepostList = null;
            }
        },

        favorite:function (e) {
            e.preventDefault();
            var self = this;
            var currentTarget = e.currentTarget;

            // prevent race
            if (currentTarget.disabled) return;

            currentTarget.disabled = true;

            var action = currentTarget.classList.contains('favorited') ? 'destroy' : 'create';
            var id = this.model.get('id');

            weibo.request({
                method:'POST',
                path:'favorites/' + action + '.json',
                params:{ id: id }
            }, function () {
                currentTarget.disabled = false;
                currentTarget.classList.toggle('favorited');
            });
        },

        del:function (e) {
            e.preventDefault();
            var self = this;
            weibo.request({
                method:'POST',
                path: 'statuses/destroy.json',
                params:{ id: this.model.get('id') }
            }, function() {
                self.$el.slideUp(function () {
                    self.destroy();
                });
            });
        }

    });

    return StreamItem;
});

define("less/app/0.0.1/modules/user-debug", [], function(require, exports) {

    var tpl = '{{> stream-item-vcard}}<div class="stream-item-content"><div class="pull-right">{{#module this name="relationship-action"}} {{/module}}</div><strong>{{name}}</strong><p>{{description}}</p></div>';

    var UserModule = Backbone.Module.extend({
        name: 'user',

        tagName: 'li',

        className: 'stream-item',

        template: tpl,

        follow: function(e) {
            e.preventDefault();
            var target = e.target;
            if (target.disabled) return;
            target.disabled = true;
            var followed = target.classList.contains('followed');
            var action =  followed ? 'destroy' : 'create';
            app.weibo.request('POST', 'friendships/'+ action, {uid: this.model.id}, function() {
                app.message.show(chrome.i18n.getMessage(handle + 'Success'), true);
                target.disabled = false;
                target.classList.toggle('followed');
                var handle = followed ? 'follow' : 'unfollow';
                target.textContent = chrome.i18n.getMessage(handle);
            });
        }
    });

    return UserModule;
});

define("less/app/0.0.1/modules/home-timeline-debug", ["../reminder-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "./stream-item-debug", "../models/statuses-debug", "../models/stream-debug", "./timeline-debug"], function(require, exports) {

    var Reminder = require('../reminder-debug');
    var tpl = '<div class="status-unread-count hide"></div><div class="stream">{{#each this}}{{#module this name="stream-item"}}{{/module}}{{/each}}</div>';
    var slice = Array.prototype.slice;
    var StreamItem = require('./stream-item-debug');
    var Statuses = require('../models/statuses-debug');
    var TimelineModule = require('./timeline-debug');

    var HomeTimelineModule = TimelineModule.extend({
        name: 'home-timeline',
        template: tpl,
        StreamItem: StreamItem,
        events: {
            'click .status-unread-count': '_renderUnread'
        },
        initialize: function() {
            var args = slice.call(arguments);
            Reminder.on('status', this._handleUnread, this);

            this.model = new Statuses();

            this.onReady(function() {
                this.$unreadCount = this.$el.find('.status-unread-count');
            });

            HomeTimelineModule.__super__['initialize'].apply(this, args);
        },

        _handleUnread: function(count) {
            this.$unreadCount.text('有 ' + count + ' 条新微博，点击查看').show();
        },

        _renderUnread: function() {
            this.$unreadCount.hide();

            this.fetch({
                data: { since_id: this.model.first().id },
                position: 'prepend'
            });
        },

        destroy: function() {
            Reminder.off('status', this._handleUnread, this);
            HomeTimelineModule.__super__['destroy'].apply(this, arguments);
        }
    });

    return {
        main: HomeTimelineModule
    };
});

// Reminder

define("less/app/0.0.1/reminder-debug", ["./weibo-debug", "./lib/oauth2-debug", "./util-debug", "./message-debug"], function (require) {

//    var pollingInterval = app.settings.get('general', 'pollingInterval') * 1000;
    var pollingInterval = 120 * 1000;
    var weibo = require('./weibo-debug');

    /*
    var tabSelected = true;
    chrome.tabs.getCurrent(function (tab) {
        var currentTabId = tab.id;
        chrome.tabs.onSelectionChanged.addListener(function (tabId, selectInfo) {
            tabSelected = currentTabId == tabId;
        });
    });*/

    function fetchUnread() {

        weibo.request({
            base_url:'https://rm.api.weibo.com/2/',
            path:'remind/unread_count.json'
        }, {
            success: function (data) {
                var i, val;
                for (i in data) {
                    val = data[i];
                    if (val) Reminder.trigger(i, val);
                }
            },

            failure: function () {
                self.pollingInterval *= 2;
            }
        });
    }

    setInterval(function () {
        //Idle threshold in seconds
        chrome.idle.queryState(30, function (newState) {
            var isActive = newState == 'active';
            if (!isActive || document.webkitHidden) return;
            fetchUnread();
        });
    }, pollingInterval);



    var Reminder = function() {};

    _.extend(Reminder, Backbone.Events);

    return Reminder;
});

define("less/app/0.0.1/models/statuses-debug", ["./stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function(require, exports) {
    var StreamModel = require('./stream-debug');

    var Statuses = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Backbone.Model,

        url: 'statuses/home_timeline.json',

        parse: function(resp, xhr) {
          return resp['statuses'];
        },

        comparator: function( statusA, statusB ) {
            return statusB.get('id') - statusA.get('id');
        },

        sync: StreamModel.prototype.sync
    });

    return Statuses;
});

define("less/app/0.0.1/modules/timeline-debug", [], function(require, exports) {

    var TimelineModule = Backbone.Module.extend({
        initialize: function() {
          this.onReady(function() {
              document.addEventListener('scroll', this._handleScroll, false);
          });

          this.unreadQueue = [];
          this.model.on( 'add', this.queueUnread, this );
          _.bindAll(this, 'addUnread', '_handleScroll');

          this.options.cursor = this.options.cursor || 'maxid';

          var self = this;
          if (this.options.cursor == 'cursor') {
            var parse = this.model.parse;
            this.model.parse = function(resp, xhr) {
              self.next_cursor = resp.next_cursor;
              return parse.apply(this, arguments);
            };
          }

          TimelineModule.__super__.initialize.apply(this, arguments);
        },

        _handleScroll: function() {
            var body = document.body;
            var offset = 100;
            if (this._scrollFetching
                || window.innerHeight + body.scrollTop + offset < body.scrollHeight) return;

            var cursorMap = {
                'cursor': { cursor: this.next_cursor },
                'maxid': { max_id: this.model.last().id }
            };

            var data = _.extend({}, this.options.data, cursorMap[this.options.cursor]);

            var options = {
                data: data,
                success: function() {
                    this._scrollFetching = false;
                }.bind(this)
            };

            this._scrollFetching = true;
            this.fetch(options);
        },

        fetch: function(options) {
            var mergedOptions = _.extend({}, options, {
                add: true
            });

            this.model.fetch(mergedOptions);
        },

        queueUnread: function(status, coll, options) {
            status.url = null;
            this.unreadQueue.push(status);
            if (!this.unreadTimeout) {
                setTimeout(this.addUnread, 0);
                this.unreadQueueOptions = options;
                this.unreadTimeout = true;
            }
        },

        addUnread: function() {
            var docFragment = document.createDocumentFragment();
            var StreamItem = this.StreamItem;
            this.unreadQueue.forEach(function(status) {
                var el = new StreamItem({ model: status }).render().el;
                docFragment.appendChild(el);
            });
            var position = this.unreadQueueOptions.position || 'append';
            this.$el.find('.stream')[position](docFragment);
            this.unreadQueue = [];
            this.unreadQueueOptions = null;
            this.unreadTimeout = false;
        },

        destroy: function() {
            document.removeEventListener('scroll', this._handleScroll, false);
            TimelineModule.__super__.destroy.apply(this, arguments);
        }

    });

    return TimelineModule;

});

define("less/app/0.0.1/modules/status-debug", ["../models/stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function(require, exports) {

    var tpl = '<div>{{#with user}}<div class="pull-right">{{#module this name="relationship-action"}}{{/module}}</div>{{> stream-item-vcard}}{{/with}}</div><div class="tweet">{{> stream-item-tweet-content}}{{#if retweeted_status}}{{#with retweeted_status}}<div class="tweet">{{> stream-item-tweet-content}}{{> stream-item-footer}}</div>{{/with}}{{/if}}{{> stream-item-footer}}</div><ul class="nav nav-tabs"><li><a href="#reposts" data-type="repost" data-toggle="tab">转发{{reposts_count}}</a></li><li><a href="#comments" data-type="comment" data-toggle="tab">评论{{comments_count}}</a></li></ul><div class="tab-content"><div class="tab-pane" id="reposts">{{#module this name="mini-repost-list"}}{{/module}}</div><div class="tab-pane" id="comments">{{#module this name="mini-comment-list"}}{{/module}}</div></div>';
    var StreamModel = require('../models/stream-debug');
    var StatusModel = StreamModel.extend({
        url: 'statuses/show.json'
    })

    var StatusModule = Backbone.Module.extend({
        name: 'status',

        template: tpl,

        initialize: function() {
          StatusModule.__super__.initialize.apply(this, arguments)

          this.model = new StatusModel();

          this.onReady(function() {
              var self = this
                , picEl = this.el.querySelector('.tweet-pic');

              if (picEl) {
                  new app.weibo.ImageView({
                      el: picEl,
                      expand: true
                  });
              }

              $('a[data-toggle="tab"]').on('show', function() {
                var type = $(this).data('type')
                  , listModule = self.getChildModuleByName('mini-' + type + '-list')[0]
                listModule.refresh()
              });

              $('a[href="#' + self.type + 's"]').tab('show');
          })
        },

        beforeEnter: function(userId, statusId, type) {
          this.options.data = {
            id: statusId
          }

          this.type = type ? type.slice(1) : 'repost';
        }
    });

    return {
      main: StatusModule,
      childConfig: {
        'mini-repost-list': {
          render: false
        },
        'mini-comment-list': {
          render: false
        },
        'stream-picture': {
          expand: true
        }
      }
    }
});

define("less/app/0.0.1/modules/stream-debug", [], function(require, exports) {

    var StreamModule = Backbone.Module.extend({
        render: function() {
            this.$el.html(this.template());

            var data = this.model.attributes;
            var $stream = $('.stream', this.$el);
            var View = this.View;

            data[data.key].forEach(function(status, i) {
                var streamItemView = new View({
                    model: status
                });
                var el = streamItemView.render().el;
                $stream.append(el);
            });

            return this;
        },

        template: '<div class="stream"></div>'
    });

    return StreamModule;
});
define("less/app/0.0.1/modules/user-timeline-debug", ["../models/statuses-debug", "../models/stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "./stream-item-debug", "./timeline-debug"], function(require) {

    var tpl = '<div class="stream">{{#each this}}{{#module this name="stream-item"}}{{/module}}{{/each}}</div>';
    var Statuses = require('../models/statuses-debug');
    var StreamItem = require('./stream-item-debug');
    var TimelineModule = require('./timeline-debug');

    var UserStatuses = Statuses.extend({
        url: 'statuses/user_timeline.json'
    });

    var UserTimelineModule = TimelineModule.extend({
        name: 'user-timeline',
        template: tpl,
        StreamItem: StreamItem,
        beforeEnter: function(uidOrName) {
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data[type] = uidOrName;
        },
        initialize: function() {
            this.model = new UserStatuses();
            UserTimelineModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return {
        main: UserTimelineModule,
        args: {
            data: {}
        }
    };
});

define("less/app/0.0.1/modules/comments-debug", ["./comment-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "./tweet-reply-debug", "./tweet-modal-debug", "./tweet-debug", "../models/user-comments-debug", "../models/stream-debug", "./timeline-debug"], function(require, exports) {
    var tpl = '<div class="stream">{{#each this}}{{#module this name="comment"}}{{/module}}{{/each}}</div>';
    var slice = Array.prototype.slice;
    var StreamItem = require('./comment-debug');
    var Comments = require('../models/user-comments-debug');
    var TimelineModule = require('./timeline-debug');

    var CommentsTimelineModule = TimelineModule.extend({
        name: 'comments-timeline',
        template: tpl,
        StreamItem: StreamItem,
        initialize: function() {
            var args = slice.call(arguments);
            this.model = new Comments();
            CommentsTimelineModule.__super__['initialize'].apply(this, args);
        }
    });

    return {
        main: CommentsTimelineModule
    };
})

define("less/app/0.0.1/modules/comment-debug", ["../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "./tweet-reply-debug", "./tweet-modal-debug", "./tweet-debug"], function (require) {

    var tpl = '{{#with user}}{{> stream-item-vcard}}{{/with}}<div class="stream-item-content"><div class="tweet"><a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{ text }}</p><p class="pull-right"><button class="action-reply btn-link" i18n-content="reply">Reply</button><button class="action-del btn-link" i18n-content="delete">Delete</button></p><span class="metadata"><a href="#!/{{user.id}}/{{id}}">{{date_format created_at}}</a><span i18n-content="from">from</span> {{{ source }}}</span></div></div>';
    var weibo = require('../weibo-debug');

    return Backbone.Module.extend({
        name: 'comment',

        className:'stream-item',

        tagName: 'li',

        template: tpl,

        events: {
            'click .action-reply': 'reply',
            'click .action-del': 'del'
        },

        reply: function() {
            var TweetReply = require('./tweet-reply-debug');
            var tweetReply = new TweetReply({
                model: this.model.clone()
            });
            tweetReply.show();
        },

        del: function(e) {
            var self = this;
            var currentTarget = e.currentTarget;

            // prevent race
            if (currentTarget.disabled) return;
            currentTarget.disabled = true;

            weibo.request({
                method: 'POST',
                path: 'comments/destroy.json',
                params: { cid: this.model.get('id') }
            }, function () {
                currentTarget.disabled = false;
                self.$el.slideUp(function () {
                    self.destroy();
                });
            });
        }
    });
});

define("less/app/0.0.1/modules/tweet-reply-debug", ["./tweet-modal-debug", "./tweet-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function (require, exports) {
    var TweetModalModule = require('./tweet-modal-debug');

    var TweetReplyModule = TweetModalModule.extend({
        url: 'comments/reply.json',

        initialize: function() {
            this.model.set({
                title: chrome.i18n.getMessage('statusReplyTitle', this.model.get('user').name),
                actions_list: {}
            });

            TweetReplyModule.__super__['initialize'].apply(this, arguments);
        },

        getTextareaQuote: function() {
            return chrome.i18n.getMessage('reply') + '@' + this.model.get('user').name + ':';
        },

        getParameters: function() {
            return {
                comment: this.getTextareaValue(),
                cid: this.model.get('cid'),
                id: this.model.get('id')
            }
        }
    });

    return TweetReplyModule;
});

define("less/app/0.0.1/modules/tweet-modal-debug", ["./tweet-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function (require) {

    var tpl = '<div class="modal-header"><button type="button" i18n-values="title:close" class="close" data-dismiss="modal">x</button><h3>{{title}}</h3></div><div class="modal-body"><textarea name="status" class="status-editor fullspace"></textarea><div class="status-actions clearfix"><div class="pull-right"><span class="status-counter">140</span><input type="submit" value="Submit" class="status-submit-btn btn btn-primary" disabled></div><ul class="status-actions-list"><li>{{#module name="weibo-emoticons"}}{{/module}}</li>{{#if actions_list.pic}}<li class="dropdown" id="status-pic-dropdown"><a href="#status-pic-dropdown" class="pic-action" i18n-content="image">Image</a><input type="file" class="status-pic-file visuallyhidden" accept="image/*"><ul class="dropdown-menu" id="status-pic-dropdown-menu"><li><canvas class="status-pic-canvas" width="200"></canvas><div class="actions"><button class="status-pic-del btn-link" i18n-content="delete">Delete</button></div></li></ul></li>{{/if}}{{#if actions_list.geo}}<li><button id="status-geo-control" class="action-geo btn-link" i18n-content="enableGeolocation">Enable Geolocation</button></li>{{/if}}{{#if actions_list.topic}}<li><a href="#" class="topic-action" i18n-content="topic">Topic</a></li>{{/if}}</ul></div></div>';
    var TweetBase = require('./tweet-debug');

    var TweetModalModule = TweetBase.extend({
        name:'tweet-modal',

        className: 'modal hide',

        id: 'status-modal',

        template: tpl,

        initialize: function() {
            TweetModalModule.__super__['initialize'].apply(this, arguments);

            var self = this;

            this.$el.on('hidden', function () {
                self.destroy();
            });

            this.on('connected', function() {
                self.$el.modal('hide');
            });
        },

        show: function() {
            this.on('load', function () {
                this.$el.modal('show');
            }, this);

            this
              .render()
              .$el.appendTo('body')
        },

        counterCallback: function(counter, limit) {
            var diff = counter - limit;
            var counterEl = this.el.querySelector('.status-counter');
            counterEl.textContent = String(-diff);
            counterEl.classList[diff > 0 ? 'add' : 'remove']('danger');
        }
    });

    return TweetModalModule;
});

define("less/app/0.0.1/modules/tweet-debug", ["../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function (require) {

    var weibo = require('../weibo-debug');
    var message = require('../message-debug');
    //var util = require('../util-debug');

    var TweetBase = Backbone.Module.extend({
        name:'tweet-base',

        initialize: function() {
            this.on('load', function() {
                this.submitBtn = this.el.querySelector('.status-submit-btn');
                var text = this.getTextareaQuote && this.getTextareaQuote() || '';
                this.trigger('repost', text);
                this.indicateCounter();
            }, this);

            this.on('repost', function(text) {
                var textarea = this.el.querySelector('.status-editor');
                textarea.value = text;
                setTimeout(function() {
                    textarea.focus();
                }, 0);
            }, this);

            TweetBase.__super__['initialize'].apply(this, arguments);
        },

        events:{
            'click .status-submit-btn': 'connect',
            'keyup .status-editor':'indicateCounter',
            'focus .status-editor':'indicateCounter'
        },

        getTextareaValue: function() {
            var textarea = this.el.querySelector('.status-editor');
            return String(textarea.value).trim();
        },

        connect:function (e) {
            e.preventDefault();
            var text = this.getTextareaValue();
            var textarea = this.el.querySelector('.status-editor');
            var self = this;

            if (text === '') {
                textarea.focus();
                return message.createMessage({
                  text: chrome.i18n.getMessage('fieldEmpty')
                });
            }

            var parameters = this.getParameters();

            var loadingMessage = message.createMessage({
              text: chrome.i18n.getMessage('loading'),
              autoHide: false
            });

            var options = {
                method:'POST',
                path: this.url,
                params: parameters
            };
            if (parameters.pic) options.multi = true;
            weibo.request(options, function () {
                textarea.value = '';
                self.trigger('connected');
                loadingMessage.hide();
                message.createMessage({
                  text: 'Success'
                });
            });

            return false;
        },

        indicateCounter: function () {
            var text = this.getTextareaValue();
            var textLen = text.length;

            var result = text.match(/[^\x00-\xff]/g);
            var counter = text.length + (result && result.length) || 0;
            counter = Math.ceil(counter / 2);
            var limit = 140;

            this.submitBtn.disabled = (counter > 0 && counter <= 140) ? false : true;
            if (this.counterCallback) this.counterCallback(counter, limit);
        }
    });

    return TweetBase;
});

define("less/app/0.0.1/models/user-comments-debug", ["./stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function(require, exports) {
    var StreamModel = require('./stream-debug');

    var Comments = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Backbone.Model,

        url: 'comments/timeline.json',

        parse: function(resp, xhr) {
          return resp['comments'];
        },

        sync: StreamModel.prototype.sync
    });

    return Comments;
});

define("less/app/0.0.1/modules/mentions-debug", ["../models/statuses-debug", "../models/stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "./stream-item-debug", "./timeline-debug"], function(require) {

    var tpl = '<div class="stream">{{#each this}}{{#module this name="stream-item"}}{{/module}}{{/each}}</div>';
    var Statuses = require('../models/statuses-debug');
    var StreamItem = require('./stream-item-debug');
    var TimelineModule = require('./timeline-debug');

    var Mentions = Statuses.extend({
        url: 'statuses/mentions.json'
    });

    var MentionsModule = TimelineModule.extend({
        name: 'mentions',
        template: tpl,
        StreamItem: StreamItem,
        initialize: function() {
            this.model = new Mentions();
            MentionsModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return {
        main: MentionsModule,
        args: {
            data: {}
        }
    };
});

define("less/app/0.0.1/modules/relationship-action-debug", ["../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function(require, exports) {

    var tpl = '<div class="relationship-container {{#if following}} following{{/if}}{{#if follow_me}} follow-me{{/if}}"><a href="#" class="btn btn-primary relationship-btn"><span class="btn-text action-following">Following</span><span class="btn-text action-follow">Follow</span><span class="btn-text action-unfollow">Unfollow</span></a><div class="relationship-mutual">{{#if following}}{{#if follow_me}}相互关注{{/if}}{{/if}}</div></div>';
    var weibo = require('../weibo-debug');

    var RelationshipActionModule = Backbone.Module.extend({
        name: 'relationship-action',

        template: tpl,

        events: {
            'click .action-unfollow': 'unfollow',
            'click .action-follow': 'follow'
        },

        unfollow: function(e) {
            e.preventDefault();

            weibo.request({
                method: 'POST',
                path: 'friendships/destory.json',
                params: {
                    uid: this.model.attributes.id
                }
            }, function() {
                var $container = $(e.currentTarget).parents('.relationship-container');
                $container.removeClass('following');
            });
        },

        follow: function(e) {
            e.preventDefault();

            weibo.request({
                method: 'POST',
                path: 'friendships/create.json',
                params: {
                    uid: this.model.attributes.id
                }
            }, function() {
                var $container = $(e.currentTarget).parents('.relationship-container');
                $container.addClass('following');
            });
        }
    });

    return RelationshipActionModule;
});

define("less/app/0.0.1/modules/profile-card-debug", ["../models/user-debug", "../models/stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function(require, exports) {

    var tpl = '<div class="flex-module clearfix"><img src="{{avatar_large}}" width="180" height="180" class="avator" alt="{{screen_name}}"><div class="profile-card-inner"><h1>{{screen_name}}</h1>{{#if description}}<p class="bio">{{description}}</p>{{/if}}<p><span class="location">{{location}}</span>{{#if url}}<span class="divider">.</span><a class="url" href={{url}} target="_blank">{{url}}</a>{{/if}}</p></div><div class="profile-card-actions">{{#module this name="relationship-action"}} {{/module}}{{> profile-stats}}</div></div>';
    var UserModel = require('../models/user-debug');

    var ProfileCardModule = Backbone.Module.extend({
        name: 'profile-card',
        template: tpl,
        beforeEnter: function(uidOrName) {
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data[type] = uidOrName;
        },
        initialize: function() {
            this.model = new UserModel();
            ProfileCardModule.__super__['initialize'].apply(this, arguments);
        }
    });


    return {
      main: ProfileCardModule,
      args: {
        data: {}
      }
    };
});

define("less/app/0.0.1/modules/profile-nav-debug", [], function(require) {

    var tpl = '<ul class="nav nav-tabs nav-stacked"><li data-nav="tweets"><a href="#!/{{id}}">Tweets</a></li><li data-nav="following"><a href="#!/{{id}}/following">Following</a></li><li data-nav="followers"><a href="#!/{{id}}/followers">Followers</a></li></ul>';

    var ProfileNav = Backbone.Module.extend({
        name: 'profile-nav',

        template: tpl,

        initialize: function() {
            this.on('nav', this._changeNavStatus, this);
            ProfileNav.__super__['initialize'].apply(this, arguments);
        },

        beforeEnter: function(uid) {
            this.model.set({ id: uid });
        },

        _changeNavStatus: function(nav_val) {
            var activeClassName = 'active';
            var $target = $('li[data-nav=' + nav_val + ']', this.$el).addClass(activeClassName);
            $target.siblings().removeClass(activeClassName);
        }
    });

    return ProfileNav;
});

define("less/app/0.0.1/modules/connect-nav-debug", ["./profile-nav-debug"], function(require) {

    var tpl = '<ul class="nav nav-tabs nav-stacked"><li data-nav="connect"><a href="#!/connect">Comments</a></li><li data-nav="mentions"><a href="#!/mentions">Mentions</a></li></ul>';
    var ProfileNavModule = require('./profile-nav-debug');

    return ProfileNavModule.extend({
        name: 'connect-nav',
        template: tpl
    });
});
define("less/app/0.0.1/modules/new-tweet-debug", ["./tweet-modal-debug", "./tweet-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function (require) {

    var TweetModalModule = require('./tweet-modal-debug');
    var Message = require('../message-debug');
    var util = require('../util-debug');

    function readImage(file, callback) {
        var readerDataURL = new FileReader();

        readerDataURL.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                callback && callback(img);
            };
            img.src = e.target.result;
        };

        readerDataURL.readAsDataURL(file);
    }

    var PicView = Backbone.View.extend({
        loadFile:function (file, callback) {
            var self = this;
            var err;

            if (file.size > 5 * 1024 * 1024) {
                err = new Error(chrome.i18n.getMessage('fileSizeError'));
            }

            if (err) return callback(err);

            this.pic = file;

            readImage(file, function(img) {
                var canvas = self.el.querySelector('.status-pic-canvas');
                var ctx = canvas.getContext('2d');
                var limit = 200;
                var rect = util.scale(img.width, img.height, limit, limit);

                canvas.height = rect.height;
                ctx.clearRect(0, 0, 200, 200);
                ctx.drawImage(img, parseInt((limit - rect.width) / 2), 0, rect.width, rect.height);
                callback(null);
            });
        },

        events: {
            'click .status-pic-del':'del'
        },

        show: function() {
            this.active = true;
            this.$el.show();
        },

        del: function () {
            $(document).trigger('picture:del');
            this.$el.hide();
            this.pic = null;
            this.active = false;
        }
    });

    var NewTweetModule = TweetModalModule.extend({
        events: {
            'click .action-geo':'_toggleGeo',
            'click .pic-action':'_triggerFileChange',
            'change .status-pic-file':'_loadFile',
            'click .topic-action':'_insertTopic'
        },

        initialize: function() {
            var self = this;

            _.extend(this.events, NewTweetModule.__super__['events']);

            this.model.set({
                title: chrome.i18n.getMessage('statusDefaultTitle'),
                actions_list: {
                    pic: true,
                    geo: true,
                    topic: true
                }
            });

            this._setType('update');
            $(document).on('picture:del', function() {
                self._setType('update');
            });
            NewTweetModule.__super__['initialize'].apply(this, arguments);
        },

        render: function() {
            NewTweetModule.__super__['render'].apply(this, arguments);
            this.picView = new PicView({
                el: this.el.querySelector('#status-pic-dropdown-menu')
            });
            return this;
        },

        _toggleGeo:function (e) {
            e.preventDefault();
            var control = e.currentTarget;
            var text;
            var self = this;

            if (!control.checked) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    self.geo = {
                        lat:position.coords.latitude,
                        long:position.coords.longitude
                    };

                    control.textContent = chrome.i18n.getMessage('disableGeolocation');
                });
                text = 'enableGeolocation';
                control.checked = true;
            } else {
                control.textContent = chrome.i18n.getMessage('enableGeolocation');
                this.geo = null;
                control.checked = false;
            }
        },

        _triggerFileChange:function (e) {
            e.preventDefault();
            if (this.picView.active) return;
            this.el.querySelector('.status-pic-file').click();
        },

        _loadFile:function (e) {
            e.preventDefault();

            var fileEl = e.currentTarget;
            var file = fileEl.files[0];
            var self = this;

            if (!file) return;

            this.submitBtn.disabled = true;
            var message = Message.createMessage({
              text: chrome.i18n.getMessage('generatePreview'),
              autoHide: false
            });
            this._setType('upload');
            this.picView.loadFile(file, function (err) {
                self.picView.show();
                self.indicateCounter();
                message.hide();
            });
        },

        _insertTopic:function (e) {
            e.preventDefault();

            var text = chrome.i18n.getMessage('topicMessage');
            var textarea = this.el.querySelector('.status-editor');
            var delimeter = '#';
            var textFormatted = delimeter + text + delimeter;
            var value = textarea.value;
            var index = value.indexOf(textFormatted);

            if (~index) {
                textarea.selectionStart = index + 1;
                textarea.selectionEnd = index + textFormatted.length - 1;
            } else {
                var start = textarea.selectionStart;
                var end = textarea.selectionEnd;
                if (start != end) {
                    value = value.slice(0, start) +
                        delimeter + value.slice(start, end)
                        + delimeter + value.slice(end);
                    textarea.value = value;
                    textarea.selectionStart = start + 1;
                    textarea.selectionEnd = end + 1;
                } else {
                    value = value.slice(0, start) + textFormatted + value.slice(end);
                    textarea.value = value;
                    textarea.selectionStart = start + 1;
                    textarea.selectionEnd = start + text.length + 1;
                }
            }
            textarea.focus();
            this.indicateCounter();
        },

        _setType: function(type) {
            this.type = type;
            var map = {
                update: 'statuses/update.json',
                upload: 'statuses/upload.json'
            };
            this.url = map[type];
        },

        getParameters: function() {
            var parameters = _.extend({
                status: this.getTextareaValue()
            }, this.geo);

            if (this.type == 'upload') {
                parameters.pic = this.picView.pic
            }

            return parameters;
        }
    });

    return NewTweetModule;
});

define("less/app/0.0.1/modules/following-debug", ["../models/users-debug", "../models/stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "./timeline-debug", "./user-debug"], function(require, exports) {

    var UsersModel = require('../models/users-debug');
    var tpl = '<ul class="stream">{{#each this}}{{#module this name="user"}}{{/module}}{{/each}}</ul>';
    var TimelineModule = require('./timeline-debug');
    var StreamItem = require('./user-debug');

    var FriendsModel = UsersModel.extend({
        url: 'friendships/friends.json'
    });

    var FollowingModule = TimelineModule.extend({
        name: 'following',
        template: tpl,
        StreamItem: StreamItem,
        beforeEnter: function(uidOrName) {
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data[type] = uidOrName;
        },
        initialize: function() {
            this.model = new FriendsModel();
            FollowingModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return {
        main: FollowingModule,
        args: {
            data: {},
            cursor: 'cursor'
        }
    };
});

define("less/app/0.0.1/models/users-debug", ["./stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function(require, exports) {
    var StreamModel = require('./stream-debug');

    var Users = Backbone.Collection.extend({

        // Reference to this collection's model.
        model: Backbone.Model,

        parse: function(resp, xhr) {
          return resp['users'];
        },

        sync: StreamModel.prototype.sync
    });

    return Users;
});

define("less/app/0.0.1/modules/followers-debug", ["../models/users-debug", "../models/stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "./timeline-debug", "./user-debug"], function(require, exports) {

    var UsersModel = require('../models/users-debug');
    var tpl = '<ul class="stream">{{#each this}}{{#module this name="user"}}{{/module}}{{/each}}</ul>';
    var TimelineModule = require('./timeline-debug');
    var StreamItem = require('./user-debug');

    var Followers = UsersModel.extend({
        url: 'friendships/followers.json'
    });

    var FollowersModule = TimelineModule.extend({
        name: 'followers',
        template: tpl,
        StreamItem: StreamItem,
        beforeEnter: function(uidOrName) {
            var type = parseInt(uidOrName) == uidOrName ? 'uid' : 'screen_name';
            this.options.data[type] = uidOrName;
        },
        initialize: function() {
            this.model = new Followers();
            FollowersModule.__super__['initialize'].apply(this, arguments);
        }
    });

    return {
        main: FollowersModule,
        args: {
            data: {},
            cursor: 'cursor'
        }
    };
});

define("less/app/0.0.1/modules/mini-repost-list-debug", ["../models/reposts-debug", "../models/stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "./mini-repost-body-debug"], function(require) {
    var tpl = '<div class="header"></div><div class="body"></div><footer><div class="nav" hidden><button class="nav-prev btn-link" i18n-content="prev">Prev</a></button><button class="nav-next btn-link" i18n-content="next">Next</a></button></div></nav>';

    var MiniRepostList = Backbone.Module.extend({
        name: 'mini-repost-list',

        events: {
            'click .nav-prev': 'navPrev',
            'click .nav-next': 'navNext'
        },

        template: tpl,

        initialize: function() {
            MiniRepostList.__super__['initialize'].apply(this, arguments);

            this.options.data = _.defaults({}, this.options.data, {
                count: 10
            });
            this.currentPage = 0;
            this.totalPage = 0;

            this.on('fetch', function(page, totalNumber) {
                this.currentPage = page;
                var totalPage = this.totalPage = Math.ceil(totalNumber / this.options.data.count);

                if (totalPage > 1) {
                    this.navEl.hidden = false;
                    this.checkNav();
                }
            });

            this.onReady(function() {
                this.navEl = this.el.querySelector('footer .nav');
                this.initTweetModule();
                this.initBody();
            });


            this.on('load', function() {
                this.delegate('mini-stream-item', 'repost', function(text) {
                    var tweetModuleName = this.options.tweetModuleName;
                    this.getChildModuleByName(tweetModuleName)[0].trigger('repost', text);
                }.bind(this));
            }, this);
        },

        navPrev: function() {
            this.fetch(this.currentPage - 1);
        },

        navNext: function() {
            this.fetch(this.currentPage + 1);
        },

        checkNav: function() {
            this.navEl.querySelector('.nav-prev').disabled = !!(this.currentPage == 1);
            this.navEl.querySelector('.nav-next').disabled = !!(this.currentPage == this.totalPage);
        },

        _disableNav: function() {
            _.each(this.navEl.querySelectorAll('button'), function(el) {
                el.disabled = true;
            });
        },

        getBodyModule: function() {
            var data = _.extend({}, this.options.data, {
                page: 1,
                id: this.model.get('id')
            });

            var Reposts = require('../models/reposts-debug');
            var options = {
                model: new Reposts(),
                data: data
            }

            var module = new (require('./mini-repost-body-debug'))(options);

            return {
                main: module,
                args: ['repost']
            }
        },

        initBody: function() {
            var bodyModule = this.getBodyModule()
              , module = bodyModule.main
            this._bodyModuleId = module.id;
            this.append(module, '.body', bodyModule.args);
        },

        initTweetModule: function() {
            var module = Backbone.application.getModuleInstance(this.options.tweetModuleName, {
                model: this.model.clone()
            });

            module.on('connected', function() {
              var bodyModule = this.getChildModuleById(this._bodyModuleId);
              bodyModule.fetch(1);
            }, this);

            this.append(module, '.header');
        },

        fetch: function(page) {
            this._disableNav();
            var bodyModule = this.getChildModuleById(this._bodyModuleId);
            bodyModule.fetch(page);
        }
    });

    return {
        main: MiniRepostList,
        args: {
            tweetModuleName: 'tweet-repost'
        }
    }

});

define("less/app/0.0.1/models/reposts-debug", ["./stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function (require) {
    var Stream = require('../models/stream-debug');

    return Stream.extend({
        url: 'statuses/repost_timeline.json'
    });
});

define("less/app/0.0.1/modules/mini-repost-body-debug", [], function(require) {
    var tpl = '{{#if reposts.length}}{{#each reposts}}{{#module this name="mini-stream-item"}} {{/module}}{{/each}}{{else}}<p>Empty!</p>{{/if}}';
    var loadingBlock = '<div class="loading-area"><img src="images/loading.gif"><span i18n-content="loading">Loading</span></div>';

    var MiniRepostBody = Backbone.Module.extend({
        name: 'mini-repost-body',
        tagName: 'ul',
        template: tpl,
        placeholder: loadingBlock,
        initialize: function() {
            this.onReady(function() {
                this.parent.trigger('fetch', this.options.data.page, this.model.get('total_number'));
            });
            MiniRepostBody.__super__.initialize.apply(this, arguments);
        },
        fetch: function(page) {
            this.options.data.page = page;
            this.refresh('repost');
        }
    });

    return MiniRepostBody;
});

define("less/app/0.0.1/modules/mini-comment-list-debug", ["./mini-repost-list-debug", "../models/reposts-debug", "../models/stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "./mini-repost-body-debug", "../models/comments-debug", "./mini-comment-body-debug"], function(require) {
    var MiniRepostList = require('./mini-repost-list-debug');

    var MiniCommentList = MiniRepostList.main.extend({
        name: 'mini-comment-list',
        getBodyModule: function() {
            var data = _.extend({}, this.options.data, {
                page: 1,
                id: this.model.get('id')
            });
            var Comments = require('../models/comments-debug');
            var MiniCommentBody = require('./mini-comment-body-debug');
            var options = {
                model: new Comments(),
                data: data
            }

            var module = new MiniCommentBody(options);

            return {
                main: module,
                args: ['reply']
            }
        }
    });

    return {
        main: MiniCommentList,
        args: {
            tweetModuleName: 'tweet-comment'
        }
    }

});

define("less/app/0.0.1/models/comments-debug", ["./stream-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function (require) {

    var StreamModel = require('../models/stream-debug');
    var CommentsModel = StreamModel.extend({
        url: 'comments/show.json'
    });

    return CommentsModel;
});

define("less/app/0.0.1/modules/mini-comment-body-debug", ["./mini-repost-body-debug"], function(require) {
    var tpl = '{{#if comments.length}}{{#each comments}}{{#module this name="mini-stream-item"}} {{/module}}{{/each}}{{else}}<p>Empty!</p>{{/if}}';
    var MiniRepostBody = require('./mini-repost-body-debug');

    return MiniRepostBody.extend({
        name: 'mini-comment-body',
        template: tpl,
        fetch: function(page) {
            this.options.data.page = page;
            this.refresh('reply');
        }
    });
});

define("less/app/0.0.1/modules/mini-stream-item-debug", ["./tweet-reply-debug", "./tweet-modal-debug", "./tweet-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug"], function (require) {

    var tpl = '{{#with user}}{{> stream-item-vcard}}{{/with}}<div class="stream-item-content"><div class="tweet"><a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{ text }}</p><p>{{#if action_list.reply}}<button class="action-reply btn-link" i18n-content="reply">Reply</button>{{/if}}{{#if action_list.repost}}<button class="action-repost btn-link" i18n-content="repost">Repost</button>{{/if}}</p></div></div>';

    return Backbone.Module.extend({
        name: 'mini-stream-item',

        className:'stream-item',

        tagName: 'li',

        template: tpl,

        events: {
            'click .action-reply': 'reply',
            'click .action-repost': 'repost'
        },

        beforeEnter: function(action) {
            var data = {};
            data[action] = true;
            this.model.set('action_list', data);
        },

        reply: function() {
            var TweetReply = require('./tweet-reply-debug');
            var tweetReply = new TweetReply({
                model: this.model.clone()
            });
            tweetReply.show();
        },

        repost: function() {
            var text = '//@' + this.model.get('user').name + ':' + this.model.get('text');
            this.trigger('repost', text);
        }
    });
});

define("less/app/0.0.1/modules/tweet-comment-debug", ["./tweet-publisher-inline-debug", "./tweet-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "../flex-textarea-debug"], function (require) {

    var TweetPublisherInline = require('./tweet-publisher-inline-debug');
    var weibo = require('../weibo-debug');

    var TweetComment = TweetPublisherInline.extend({
        name: 'tweet-comment',

        url: 'comments/create.json',

        beforeEnter: function() {
            this.model.set({
                repost: chrome.i18n.getMessage('repostToMyTimeline')
            });

            if (this.model.get('retweeted_status')) {
                this.model.set({
                    comment_ori: true,
                    ori_username: chrome.i18n.getMessage('commentToOrigin', this.model.get('retweeted_status').user.name)
                });
            }
        },

        getParameters: function() {
            var commentOriEl = this.el.querySelector('.js-commentOrigin')
              , commentOri = commentOriEl && commentOriEl.checked
              , status = this.getTextareaValue();

            var params = {
              id: this.model.get('id')
            };

            if (this.el.querySelector('.js-repost').checked) {
              this.url = 'statuses/repost.json';
              params.status = status;
              params.is_comment = commentOri ? 2 : 1;
            } else {
              this.url = 'comments/create.json';
              params.comment = status;

              if (commentOri) {
                params.comment_ori = commentOri ? 1 : 0;
              }
            }

            return params;
        }
    });

    return TweetComment;
});

define("less/app/0.0.1/modules/tweet-publisher-inline-debug", ["./tweet-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "../flex-textarea-debug"], function (require) {
    var TweetBase = require('./tweet-debug');
    var tpl = '<form class="form-inline"><textarea name="status" class="status-editor"></textarea><input type="submit" value="Submit" class="status-submit-btn btn btn-primary" disabled></form><div class="status-actions clearfix"><ul class="status-actions-list"><li>{{#module name="weibo-emoticons"}}{{/module}}</li></ul></div><ul class="status-aside">{{#if comment}}<li><label><input type="checkbox" name="comment" class="js-comment">{{comment}}</label></li>{{/if}}{{#if repost}}<li><label><input type="checkbox" name="repost" class="js-repost">{{repost}}</label></li>{{/if}}{{#if comment_ori}}<li><label><input type="checkbox" name="commentOrigin" class="js-commentOrigin">{{ori_username}}</label></li>{{/if}}</ul>';
    var flexTextarea = require('../flex-textarea-debug');

    var TweetPublisherInline = TweetBase.extend({
        className: 'tweet-publisher-inline',

        template: tpl,

        initialize: function() {
          this.on('load', function() {
            this.flexInstance = flexTextarea(this.el.querySelector('textarea'));
          }, this);

          TweetPublisherInline.__super__.initialize.apply(this, arguments);
        },

        destroy: function() {
          this.flexInstance.destroy()
          TweetPublisherInline.__super__.destroy.apply(this, arguments)
        }
    });

    return TweetPublisherInline;
});

define("less/app/0.0.1/flex-textarea-debug", [], function (require, exports, module) {

  module.exports = flexTextarea

  var tpl = '<div id="flex-textarea"></div>'
    , $flex = $(tpl).appendTo('body')

  $flex.css({
    visibility: 'hidden',
    position: 'fixed'
  })

  function flexTextarea(el) {
    var $el = $(el)
      , eventName = 'keyup.flexTextarea'

    $el.on(eventName, respond)
    setupEl($el)

    function setupEl($el) {
      var attrs = ['font-size', 'line-height', 'width']

      attrs.forEach(function(attr) {
        $flex.css(attr, $el.css(attr));
      })

      setTimeout(function() {
        respond($el.val())
      }, 0)
    }

    function respond(val) {
      $flex.height('auto').text('')
      $flex.text(val || this.value)
      $el.height(Math.max($flex.height(), parseInt($el.css('line-height'))))
    }

    return {
      destroy: function() {
        $el.off(eventName)
      }
    }
  }
});

define("less/app/0.0.1/modules/tweet-repost-debug", ["./tweet-publisher-inline-debug", "./tweet-debug", "../weibo-debug", "../lib/oauth2-debug", "../util-debug", "../message-debug", "../flex-textarea-debug"], function (require) {
    var TweetPublisherInline = require('./tweet-publisher-inline-debug');

    var TweetRepostModule = TweetPublisherInline.extend({
        name: 'tweet-repost',

        url: 'statuses/repost.json',

        beforeEnter: function() {
            if (this.model.get('retweeted_status')) {
                this.model.set({
                    comment_ori: true,
                    ori_username: chrome.i18n.getMessage('commentToOrigin', this.model.get('retweeted_status').user.name)
                });
            }

            this.model.set({
                comment: chrome.i18n.getMessage('commentTo', this.model.get('user').name)
            })
        },

        getTextareaQuote: function() {
            return '//@' + this.model.get('user').name + ':' + this.model.get('text');
        },

        getParameters: function() {
            var params = {
                id: this.model.get('id'),
                status: this.getTextareaValue()
            };

            var is_comment = 0;
            if (this.el.querySelector('.js-comment').checked) is_comment++;
            if (this.el.querySelector('.js-commentOrigin') &&
                this.el.querySelector('.js-commentOrigin').checked) is_comment++;
            params.is_comment = is_comment;

            return params;
        }
    });

    return TweetRepostModule;
});

define("less/app/0.0.1/view_states/index-debug", [], function(require, exports) {

    var tpl = '<div class="container"><div class="row"><div class="dashboard span4"> {{#module name="mini-profile"}} {{/module}}</div><div class="content-main span8"> {{#module name="home-timeline"}} {{/module}}</div></div></div>';

    return function config(application, routeManager) {
        var IndexViewState = Backbone.ViewState.extend({
            name: 'index',
            path: '',
            template: tpl,
            el: application.el
        });

        routeManager.register(IndexViewState);
    };
});

define("less/app/0.0.1/view_states/status-debug", [], function(require, exports) {

	var tpl = '<div class="container">{{#module name="status"}}{{/module}}</div>';

	return function config(application, routeManager) {

		var StatusViewState = Backbone.ViewState.extend({
			name: 'vs-status',
			path: '!/:userId/:statusId*type',
      el: application.el,
			template: tpl
		});

		routeManager.register(StatusViewState);
	};
});

define("less/app/0.0.1/view_states/profile-debug", [], function(require, exports) {

    return function config(application, routeManager) {

        var tpl = '<div class="container">{{#module name="profile-card"}} {{/module}}<div class="row standard-page-body"><div class="dashboard span4">{{#module name="profile-nav"}} {{/module}}</div><div class="content-main span8"></div></div></div>';
        var slice = Array.prototype.slice;
        var profileNav;

        var ProfileViewState = Backbone.ViewState.extend({
            name: 'profile',
            path: '!/:uid',
            template: tpl,
            el: application.el,
            enter: function() {
                if (!this.isActive()) return;

                profileNav = this.getChildModuleByName('profile-nav')[0];
                profileNav.onReady(function() {
                    this.trigger('nav', 'tweets');
                });

                var args = slice.call(arguments);
                var userTimeline = application.getModuleInstance('user-timeline');
                this.append(userTimeline, '.content-main', args);
            },
            transition: function() {
                this.getChildModuleByName('user-timeline')[0].destroy();
            }
        });

        routeManager.register(ProfileViewState);


        var ProfileFollowingViewState = Backbone.ViewState.extend({
            name: 'profile-following',
            path: '!/:uid/following',
            el: application.el,
            enter: function() {
                this.parent.delegateReady('profile-nav', function() {
                    this.trigger('nav', 'following');
                });
                var args = slice.call(arguments);
                var Following = application.getModuleInstance('following');
                this.append(Following, '.content-main', args);
            },
            transition: function() {
                this.getChildModuleByName('following')[0].destroy();
            }
        });

        routeManager.registerSubViewState(ProfileFollowingViewState, ProfileViewState);

        var ProfileFollowersViewState = Backbone.ViewState.extend({
            name: 'profile-followers',
            path: '!/:uid/followers',
            el: application.el,
            enter: function() {
                this.parent.delegateReady('profile-nav', function() {
                    this.trigger('nav', 'followers');
                });
                var args = slice.call(arguments);
                var Following = application.getModuleInstance('followers');
                this.append(Following, '.content-main', args);
            },
            transition: function() {
                this.getChildModuleByName('followers')[0].destroy();
            }
        });

        routeManager.registerSubViewState(ProfileFollowersViewState, ProfileViewState);
    };
});

define("less/app/0.0.1/view_states/connect-debug", [], function(require, exports) {

    var tpl = '<div class="container"><div class="row"><div class="dashboard span4"> {{#module name="connect-nav"}} {{/module}}</div><div class="content-main span8"> </div></div></div>';
    var slice = Array.prototype.slice;

    return function config(application, routeManager) {
        var ConnectViewState = Backbone.ViewState.extend({
            name: 'connect',
            path: '!/connect',
            template: tpl,
            el: application.el,
            enter: function() {
              if (!this.isActive()) return;

              profileNav = this.getChildModuleByName('connect-nav')[0];
              profileNav.onReady(function() {
                  this.trigger('nav', 'connect');
              });

              var userTimeline = application.getModuleInstance('comments-timeline');
              var args = [JSON.parse(localStorage.getItem('uid'))];
              this.append(userTimeline, '.content-main', args);
            },
            transition: function() {
                this.getChildModuleByName('comments-timeline')[0].destroy();
            }
        });

        routeManager.register(ConnectViewState);


        var MentionsViewState = Backbone.ViewState.extend({
            name: 'vs-mentions',
            path: '!/mentions',
            el: application.el,
            enter: function() {
                this.parent.delegateReady('connect-nav', function() {
                    this.trigger('nav', 'mentions');
                });
                var args = slice.call(arguments);
                var mentionsModule = application.getModuleInstance('mentions');
                this.append(mentionsModule, '.content-main', args);
            },
            transition: function() {
                this.getChildModuleByName('mentions')[0].destroy();
            }
        });

        routeManager.registerSubViewState(MentionsViewState, ConnectViewState);
    }
});

define("less/app/0.0.1/init-debug", ["./lib/oauth2-debug", "./util-debug", "./tweet_plugin-debug", "./modules/mini_profile-debug", "./models/signed-user-debug", "./models/user-debug", "./models/stream-debug", "./weibo-debug", "./message-debug", "./modules/weibo-emoticons-debug", "./modules/stream-picture-debug", "./modules/stream-item-debug", "./modules/user-debug", "./modules/home-timeline-debug", "./reminder-debug", "./models/statuses-debug", "./modules/timeline-debug", "./modules/status-debug", "./modules/stream-debug", "./modules/user-timeline-debug", "./modules/comments-debug", "./modules/comment-debug", "./modules/tweet-reply-debug", "./modules/tweet-modal-debug", "./modules/tweet-debug", "./models/user-comments-debug", "./modules/mentions-debug", "./modules/relationship-action-debug", "./modules/profile-card-debug", "./modules/profile-nav-debug", "./modules/connect-nav-debug", "./modules/new-tweet-debug", "./modules/following-debug", "./models/users-debug", "./modules/followers-debug", "./modules/mini-repost-list-debug", "./models/reposts-debug", "./modules/mini-repost-body-debug", "./modules/mini-comment-list-debug", "./models/comments-debug", "./modules/mini-comment-body-debug", "./modules/mini-stream-item-debug", "./modules/tweet-comment-debug", "./modules/tweet-publisher-inline-debug", "./flex-textarea-debug", "./modules/tweet-repost-debug", "./view_states/index-debug", "./view_states/status-debug", "./view_states/profile-debug", "./view_states/connect-debug"], function(require, exports) {

    var oauth2 = require('./lib/oauth2-debug').getInstance();
    var util = require('./util-debug');
    var TweetPlugins = require('./tweet_plugin-debug');

    if (!oauth2.hasToken()) {
        window.location.href = chrome.extension.getURL('login.html');
    }

    Backbone.install({
        el: '#main'
    }, function(application, routeManager) {
        var render_tmp  = Backbone.Module.prototype.render;

        Backbone.Module.prototype.render = function() {
            render_tmp.apply(this, arguments);
            i18nTemplate.process(this.el, chrome.i18n.getMessage);
            return this;
        };

        Handlebars.registerHelper('date_format', util.dateFormat);
        Handlebars.registerHelper('tweet_plugins_process', TweetPlugins.process);

        Handlebars.registerPartial('stream-item-vcard', '<div class="stream-item-vcard"><a class="vcard" title="{{ name }}" href="#!/{{ id }}"><img width="50" height="50" src="{{ profile_image_url }}" class="avator"></a></div>');
        Handlebars.registerPartial('stream-item-tweet-content', '<a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{#tweet_plugins_process text}}{{/tweet_plugins_process}}</p>{{#if thumbnail_pic}}{{#module this name="stream-picture"}}{{/module}}{{/if}}');
        Handlebars.registerPartial('stream-item-footer', '<div class="stream-item-footer{{#if action_fav}} stream-item-primary-footer{{/if}}"><span class="metadata"><a href="#!/{{user.id}}/{{id}}">{{date_format created_at}}</a><span i18n-content="from">from</span> {{{ source }}}</span><ul class="actions">{{#if action_del}}<a href="#" title="Delete" class="action-del" i18n-values="title:delete"><span class="icon icon-16 icon-del"></span></a>{{/if}}{{#if action_fav}}<li>{{! FIXME: favorited is aways false }}<a href="#" title="Favorite" class="action-favorite{{#if favorited}} favorited{{/if}}" i18n-values="title:favorite"><span class="icon icon-16 icon-favorite"></span></a></li>{{/if}}<li><a href="#!/{{user.id}}/{{id}}/repost" title="Repost" class="action-repost" i18n-values="title:repost"><span class="icon icon-16 icon-repost"></span>{{ reposts_count }}</a></li><li><a href="#!/{{user.id}}/{{id}}/comment" title="Comment" class="action-comment" i18n-values="title:comment"><span class="icon icon-16 icon-comment"></span>{{ comments_count }}</a></li></ul></div>');
        Handlebars.registerPartial('profile-stats', '<ul class="profile-stats"><li><a href="#!/{{id}}"><strong>{{statuses_count}}</strong>TWEETS</a></li><li><a href="#!/{{id}}/following"><strong>{{friends_count}}</strong>FOLLOWING</a></li><li><a href="#!/{{id}}/followers"><strong>{{followers_count}}</strong>FOLLOWERS</a></li></ul>');
        Handlebars.registerPartial('stream-item-profile-content', '<div class="stream-item-content"><div class="actions"> {{#module this name="relationship-action"}} {{/module}}</div><div class="content"><a href="#!/{{id}}" class="username">{{screen_name}}</a><p class="bio">{{description}}</p></div></div>');

        application.registerModule(require('./modules/mini_profile-debug'));
        application.registerModule(require('./modules/weibo-emoticons-debug'));
        application.registerModule(require('./modules/stream-picture-debug'));
        application.registerModule(require('./modules/stream-item-debug'));
        application.registerModule(require('./modules/user-debug'));
        application.registerModule(require('./modules/home-timeline-debug'));
        application.registerModule(require('./modules/status-debug'));
        application.registerModule(require('./modules/stream-debug'));
        application.registerModule(require('./modules/user-timeline-debug'));
        application.registerModule(require('./modules/comments-debug'));
        application.registerModule(require('./modules/comment-debug'));
        application.registerModule(require('./modules/mentions-debug'));
        application.registerModule(require('./modules/relationship-action-debug'));
        application.registerModule(require('./modules/profile-card-debug'));
        application.registerModule(require('./modules/profile-nav-debug'));
        application.registerModule(require('./modules/connect-nav-debug'));
        application.registerModule(require('./modules/new-tweet-debug'));
        application.registerModule(require('./modules/following-debug'));
        application.registerModule(require('./modules/followers-debug'));
        application.registerModule(require('./modules/mini-repost-list-debug'));
        application.registerModule(require('./modules/mini-comment-list-debug'));
        application.registerModule(require('./modules/mini-repost-body-debug'));
        application.registerModule(require('./modules/mini-comment-body-debug'));
        application.registerModule(require('./modules/mini-stream-item-debug'));
        application.registerModule(require('./modules/tweet-comment-debug'));
        application.registerModule(require('./modules/tweet-repost-debug'));


        require('./view_states/index-debug')(application, routeManager);
        require('./view_states/status-debug')(application, routeManager);
        require('./view_states/profile-debug')(application, routeManager);
        require('./view_states/connect-debug')(application, routeManager);

        var Reminder = require('./reminder-debug');
        var user;

        Reminder.on('all', function reminder_listener(eventName, count) {
          if (eventName == 'status') return;

          if (!user) {
            user = JSON.parse(localStorage.getItem('user'));
            if (!user) return;
          }

          var pathMap = {
            follower: user.id + '/followers',
            cmt: 'connect',
            mention_status: 'mentions',
            mention_cmt: 'mentions'
          };
          var path = pathMap[eventName];
          path = path ? '#!/' + path : '#';
          var type = chrome.i18n.getMessage('remind_' + eventName);

          var notification = webkitNotifications.createNotification(
            user.profile_image_url,
            user.name,
            chrome.i18n.getMessage('unreadMessage', [count, type])
          );
          notification.onclick = function() {
            window.location.hash = path;
          };
          notification.show();
        });

        $('#global-new-tweet-button').click(function(e) {
            e.stopPropagation();

            var NewTweetModule = require('./modules/new-tweet-debug');
            var Model = Backbone.Model.extend({ url: null });
            var newTweetModule = new NewTweetModule({
                model: new Model()
            });
            newTweetModule.show();
        });

        routeManager.on('nav', function(val) {
          var $globalActions = $('#global-actions')
            , $lis = $('li', $globalActions)
            , $li = $lis.filter('[data-nav="' + val + '"]')

          $lis.removeClass('active');

          if ($li.length > 0) {
            $li.addClass('active');
          }
        });


        Backbone.history.start();
        Backbone.history.checkUrl();

        $('#loading-mask').fadeOut();
    });

});
