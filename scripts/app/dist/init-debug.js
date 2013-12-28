define("less/app/1.0.0/init-debug", [ "./lib/oauth2-debug", "./util-debug", "./tweet_plugin-debug", "./views/stream_item_vcard-debug.tpl", "./views/stream-item-content-debug.tpl", "./views/stream-item-footer-debug.tpl", "./views/profile-stats-debug.tpl", "./views/stream-item-profile-content-debug.tpl", "./view_states/index-debug", "./views/index-debug.tpl", "./modules/mini_profile-debug", "./views/mini_profile-debug.tpl", "./models/signed-user-debug", "./models/user-debug", "./models/weibo-debug", "./weibo-debug", "./message-debug", "./modules/home-timeline-debug", "./reminder-debug", "./views/home-timeline-debug.tpl", "./modules/stream-item-debug", "./views/stream-item-debug.tpl", "./modules/mini-repost-list-debug", "./views/mini-repost-list-debug.tpl", "./modules/tweet-repost-debug", "./modules/tweet-publisher-inline-debug", "./modules/tweet-debug", "./views/tweet-comment-debug.tpl", "./modules/mini-repost-body-debug", "./views/mini-repost-body-debug.tpl", "./views/loading-debug.tpl", "./modules/mini-stream-item-debug", "./views/mini-stream-item-debug.tpl", "./modules/tweet-reply-debug", "./modules/tweet-modal-debug", "./views/tweet-modal-debug.tpl", "./modules/weibo-emoticons-debug", "./views/weibo-emoticons-debug.tpl", "./views/weibo-emoticons-body-debug.tpl", "./views/weibo-emoticons-nav-debug.tpl", "./models/reposts-debug", "./models/stream-debug", "./modules/mini-comment-list-debug", "./modules/tweet-comment-debug", "./modules/mini-comment-body-debug", "./views/mini-comment-body-debug.tpl", "./models/comments-debug", "./modules/stream-picture-debug", "./views/stream-picture-debug.tpl", "./models/statuses-debug", "./modules/timeline-debug", "./views/timeline-debug.tpl", "./view_states/profile-debug", "./views/profile-debug.tpl", "./modules/profile-nav-debug", "./views/profile-nav-debug.tpl", "./modules/profile-card-debug", "./views/profile-card-debug.tpl", "./modules/following-debug", "./models/users-debug", "./models/cursor-debug", "./views/users-debug.tpl", "./modules/user-debug", "./views/user-debug.tpl", "./modules/relationship-action-debug", "./views/relationship-action-debug.tpl", "./modules/followers-debug", "./modules/user-timeline-debug", "./views/user-timeline-debug.tpl", "./view_states/connect-debug", "./views/connect-debug.tpl", "./modules/connect-nav-debug", "./views/connect-nav-debug.tpl", "./modules/comments-debug", "./views/comments-timeline-debug.tpl", "./modules/comment-debug", "./views/comment-debug.tpl", "./models/user-comments-debug", "./modules/mentions-debug", "./modules/new-tweet-debug" ], function(require, exports) {
    var oauth2 = require("./lib/oauth2-debug").getInstance();
    var util = require("./util-debug");
    var TweetPlugins = require("./tweet_plugin-debug");
    if (!oauth2.hasToken()) {
        window.location.href = chrome.extension.getURL("login.html");
    }
    var router = new Backbone.Router();
    Backbone.install({
        el: "#main"
    }, function(application) {
        var render_tmp = Backbone.Module.prototype.__render;
        Backbone.Module.prototype.__render = function() {
            render_tmp.apply(this, arguments);
            i18nTemplate.process(this.el, chrome.i18n.getMessage);
            return this;
        };
        Handlebars.registerHelper("date_format", util.dateFormat);
        Handlebars.registerHelper("tweet_plugins_process", TweetPlugins.process);
        Handlebars.registerPartial("stream-item-vcard", require("./views/stream_item_vcard-debug.tpl"));
        Handlebars.registerPartial("stream-item-tweet-content", require("./views/stream-item-content-debug.tpl"));
        Handlebars.registerPartial("stream-item-footer", require("./views/stream-item-footer-debug.tpl"));
        Handlebars.registerPartial("profile-stats", require("./views/profile-stats-debug.tpl"));
        Handlebars.registerPartial("stream-item-profile-content", require("./views/stream-item-profile-content-debug.tpl"));
        require("./view_states/index-debug")(application, router);
        //        require('./view_states/status.js')(application, router);
        require("./view_states/profile-debug")(application, router);
        require("./view_states/connect-debug")(application, router);
        var Reminder = require("./reminder-debug");
        var user;
        Reminder.on("all", function reminder_listener(eventName, count) {
            if (eventName == "status") return;
            if (!user) {
                user = JSON.parse(localStorage.getItem("user"));
                if (!user) return;
            }
            var pathMap = {
                follower: user.id + "/followers",
                cmt: "connect",
                mention_status: "mentions",
                mention_cmt: "mentions"
            };
            var path = pathMap[eventName];
            path = path ? "#!/" + path : "#";
            var type = chrome.i18n.getMessage("remind_" + eventName);
            var notification = webkitNotifications.createNotification(user.profile_image_url, user.name, chrome.i18n.getMessage("unreadMessage", [ count, type ]));
            notification.onclick = function() {
                window.location.hash = path;
            };
            notification.show();
        });
        $("body").on("click", "#global-new-tweet-button", function(e) {
            e.stopPropagation();
            var NewTweetModule = require("./modules/new-tweet-debug");
            var newTweetModule = new NewTweetModule();
            newTweetModule.show();
        });
        $("#loading-mask").fadeOut();
    });
});

define("less/app/1.0.0/lib/oauth2-debug", [ "less/app/1.0.0/util-debug" ], function(require, exports) {
    var util = require("less/app/1.0.0/util-debug");
    function OAuth2(client_id, request_url, redirect_url) {
        this.client_id = client_id;
        this.request_url = request_url;
        this.redirect_url = redirect_url;
        this.key_token = "oauth2_token";
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
            response_type: "token"
        };
        return util.addURLParam(url, params);
    };
    p.request = function(method, url, params, multi, callback) {
        callback = arguments[arguments.length - 1];
        if (typeof multi != "boolean") {
            multi = false;
        }
        if (typeof params == "function") {
            callback = params;
            params = {};
        }
        var instance = new Request(method, url, params, multi);
        var result = instance.generate();
        if (this.hasToken()) {
            result.headers["Authorization"] = "OAuth2" + " " + this.getToken();
        }
        this.sendRequest(method, result.signed_url, result.headers, result.body, function(data, xhr) {
            callback(data, xhr);
        });
    };
    p.get = function() {
        var args = [ "GET" ].concat(arguments);
        this.request.apply(this, args);
    };
    p.post = function() {
        var args = [ "POST" ].concat(arguments);
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
            for (var header in headers) {
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
        this._nonce_chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
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
        headers["Content-Type"] = this.multi ? "multipart/form-data; boundary=" + this.boundary : "application/x-www-form-urlencoded";
        return headers;
    };
    p.getSingedURL = function() {
        var url = this.url;
        if (this.method == "GET") {
            url = util.addURLParam(url, this.params);
        }
        this.signed_url = url;
        return url;
    };
    p.getBody = function() {
        if (this.method == "GET") {
            return null;
        }
        var data;
        if (this.multi) {
            this.getUniqueBoundary();
            var boundary = this.boundary, crlf = "\r\n", dashdash = "--", pic = this.pic;
            var blobHead = "", blobFooter = "";
            blobHead = dashdash + boundary + crlf;
            for (var i in this.params) {
                blobHead += 'Content-Disposition: form-data; name="' + i + '"' + crlf + crlf;
                blobHead += this.params[i] + crlf;
                blobHead += dashdash;
                blobHead += boundary;
                blobHead += crlf;
            }
            blobHead += 'Content-Disposition: form-data; name="pic"; filename="' + pic.fileName + '"' + crlf;
            blobHead += "Content-Type: " + pic.fileType + crlf + crlf;
            blobFooter = crlf;
            blobFooter += dashdash;
            blobFooter += boundary;
            blobFooter += dashdash;
            blobFooter += crlf;
            data = new Blob([ blobHead, pic, blobFooter ], {
                type: "application/octet-binary"
            });
        } else {
            data = util.stringify(this.params);
        }
        return data;
    };
    p.getUniqueBoundary = function() {
        var result = "", length = 10, cLength = this._nonce_chars.length;
        for (var i = 0; i < length; i++) {
            var rnum = Math.floor(Math.random() * cLength);
            result += this._nonce_chars.substring(rnum, rnum + 1);
        }
        this.boundary = "----boundary" + result;
        return this;
    };
    app.addSingletonGetter(OAuth2);
    return OAuth2;
});

define("less/app/1.0.0/util-debug", [], function(require, exports) {
    /**
	 * Decodes a URL-encoded string into key/value pairs.
	 * @param {String} encoded An URL-encoded string.
	 * @param {String} sep Separator.
	 * @return {Object} An object representing the decoded key/value pairs found
	 *     in the encoded string.
	 */
    function formDecode(encoded, sep) {
        sep = sep === undefined ? "&" : sep;
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
        var tmp = val.replace(/%21/g, "!").replace(/%2A/g, "*").replace(/%27/g, "'").replace(/%28/g, "(").replace(/%29/g, ")");
        return decodeURIComponent(tmp);
    }
    function toRfc3986(val) {
        return encodeURIComponent(val).replace(/\!/g, "%21").replace(/\*/g, "%2A").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
    }
    function addURLParam(url, key, value) {
        if (typeof key == "object") {
            var obj = key;
            if (!isEmptyObject(obj)) {
                return url + "?" + stringify(obj);
            }
        } else {
            var sep = url.indexOf("?") >= 0 ? "&" : "?";
            return url + sep + toRfc3986(key) + "=" + toRfc3986(value);
        }
        return url;
    }
    function stringify(obj) {
        var result = "";
        for (var key in obj) {
            result += toRfc3986(key) + "=" + toRfc3986(obj[key]) + "&";
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
        for (var key in obj) {
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
    var EN_LT_RE = /</g;
    var EN_GT_RE = />/g;
    var EN_QUOT_RE = /"/g;
    var EN_SINGLE_RE = /'/g;
    // encode text into HTML to avoid XSS attacks.
    // underscore templates do not auto encode. If in doubt, use this!
    function htmlEncode(text) {
        text = "" + text;
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
        text = "" + text;
        text = text.toString().replace(DE_GT_RE, ">");
        text = text.replace(DE_LT_RE, "<");
        text = text.replace(DE_QUOT_RE, '"');
        text = text.replace(DE_QUOT_RE, '"');
        text = text.replace(DE_SINGLE_RE, "'");
        return text;
    }
    function loadStyle(href, id) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
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
            height = parseInt(height / ratio);
        }
        return {
            width: width,
            height: height
        };
    }
    function dateFormat(date, options) {
        date = new Date(date);
        var timeStamp = date.getTime(), diff = new Date().getTime() - timeStamp, second = 1e3, minute = 1e3 * 60, hour = 60 * minute, day = 24 * hour, result;
        var cycle = {
            days: day,
            hours: hour,
            minutes: minute,
            seconds: second
        };
        var immediate = diff / day;
        if (immediate > 5) {
            result = [ date.getFullYear(), date.getMonth() + 1, date.getDate() ].join("-") + " " + date.toLocaleTimeString();
        } else {
            for (var metric in cycle) {
                immediate = diff / cycle[metric];
                if (immediate > 1) {
                    result = Math.round(immediate) + " " + chrome.i18n.getMessage(metric) + " " + chrome.i18n.getMessage("ago");
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

define("less/app/1.0.0/tweet_plugin-debug", [ "less/app/1.0.0/util-debug" ], function(require) {
    var emoticonsObj;
    function initializeEmoticons() {
        emoticonsObj = {};
        var emoticons = {};
        emoticons.forEach(function(emoticon) {
            emoticonsObj[emoticon.value] = emoticon.url;
        });
    }
    var util = require("less/app/1.0.0/util-debug");
    var plugins = [ function url(content) {
        return content.replace(/\b(http:\/\/[\w\.\/]+)/g, function(s0, url) {
            return '<a target="_blank" href="' + url + '">' + url + "</a>";
        });
    }, function tag(content) {
        return content.replace(/#([^\#]*?)#/g, function(s0, tag) {
            return '<a target="_blank" href="http://weibo.com/k/' + util.fromRfc3986(tag) + '">' + s0 + "</a>";
        });
    }, function emoticons(content) {
        if (!emoticonsObj) {
            //                initializeEmoticons();
            return content;
        }
        return content.replace(/\[([^\]]*?)\]/g, function(value, title) {
            var url = emoticonsObj[value];
            if (url) {
                return '<img src="' + url + '" title="' + title + '" alt="' + value + '">';
            } else {
                return value;
            }
        });
    }, function mention(content) {
        return content.replace(/@([\u4e00-\u9fa5\w-]+)/g, function(s0, user) {
            return '<a class="name" href="#!/' + user + '">@' + user + "</a>";
        });
    } ];
    return {
        process: function(content) {
            return plugins.reduce(function(content, fn) {
                return fn(content);
            }, content);
        }
    };
});

define("less/app/1.0.0/views/stream_item_vcard-debug.tpl", [], '<div class="stream-item-vcard">\n    <a class="vcard" title="{{ name }}" href="#u/{{ id }}">\n        <img width="50" height="50" src="{{ profile_image_url }}" class="avator">\n    </a>\n</div>');

define("less/app/1.0.0/views/stream-item-content-debug.tpl", [], '<a href="#u/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{#tweet_plugins_process text}}{{/tweet_plugins_process}}</p>\n<div class="thumbnail_pic-container"></div>');

define("less/app/1.0.0/views/stream-item-footer-debug.tpl", [], '<div class="stream-item-footer {{#if primary}}stream-item-primary-footer{{else}}stream-item-footer-retweet{{/if}}">\n    <span class="metadata">\n        <a href="#!/{{user.id}}/{{id}}">{{date_format created_at}}</a>\n        <span i18n-content="from">from</span> {{{ source }}}\n    </span>\n    <ul class="actions">\n        {{#if primary}}\n            {{#if action_del}}\n                <li>\n                    <a href="#" title="Delete" class="action-del" i18n-values="title:delete">\n                        <span class="icon icon-16 icon-del"></span>\n                    </a>\n                </li>\n            {{/if}}\n            <li>{{! FIXME: favorited is aways false }}\n                    <a href="#" title="Favorite" class="action-favorite{{#if favorited}} favorited{{/if}}" i18n-values="title:favorite">\n                            <span class="icon icon-16 icon-favorite"></span>\n                    </a>\n            </li>\n        {{/if}}\n        <li>\n            <a href="{{#if primary}}#!/{{user.id}}/{{id}}/repost{{else}}#{{/if}}"{{#unless primary}} target="_blank"{{/unless}} title="Repost" class="action-repost" i18n-values="title:repost">\n                <span class="icon icon-16 icon-repost"></span>\n                {{ reposts_count }}\n            </a>\n        </li>\n        <li>\n            <a href="{{#if primary}}#!/{{user.id}}/{{id}}/comment{{else}}#{{/if}}"{{#unless primary}} target="_blank"{{/unless}} title="Comment" class="action-comment" i18n-values="title:comment">\n                <span class="icon icon-16 icon-comment"></span>\n                {{ comments_count }}\n            </a>\n        </li>\n    </ul>\n</div>\n');

define("less/app/1.0.0/views/profile-stats-debug.tpl", [], '<ul class="profile-stats">\n    <li><a href="#u/{{id}}"><strong>{{statuses_count}}</strong>TWEETS</a></li>\n    <li><a href="#u/{{id}}/following"><strong>{{friends_count}}</strong>FOLLOWING</a></li>\n    <li><a href="#u/{{id}}/followers"><strong>{{followers_count}}</strong>FOLLOWERS</a></li>\n</ul>');

define("less/app/1.0.0/views/stream-item-profile-content-debug.tpl", [], '<div class="stream-item-content">\n    <div class="actions"> {{#module this name="relationship-action"}} {{/module}}</div>\n    <div class="content">\n        <a href="#!/{{id}}" class="username">{{screen_name}}</a>\n        <p class="bio">{{description}}</p>\n    </div>\n</div>\n');

define("less/app/1.0.0/view_states/index-debug", [ "less/app/1.0.0/modules/mini_profile-debug", "less/app/1.0.0/models/signed-user-debug", "less/app/1.0.0/models/user-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/home-timeline-debug", "less/app/1.0.0/reminder-debug", "less/app/1.0.0/modules/stream-item-debug", "less/app/1.0.0/modules/mini-repost-list-debug", "less/app/1.0.0/modules/tweet-repost-debug", "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/modules/mini-repost-body-debug", "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/modules/mini-comment-list-debug", "less/app/1.0.0/modules/tweet-comment-debug", "less/app/1.0.0/modules/mini-comment-body-debug", "less/app/1.0.0/models/comments-debug", "less/app/1.0.0/modules/stream-picture-debug", "less/app/1.0.0/models/statuses-debug", "less/app/1.0.0/modules/timeline-debug" ], function(require, exports) {
    var tpl = require("less/app/1.0.0/views/index-debug.tpl");
    var MiniProfileMod = require("less/app/1.0.0/modules/mini_profile-debug");
    var HomeTimelineMod = require("less/app/1.0.0/modules/home-timeline-debug");
    return function config(application) {
        var IndexViewState = Backbone.Module.extend({
            name: "index",
            __parseParent: function() {
                return application.el;
            },
            render: function() {
                this.$el.html(tpl);
                this.append(MiniProfileMod, ".dashboard", [ {
                    uid: localStorage.uid
                } ]);
                this.append(HomeTimelineMod, ".content-main");
                return this;
            }
        });
        application.register("", IndexViewState);
    };
});

define("less/app/1.0.0/views/index-debug.tpl", [], '<div class="container">\n    <div class="row">\n        <div class="dashboard span4"> </div>\n        <div class="content-main span8"> </div>\n    </div>\n</div>\n');

define("less/app/1.0.0/modules/mini_profile-debug", [ "less/app/1.0.0/models/signed-user-debug", "less/app/1.0.0/models/user-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var tpl = require("less/app/1.0.0/views/mini_profile-debug.tpl");
    var SignedUserModel = require("less/app/1.0.0/models/signed-user-debug");
    var MiniProfileModule = Backbone.Module.extend({
        name: "mini-profile",
        className: "module",
        placeholder: "Loading..",
        template: tpl,
        initialize: function() {
            this.model = new SignedUserModel();
            this.options = {};
            this.options.data = {
                uid: localStorage.getItem("uid")
            };
            MiniProfileModule.__super__["initialize"].apply(this, arguments);
        }
    });
    return MiniProfileModule;
});

define("less/app/1.0.0/views/mini_profile-debug.tpl", [], '<div class="flex-module">\n    <div class="profile-summary"><a href="#u/{{id}}">\n        <div class="content"><img src="{{profile_image_url}}" class="avatar"> <b class="fullname">{{screen_name}}</b>\n            <small class="meta">View my profile page</small>\n        </div>\n    </a></div>\n</div>\n<div class="flex-module">{{> profile-stats}}</div>');

define("less/app/1.0.0/models/signed-user-debug", [ "less/app/1.0.0/models/user-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var UserModel = require("less/app/1.0.0/models/user-debug");
    return UserModel.extend({
        storeID: "user"
    });
});

define("less/app/1.0.0/models/user-debug", [ "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var WeiboModel = require("less/app/1.0.0/models/weibo-debug");
    return WeiboModel.extend({
        url: "users/show.json"
    });
});

define("less/app/1.0.0/models/weibo-debug", [ "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var weibo = require("less/app/1.0.0/weibo-debug");
    var methodMap = {
        create: "POST",
        update: "PUT",
        "delete": "DELETE",
        read: "GET"
    };
    return Backbone.Model.extend({
        sync: function(method, model, options) {
            var params = {
                path: model.url,
                method: methodMap[method],
                params: options.data
            };
            if (_.isString(model.storeID)) {
                var success = options.success;
                if (method == "read") {
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
});

define("less/app/1.0.0/weibo-debug", [ "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var oauth2 = require("less/app/1.0.0/lib/oauth2-debug").getInstance();
    var message = require("less/app/1.0.0/message-debug");
    const API_SHORTHANDS = {
        timeline: "statuses/home_timeline.json",
        mentions: "statuses/mentions.json",
        user: "statuses/user_timeline.json",
        comments: "comments/to_me.json",
        "comments-tome": "comments/to_me.json",
        "comments-byme": "comments/by_me.json",
        favorites: "favorites.json",
        follows: "friendships/friends.json",
        followers: "friendships/followers.json"
    };
    function shorthandRequest(hash, params, callback) {
        var path = API_SHORTHANDS[hash];
        if (!path) {
            return;
        }
        if (typeof params == "function") {
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
        var base_url = options.base_url || "https://api.weibo.com/2/", url = base_url + options.path, method = options.method || "GET", multi = options.multi || false;
        oauth2.request(method, url, options.params, multi, function(data, xhr) {
            if (data.error_code && data.error_code <= 21332 && data.error_code >= 21322) {
                window.location.href = chrome.extension.getURL("login.html");
                return;
            }
            var isObj = typeof callback == "object";
            var errorHandler = isObj && callback.error ? callback.error : request.errorHandler;
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
            actions: [ {
                label: "Ok",
                click: function() {
                    this.hide();
                }
            } ],
            className: "error"
        });
    };
    return {
        request: request
    };
});

define("less/app/1.0.0/message-debug", [], function(require, exports) {
    var Message = function() {
        this.initialize.apply(this, arguments);
    };
    Message.prototype = {
        constructor: Message,
        initialize: function(options) {
            var options = $.extend({}, Message.defaults, options), self = this;
            this.option(options);
            var $el = this.$el = $('<div class="message"><div class="message-inner">' + '<span class="message-text">' + options.text + "</span></div></div>");
            if (options.actions) {
                var $actions = $('<div class="message-actions" />');
                options.actions.forEach(function(item) {
                    var $action = $('<button class="btn-link">' + item.label + "</button>");
                    $action.click(_.bind(item.click, self));
                    $actions.append($action);
                });
                $el.find(".message-inner").append($actions);
            }
            if (typeof options.className == "string") {
                $el.addClass(this.options.className);
            }
            _.bindAll(this, "hide");
            if (this.option("autoOpen")) {
                this.show();
            }
        },
        show: function() {
            this.$el.appendTo("body");
            if (this.option("autoHide")) {
                this.addTimer();
            }
        },
        hide: function() {
            this.$el.remove();
        },
        addTimer: function() {
            this.timer = window.setTimeout(this.hide, this.option("hideTimeout"));
        },
        clearTimer: function() {
            if (this.timer) {
                window.clearTimeout(this.timer);
            }
        }
    };
    _.extend(Message.prototype, app.Options);
    Message.defaults = {
        hideTimeout: 4e3,
        autoOpen: true,
        autoHide: true
    };
    return {
        createMessage: function(options) {
            return new Message(options);
        }
    };
});

define("less/app/1.0.0/modules/home-timeline-debug", [ "less/app/1.0.0/reminder-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/stream-item-debug", "less/app/1.0.0/modules/mini-repost-list-debug", "less/app/1.0.0/modules/tweet-repost-debug", "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/modules/mini-repost-body-debug", "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/modules/mini-comment-list-debug", "less/app/1.0.0/modules/tweet-comment-debug", "less/app/1.0.0/modules/mini-comment-body-debug", "less/app/1.0.0/models/comments-debug", "less/app/1.0.0/modules/stream-picture-debug", "less/app/1.0.0/models/statuses-debug", "less/app/1.0.0/modules/timeline-debug" ], function(require, exports) {
    var Reminder = require("less/app/1.0.0/reminder-debug");
    var tpl = require("less/app/1.0.0/views/home-timeline-debug.tpl");
    var slice = Array.prototype.slice;
    var StreamItem = require("less/app/1.0.0/modules/stream-item-debug");
    var Statuses = require("less/app/1.0.0/models/statuses-debug");
    var TimelineModule = require("less/app/1.0.0/modules/timeline-debug");
    var HomeTimelineModule = TimelineModule.extend({
        name: "home-timeline",
        template: tpl,
        events: {
            "click .status-unread-count": "_renderUnread"
        },
        initialize: function() {
            Reminder.on("status", this._handleUnread, this);
            this.__item = StreamItem;
            this.collection = new Statuses();
            HomeTimelineModule.__super__["initialize"].apply(this, arguments);
        },
        render: function() {
            var self = this;
            this.$el.html(tpl);
            this.collection.fetch({
                success: function(collection, data) {}
            });
            this.$unreadCount = this.$el.find(".status-unread-count");
            return this;
        },
        _handleUnread: function(count) {
            this.$unreadCount.text("有 " + count + " 条新微博，点击查看").show();
        },
        _renderUnread: function() {
            this.$unreadCount.hide();
            this.fetch({
                data: {
                    since_id: this.collection.first().id
                },
                position: "prepend"
            });
        },
        destroy: function() {
            Reminder.off("status", this._handleUnread, this);
            HomeTimelineModule.__super__["destroy"].apply(this, arguments);
        }
    });
    return HomeTimelineModule;
});

// Reminder
define("less/app/1.0.0/reminder-debug", [ "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require) {
    //    var pollingInterval = app.settings.get('general', 'pollingInterval') * 1000;
    var pollingInterval = 120 * 1e3;
    var weibo = require("less/app/1.0.0/weibo-debug");
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
            base_url: "https://rm.api.weibo.com/2/",
            path: "remind/unread_count.json"
        }, {
            success: function(data) {
                var i, val;
                for (i in data) {
                    val = data[i];
                    if (val) Reminder.trigger(i, val);
                }
            },
            failure: function() {
                self.pollingInterval *= 2;
            }
        });
    }
    setInterval(function() {
        //Idle threshold in seconds
        chrome.idle.queryState(30, function(newState) {
            var isActive = newState == "active";
            if (!isActive || document.webkitHidden) return;
            fetchUnread();
        });
    }, pollingInterval);
    var Reminder = function() {};
    _.extend(Reminder, Backbone.Events);
    return Reminder;
});

define("less/app/1.0.0/views/home-timeline-debug.tpl", [], '<div class="status-unread-count hide"></div>\n<div class="stream"></div>');

define("less/app/1.0.0/modules/stream-item-debug", [ "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/mini-repost-list-debug", "less/app/1.0.0/modules/tweet-repost-debug", "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/modules/mini-repost-body-debug", "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/modules/mini-comment-list-debug", "less/app/1.0.0/modules/tweet-comment-debug", "less/app/1.0.0/modules/mini-comment-body-debug", "less/app/1.0.0/models/comments-debug", "less/app/1.0.0/modules/stream-picture-debug" ], function(require) {
    var weibo = require("less/app/1.0.0/weibo-debug");
    var tpl = require("less/app/1.0.0/views/stream-item-debug.tpl");
    var userID = JSON.parse(localStorage.getItem("uid"));
    var RepostList = require("less/app/1.0.0/modules/mini-repost-list-debug");
    var CommentList = require("less/app/1.0.0/modules/mini-comment-list-debug");
    var StreamPicture = require("less/app/1.0.0/modules/stream-picture-debug");
    var StreamItem = Backbone.Module.extend({
        name: "stream-item",
        className: "stream-item",
        template: tpl,
        events: {
            "click .stream-item-primary-footer .action-repost": "repost",
            "click .stream-item-primary-footer .action-comment": "comment",
            "click .stream-item-primary-footer .action-favorite": "favorite",
            "click .stream-item-primary-footer .action-del": "del",
            "click .stream-item-footer-retweet .action-repost": "viewRetweetRepost",
            "click .stream-item-footer-retweet .action-comment": "viewRetweetComment"
        },
        initialize: function() {
            if (userID == this.model.get("user").id) {
                this.model.set({
                    action_del: true
                });
            }
            this.model.set({
                primary: true
            });
            StreamItem.__super__["initialize"].apply(this, arguments);
        },
        __getRetweetMid: function() {
            var dtd = $.Deferred();
            var self = this;
            weibo.request({
                path: "statuses/querymid.json",
                params: {
                    type: 1,
                    id: this.model.get("retweeted_status").id
                }
            }, {
                success: function(resp) {
                    dtd.resolveWith(this, [ resp.mid ]);
                }
            });
            return dtd;
        },
        __viewRetweet: function(e, type) {
            var self = this;
            if (typeof this.__retweetedMid != "undefined") return;
            e.preventDefault();
            var node = e.target;
            this.__getRetweetMid().done(function(mid) {
                self.__retweetedMid = mid;
                node.href = "http://weibo.com/" + self.model.get("retweeted_status").user.id + "/" + self.__retweetedMid;
                node.click();
            });
        },
        viewRetweetComment: function(e) {
            this.__viewRetweet(e, "comment");
        },
        viewRetweetRepost: function(e) {
            this.__viewRetweet(e, "repost");
        },
        render: function() {
            StreamItem.__super__.render.apply(this, arguments);
            if (this.model.get("thumbnail_pic")) {
                var model = this.model.clone();
                model.url = null;
                this.append(StreamPicture, ".thumbnail_pic-container", {
                    model: model
                });
            }
        },
        repost: function(e) {
            e.preventDefault();
            this._removeActiveCommentRepostList();
            if (this.activeListName == "mini-repost-list") {
                this.activeListName = null;
                return;
            }
            this._setupList(RepostList);
        },
        comment: function(e) {
            e.preventDefault();
            this._removeActiveCommentRepostList();
            if (this.activeListName == "mini-comment-list") {
                this.activeListName = null;
                return;
            }
            this._setupList(CommentList);
        },
        _setupList: function(List) {
            var model = this.model.clone();
            model.url = null;
            var mod = this.append(List, ".stream-item-content > .tweet", {
                model: model
            });
            mod.__enter();
            this.activeListName = mod.name;
            this.miniCommentRepostList = mod;
        },
        _removeActiveCommentRepostList: function() {
            if (this.miniCommentRepostList) {
                this.miniCommentRepostList.destroy();
                this.miniCommentRepostList = null;
            }
        },
        favorite: function(e) {
            e.preventDefault();
            var self = this;
            var currentTarget = e.currentTarget;
            // prevent race
            if (currentTarget.disabled) return;
            currentTarget.disabled = true;
            var action = currentTarget.classList.contains("favorited") ? "destroy" : "create";
            var id = this.model.get("id");
            weibo.request({
                method: "POST",
                path: "favorites/" + action + ".json",
                params: {
                    id: id
                }
            }, function() {
                currentTarget.disabled = false;
                currentTarget.classList.toggle("favorited");
            });
        },
        del: function(e) {
            e.preventDefault();
            var self = this;
            weibo.request({
                method: "POST",
                path: "statuses/destroy.json",
                params: {
                    id: this.model.get("id")
                }
            }, function() {
                self.$el.slideUp(function() {
                    self.destroy();
                });
            });
        }
    });
    return StreamItem;
});

define("less/app/1.0.0/views/stream-item-debug.tpl", [], '{{#with user}}\n    {{> stream-item-vcard}}\n{{/with}}\n<div class="stream-item-content">\n    <div class="tweet">\n        {{> stream-item-tweet-content}}\n        {{#if retweeted_status}}\n            {{#with retweeted_status}}\n                <div class="tweet">\n                    {{> stream-item-tweet-content}}\n                    {{> stream-item-footer}}\n                </div>\n            {{/with}}\n        {{/if}}\n        {{> stream-item-footer}}\n    </div>\n</div>\n');

define("less/app/1.0.0/modules/mini-repost-list-debug", [ "less/app/1.0.0/modules/tweet-repost-debug", "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/mini-repost-body-debug", "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/models/stream-debug" ], function(require) {
    var tpl = require("less/app/1.0.0/views/mini-repost-list-debug.tpl");
    var TweetRepost = require("less/app/1.0.0/modules/tweet-repost-debug");
    var MiniRepostBody = require("less/app/1.0.0/modules/mini-repost-body-debug");
    var MiniRepostList = Backbone.Module.extend({
        name: "mini-repost-list",
        events: {
            "click .nav-prev": "navPrev",
            "click .nav-next": "navNext"
        },
        template: tpl,
        initialize: function() {
            MiniRepostList.__super__["initialize"].apply(this, arguments);
            this.__textModule = TweetRepost;
            this.__bodyModule = MiniRepostBody;
            this.options.data = _.defaults({}, this.options.data, {
                count: 10
            });
            this.currentPage = 0;
            this.totalPage = 0;
        },
        render: function() {
            this.$el.html(tpl);
            this.navEl = this.el.querySelector("footer .nav");
            this.initBody();
            var model = this.model.clone();
            model.url = null;
            this.append(this.__textModule, ".header", {
                model: model
            });
        },
        navPrev: function() {
            this.fetch(this.currentPage - 1);
        },
        navNext: function() {
            this.fetch(this.currentPage + 1);
        },
        checkNav: function() {
            this.navEl.querySelector(".nav-prev").disabled = this.currentPage == 1;
            this.navEl.querySelector(".nav-next").disabled = this.currentPage == this.totalPage;
        },
        _disableNav: function() {
            _.each(this.navEl.querySelectorAll("button"), function(el) {
                el.disabled = true;
            });
        },
        getBodyModule: function(selector) {
            var data = _.extend({}, this.options.data, {
                page: 1,
                id: this.model.get("id")
            });
            var options = {
                data: data
            };
            return this.append(this.__bodyModule, selector, options);
        },
        initBody: function() {
            var mod = this.getBodyModule(".body");
            mod.on("fetch", function(page, totalNumber) {
                this.currentPage = page;
                var totalPage = this.totalPage = Math.ceil(totalNumber / this.options.data.count);
                if (totalPage > 1) {
                    this.navEl.hidden = false;
                    this.checkNav();
                }
            }.bind(this));
            this.__bodyMod = mod;
        },
        fetch: function(page) {
            this._disableNav();
            this.__bodyMod.fetch(page);
        }
    });
    return MiniRepostList;
});

define("less/app/1.0.0/views/mini-repost-list-debug.tpl", [], '<div class="header"></div>\n<div class="body"></div>\n<footer>\n    <div class="nav" hidden>\n        <button class="nav-prev btn-link" i18n-content="prev">Prev</a></button>\n        <button class="nav-next btn-link" i18n-content="next">Next</a></button>\n    </div>\n</nav>\n');

define("less/app/1.0.0/modules/tweet-repost-debug", [ "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require) {
    var TweetPublisherInline = require("less/app/1.0.0/modules/tweet-publisher-inline-debug");
    var TweetRepostModule = TweetPublisherInline.extend({
        name: "tweet-repost",
        url: "statuses/repost.json",
        __onRefresh: function() {
            if (this.model.get("retweeted_status")) {
                this.model.set({
                    comment_ori: true,
                    ori_username: chrome.i18n.getMessage("commentToOrigin", this.model.get("retweeted_status").user.name)
                });
            }
            this.model.set({
                comment: chrome.i18n.getMessage("commentTo", this.model.get("user").name)
            });
        },
        getTextareaQuote: function() {
            return "//@" + this.model.get("user").name + ":" + this.model.get("text");
        },
        getParameters: function() {
            var params = {
                id: this.model.get("id"),
                status: this.getTextareaValue()
            };
            var is_comment = 0;
            if (this.el.querySelector(".js-comment").checked) is_comment++;
            if (this.el.querySelector(".js-commentOrigin") && this.el.querySelector(".js-commentOrigin").checked) is_comment++;
            params.is_comment = is_comment;
            return params;
        }
    });
    return TweetRepostModule;
});

define("less/app/1.0.0/modules/tweet-publisher-inline-debug", [ "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require) {
    var TweetBase = require("less/app/1.0.0/modules/tweet-debug");
    var tpl = require("less/app/1.0.0/views/tweet-comment-debug.tpl");
    var TweetPublisherInline = TweetBase.extend({
        className: "tweet-publisher-inline",
        template: tpl
    });
    return TweetPublisherInline;
});

define("less/app/1.0.0/modules/tweet-debug", [ "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require) {
    var weibo = require("less/app/1.0.0/weibo-debug");
    var message = require("less/app/1.0.0/message-debug");
    var TweetBase = Backbone.Module.extend({
        name: "tweet-base",
        initialize: function() {
            this.on("repost", function(text) {
                var textarea = this.el.querySelector(".status-editor");
                textarea.value = text;
                setTimeout(function() {
                    textarea.focus();
                }, 0);
            }, this);
            TweetBase.__super__["initialize"].apply(this, arguments);
        },
        render: function() {
            TweetBase.__super__.render.apply(this, arguments);
            this.submitBtn = this.el.querySelector(".status-submit-btn");
            var text = this.getTextareaQuote && this.getTextareaQuote() || "";
            this.trigger("repost", text);
            this.indicateCounter();
        },
        events: {
            "click .status-submit-btn": "connect",
            "keyup .status-editor": "indicateCounter",
            "focus .status-editor": "indicateCounter"
        },
        getTextareaValue: function() {
            var textarea = this.el.querySelector(".status-editor");
            return String(textarea.value).trim();
        },
        connect: function(e) {
            e.preventDefault();
            var text = this.getTextareaValue();
            var textarea = this.el.querySelector(".status-editor");
            var self = this;
            if (text === "") {
                textarea.focus();
                return message.createMessage({
                    text: chrome.i18n.getMessage("fieldEmpty")
                });
            }
            var parameters = this.getParameters();
            var loadingMessage = message.createMessage({
                text: chrome.i18n.getMessage("loading"),
                autoHide: false
            });
            var options = {
                method: "POST",
                path: this.url,
                params: parameters
            };
            if (parameters.pic) options.multi = true;
            weibo.request(options, function() {
                textarea.value = "";
                self.trigger("connected");
                loadingMessage.hide();
                message.createMessage({
                    text: "Success"
                });
            });
            return false;
        },
        indicateCounter: function() {
            var text = this.getTextareaValue();
            var textLen = text.length;
            var result = text.match(/[^\x00-\xff]/g);
            var counter = text.length + (result && result.length) || 0;
            counter = Math.ceil(counter / 2);
            var limit = 140;
            this.submitBtn.disabled = !(counter > 0 && counter <= 140);
            if (this.counterCallback) this.counterCallback(counter, limit);
        }
    });
    return TweetBase;
});

define("less/app/1.0.0/views/tweet-comment-debug.tpl", [], '<form class="form-inline">\n    <textarea name="status" class="status-editor"></textarea>\n    <input type="submit" value="Submit" class="status-submit-btn btn btn-primary" disabled>\n</form>\n<div class="status-actions clearfix">\n    <ul class="status-actions-list">\n        <li></li>\n    </ul>\n</div>\n<ul class="status-aside">\n    {{#if comment}}\n        <li>\n            <label><input type="checkbox" name="comment" class="js-comment">{{comment}}</label>\n        </li>\n    {{/if}}\n    {{#if repost}}\n        <li>\n            <label><input type="checkbox" name="repost" class="js-repost">{{repost}}</label>\n        </li>\n    {{/if}}\n    {{#if comment_ori}}\n        <li>\n            <label><input type="checkbox" name="commentOrigin" class="js-commentOrigin">{{ori_username}}</label>\n        </li>\n    {{/if}}\n</ul>\n');

define("less/app/1.0.0/modules/mini-repost-body-debug", [ "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/models/stream-debug" ], function(require) {
    var tpl = require("less/app/1.0.0/views/mini-repost-body-debug.tpl");
    var loadingBlock = require("less/app/1.0.0/views/loading-debug.tpl");
    var MiniStreamItem = require("less/app/1.0.0/modules/mini-stream-item-debug");
    var Reposts = require("less/app/1.0.0/models/reposts-debug");
    var MiniRepostBody = Backbone.Module.extend({
        name: "mini-repost-body",
        tagName: "ul",
        placeholder: loadingBlock,
        collection: new Reposts(),
        initialize: function() {
            MiniRepostBody.__super__.initialize.apply(this, arguments);
            var self = this;
            this.__item = MiniStreamItem;
            this.__action = "repost";
            this.collection.on("reset", function(collection) {
                var docFragment = document.createDocumentFragment();
                collection.each(function(model) {
                    model.url = null;
                    var mod = self.append(self.__item, docFragment, {
                        model: model
                    });
                    mod.__enter({
                        action: self.__action
                    });
                });
                self.$el.empty();
                self.el.appendChild(docFragment);
                self.trigger("fetch", self.options.data.page, self.collection.total_number);
            });
            this.collection.on("add", function(model) {
                var mod = self.append(self.__item, self.el, {
                    model: model
                });
                mod.__enter();
            });
        },
        __setupCollectionEvent: function() {},
        render: function() {
            var self = this;
            this.collection.fetch({
                data: this.options.data
            });
            return this;
        },
        fetch: function(page) {
            this.options.data.page = page;
            this.render();
        }
    });
    return MiniRepostBody;
});

define("less/app/1.0.0/views/mini-repost-body-debug.tpl", [], "{{#if reposts.length}}\n\n{{else}}\n    <p>Empty!</p>\n{{/if}}\n");

define("less/app/1.0.0/views/loading-debug.tpl", [], '<div class="loading-area">\n    <img src="images/loading.gif">\n    <span i18n-content="loading">Loading</span>\n</div>');

define("less/app/1.0.0/modules/mini-stream-item-debug", [ "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug" ], function(require) {
    var tpl = require("less/app/1.0.0/views/mini-stream-item-debug.tpl");
    return Backbone.Module.extend({
        name: "mini-stream-item",
        className: "stream-item",
        tagName: "li",
        template: tpl,
        events: {
            "click .action-reply": "reply",
            "click .action-repost": "repost"
        },
        __onRefresh: function(options) {
            var data = {};
            data[options.action] = true;
            this.model.set("action_list", data);
        },
        reply: function() {
            var TweetReply = require("less/app/1.0.0/modules/tweet-reply-debug");
            var model = this.model.clone();
            model.url = null;
            var tweetReply = new TweetReply({
                model: model
            });
            tweetReply.show();
        },
        repost: function() {
            var text = "//@" + this.model.get("user").name + ":" + this.model.get("text");
            this.trigger("repost", text);
        }
    });
});

define("less/app/1.0.0/views/mini-stream-item-debug.tpl", [], '{{#with user}}\n    {{> stream-item-vcard}}\n{{/with}}\n<div class="stream-item-content">\n    <div class="tweet">\n        <a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{ text }}</p>\n				<p>\n					{{#if action_list.reply}}\n						<button class="action-reply btn-link" i18n-content="reply">Reply</button>\n					{{/if}}\n					{{#if action_list.repost}}\n						 <button class="action-repost btn-link" i18n-content="repost">Repost</button>\n					{{/if}}\n				</p>\n    </div>\n</div>\n');

define("less/app/1.0.0/modules/tweet-reply-debug", [ "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug" ], function(require, exports) {
    var TweetModalModule = require("less/app/1.0.0/modules/tweet-modal-debug");
    var TweetReplyModule = TweetModalModule.extend({
        url: "comments/reply.json",
        initialize: function() {
            this.model.set({
                title: chrome.i18n.getMessage("statusReplyTitle", this.model.get("user").name),
                actions_list: {}
            });
            TweetReplyModule.__super__["initialize"].apply(this, arguments);
        },
        getTextareaQuote: function() {
            return chrome.i18n.getMessage("reply") + "@" + this.model.get("user").name + ":";
        },
        getParameters: function() {
            return {
                comment: this.getTextareaValue(),
                id: this.model.get("status").id,
                cid: this.model.get("id")
            };
        }
    });
    return TweetReplyModule;
});

define("less/app/1.0.0/modules/tweet-modal-debug", [ "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug" ], function(require) {
    var tpl = require("less/app/1.0.0/views/tweet-modal-debug.tpl");
    var TweetBase = require("less/app/1.0.0/modules/tweet-debug");
    var Emoticons = require("less/app/1.0.0/modules/weibo-emoticons-debug");
    var TweetModalModule = TweetBase.extend({
        name: "tweet-modal",
        className: "modal hide",
        id: "status-modal",
        template: tpl,
        initialize: function() {
            TweetModalModule.__super__["initialize"].apply(this, arguments);
            var self = this;
            this.$el.on("hidden", function() {
                self.destroy();
            });
            this.on("connected", function() {
                self.$el.modal("hide");
            });
        },
        render: function() {
            TweetModalModule.__super__.render.apply(this, arguments);
            this.append(Emoticons, ".tweet-emotion-container");
        },
        show: function() {
            this.__enter().$el.appendTo("body");
            this.$el.modal("show");
        },
        counterCallback: function(counter, limit) {
            var diff = counter - limit;
            var counterEl = this.el.querySelector(".status-counter");
            counterEl.textContent = String(-diff);
            counterEl.classList[diff > 0 ? "add" : "remove"]("danger");
        }
    });
    return TweetModalModule;
});

define("less/app/1.0.0/views/tweet-modal-debug.tpl", [], '<div class="modal-header">\n    <button type="button" i18n-values="title:close" class="close" data-dismiss="modal">x</button>\n    <h3>{{title}}</h3>\n</div>\n<div class="modal-body">\n    <textarea name="status" class="status-editor fullspace"></textarea>\n    <div class="status-actions clearfix">\n        <div class="pull-right">\n            <span class="status-counter">140</span>\n            <input type="submit" value="Submit" class="status-submit-btn btn btn-primary" disabled>\n        </div>\n        <ul class="status-actions-list">\n            <li class="tweet-emotion-container"></li>\n            {{#if actions_list.pic}}\n                <li class="dropdown" id="status-pic-dropdown">\n                    <a href="#status-pic-dropdown" class="pic-action" i18n-content="image">Image</a>\n                    <input type="file" class="status-pic-file visuallyhidden" accept="image/*">\n                    <ul class="dropdown-menu" id="status-pic-dropdown-menu">\n                        <li>\n                            <canvas class="status-pic-canvas" width="200"></canvas>\n                            <div class="actions">\n                                <button class="status-pic-del btn-link" i18n-content="delete">Delete</button>\n                            </div>\n                        </li>\n                    </ul>\n                </li>\n            {{/if}}\n            {{#if actions_list.geo}}\n                <li>\n                    <button id="status-geo-control" class="action-geo btn-link" i18n-content="enableGeolocation">Enable Geolocation</button>\n                </li>\n            {{/if}}\n            {{#if actions_list.topic}}\n                <li><a href="#" class="topic-action" i18n-content="topic">Topic</a></li>\n            {{/if}}\n        </ul>\n    </div>\n</div>\n\n');

define("less/app/1.0.0/modules/weibo-emoticons-debug", [ "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require) {
    var tpl = require("less/app/1.0.0/views/weibo-emoticons-debug.tpl");
    var StreamModel = require("less/app/1.0.0/models/weibo-debug");
    var EmotionsModel = StreamModel.extend({
        url: "emotions.json",
        storeID: "emotions"
    });
    var EmoticonsModule = Backbone.Module.extend({
        name: "weibo-emoticons",
        tagName: "span",
        className: "dropdown",
        template: tpl,
        initialize: function() {
            EmoticonsModule.__super__["initialize"].apply(this, arguments);
            this.model = new EmotionsModel();
            this.initialized = false;
            this.pageNum = 5;
            this.currentPage = 1;
        },
        render: function() {
            var self = this;
            if (this.initialized) return;
            this.model.fetch({
                success: function() {
                    self.initialized = true;
                    self.initializeUI();
                }
            });
        },
        events: {
            "click .emoticons-body img": "appendFace",
            "click .nav-prev": "navPrev",
            "click .nav-next": "navNext",
            "click .emoticons-category-list a": "showEmoticonsByCategory"
        },
        initializeUI: function() {
            this.$el.html(tpl);
            var emoticons = {};
            _.each(this.model.attributes, function(elm, i) {
                if (i != parseInt(i)) return;
                var category = elm.category || "默认";
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
            var body_tpl = require("less/app/1.0.0/views/weibo-emoticons-body-debug.tpl");
            var template = Handlebars.compile(body_tpl);
            var emoticons = this.model.get("emoticons")[category];
            emoticons = emoticons.map(function(elm, i) {
                elm.title = elm.phrase.slice(1, -1);
                return elm;
            });
            var html = template({
                emoticons: emoticons
            });
            this.$el.find(".emoticons-body").html(html);
        },
        setupNav: function() {
            var categories = this.model.get("categories");
            var totalPage = Math.ceil(categories.length / this.pageNum);
            this.totalPage = totalPage;
            this.renderNav(1);
            this.checkNav();
        },
        checkNav: function() {
            this.el.querySelector(".nav-prev").disabled = this.currentPage == 1 ? true : false;
            this.el.querySelector(".nav-next").disabled = this.currentPage == this.totalPage ? true : false;
        },
        appendFace: function(e) {
            var imgEl = e.currentTarget;
            var textarea = document.querySelector(".status-editor");
            var value = textarea.value;
            var start = textarea.selectionStart;
            var emoticon = imgEl.getAttribute("data-emoticon");
            textarea.value = value.slice(0, start) + emoticon + value.slice(textarea.selectionEnd);
            textarea.selectionStart = textarea.selectionStart = start + emoticon.length;
        },
        renderNav: function(page) {
            var nav_tpl = require("less/app/1.0.0/views/weibo-emoticons-nav-debug.tpl");
            var template = Handlebars.compile(nav_tpl);
            var categories = this.model.get("categories");
            var list = categories.slice((page - 1) * this.pageNum, page * this.pageNum);
            var html = template({
                categories: list
            });
            this.$el.find(".emoticons-category-list").html(html);
            this.setupFaces(list[0]);
            this.el.querySelector(".emoticons-category-list li:first-child").classList.add("active");
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
            this.el.querySelector(".emoticons-category-list .active").classList.remove("active");
            var target = e.currentTarget;
            target.parentNode.classList.add("active");
            var category = target.getAttribute("data-category");
            this.setupFaces(category);
        }
    });
    return EmoticonsModule;
});

define("less/app/1.0.0/views/weibo-emoticons-debug.tpl", [], '<a href="#" class="dropdown-toggle action-emoticons" data-toggle="dropdown" i18n-content="emoticons">Emoticons</a>\n<div class="dropdown-menu emoticons" role="menu">\n    <div class="emoticons-header">\n        <ul class="emoticons-category-list"></ul>\n        <div class="emoticons-nav">\n            <button class="nav-prev" disabled>&lt;</button>\n            <button class="nav-next" disabled>&gt;</button>\n        </div>\n    </div>\n    <div class="emoticons-body">\n        <div class="loadingArea">\n            <img src="images/loading.gif"><span i18n-content="loading">Loading</span>\n        </div>\n    </div>\n</div>');

define("less/app/1.0.0/views/weibo-emoticons-body-debug.tpl", [], '<ul>\n    {{#each emoticons}}\n        <li>\n            <img width="22" height="22" title="{{this.title}}" data-emoticon="{{this.phrase}}" src="{{this.icon}}" alt="{{this.phrase}}">\n        </li>\n    {{/each}}\n</ul>\n');

define("less/app/1.0.0/views/weibo-emoticons-nav-debug.tpl", [], '{{#each categories}}\n    <li>\n        <a href="#" data-category="{{this}}">{{this}}</a>\n    </li>\n{{/each}}\n');

define("less/app/1.0.0/models/reposts-debug", [ "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require) {
    var Stream = require("less/app/1.0.0/models/stream-debug");
    return Stream.extend({
        url: "statuses/repost_timeline.json",
        parse: function(resp) {
            this.total_number = resp.total_number;
            return resp.reposts;
        }
    });
});

define("less/app/1.0.0/models/stream-debug", [ "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var weibo = require("less/app/1.0.0/weibo-debug");
    var methodMap = {
        create: "POST",
        update: "PUT",
        "delete": "DELETE",
        read: "GET"
    };
    return Backbone.Collection.extend({
        sync: function(method, model, options) {
            var params = {
                path: model.url,
                method: methodMap[method],
                params: options.data
            };
            if (_.isString(model.storeID)) {
                var success = options.success;
                if (method == "read") {
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
});

define("less/app/1.0.0/modules/mini-comment-list-debug", [ "less/app/1.0.0/modules/mini-repost-list-debug", "less/app/1.0.0/modules/tweet-repost-debug", "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/mini-repost-body-debug", "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/modules/tweet-comment-debug", "less/app/1.0.0/modules/mini-comment-body-debug", "less/app/1.0.0/models/comments-debug" ], function(require) {
    var MiniRepostList = require("less/app/1.0.0/modules/mini-repost-list-debug");
    var TweetComment = require("less/app/1.0.0/modules/tweet-comment-debug");
    var MiniCommentBody = require("less/app/1.0.0/modules/mini-comment-body-debug");
    var MiniCommentList = MiniRepostList.extend({
        name: "mini-comment-list",
        initialize: function() {
            MiniCommentList.__super__.initialize.apply(this, arguments);
            this.__textModule = TweetComment;
            this.__bodyModule = MiniCommentBody;
        }
    });
    return MiniCommentList;
});

define("less/app/1.0.0/modules/tweet-comment-debug", [ "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require) {
    var TweetPublisherInline = require("less/app/1.0.0/modules/tweet-publisher-inline-debug");
    var weibo = require("less/app/1.0.0/weibo-debug");
    var TweetComment = TweetPublisherInline.extend({
        name: "tweet-comment",
        url: "comments/create.json",
        __onRefresh: function() {
            this.model.set({
                repost: chrome.i18n.getMessage("repostToMyTimeline")
            });
            if (this.model.get("retweeted_status")) {
                this.model.set({
                    comment_ori: true,
                    ori_username: chrome.i18n.getMessage("commentToOrigin", this.model.get("retweeted_status").user.name)
                });
            }
        },
        getParameters: function() {
            var commentOriEl = this.el.querySelector(".js-commentOrigin"), commentOri = commentOriEl && commentOriEl.checked, status = this.getTextareaValue();
            var params = {
                id: this.model.get("id")
            };
            if (this.el.querySelector(".js-repost").checked) {
                this.url = "statuses/repost.json";
                params.status = status;
                params.is_comment = commentOri ? 2 : 1;
            } else {
                this.url = "comments/create.json";
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

define("less/app/1.0.0/modules/mini-comment-body-debug", [ "less/app/1.0.0/modules/mini-repost-body-debug", "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/models/comments-debug" ], function(require) {
    var tpl = require("less/app/1.0.0/views/mini-comment-body-debug.tpl");
    var MiniRepostBody = require("less/app/1.0.0/modules/mini-repost-body-debug");
    var Comments = require("less/app/1.0.0/models/comments-debug");
    var MiniCommentBody = MiniRepostBody.extend({
        name: "mini-comment-body",
        template: tpl,
        collection: new Comments(),
        initialize: function() {
            MiniCommentBody.__super__.initialize.apply(this, arguments);
            this.__action = "reply";
        }
    });
    return MiniCommentBody;
});

define("less/app/1.0.0/views/mini-comment-body-debug.tpl", [], '{{#if comments.length}}\n    {{#each comments}}\n        {{#module this name="mini-stream-item"}} {{/module}}\n    {{/each}}\n{{else}}\n    <p>Empty!</p>\n{{/if}}\n');

define("less/app/1.0.0/models/comments-debug", [ "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require) {
    var StreamModel = require("less/app/1.0.0/models/stream-debug");
    var CommentsModel = StreamModel.extend({
        url: "comments/show.json",
        parse: function(resp) {
            this.total_number = resp.total_number;
            return resp.comments;
        }
    });
    return CommentsModel;
});

define("less/app/1.0.0/modules/stream-picture-debug", [ "less/app/1.0.0/util-debug" ], function(require, exports) {
    var tpl = require("less/app/1.0.0/views/stream-picture-debug.tpl");
    var util = require("less/app/1.0.0/util-debug");
    var StreamPictureModule = Backbone.Module.extend({
        name: "stream-picture",
        className: "tweet-pic",
        template: tpl,
        initialize: function() {
            StreamPictureModule.__super__["initialize"].apply(this, arguments);
            this.widthLimit = 420;
            this.deg = 0;
            if (this.options.expand) {
                this.model.set({
                    expand: true
                });
            }
        },
        render: function() {
            StreamPictureModule.__super__.render.apply(this, arguments);
            this.originalEl = this.el.querySelector(".tweet-pic-origin");
            if (!this.options.expand) {
                this.thumbEl = this.el.querySelector(".tweet-pic-thumb");
                _.bindAll(this, "collapse");
                this.$el.on("click", ".tweet-pic-origin img", this.collapse);
                this.$el.on("click", ".tweet-pic-origin canvas", this.collapse);
            }
        },
        events: {
            "click .tweet-pic-thumb img": "show",
            "click .action-collapse": "collapse",
            "click .action-rotate-left": "rotateLeft",
            "click .action-rotate-right": "rotateRight"
        },
        show: function() {
            if (this.inited) {
                this.expand();
            } else {
                this.load();
            }
        },
        showThrobber: function() {
            var throbberEl = this.el.querySelector(".throbber"), img = this.el.querySelector(".tweet-pic-thumb img");
            throbberEl.style.left = img.width / 2 - 8 + "px";
            throbberEl.style.top = img.height / 2 - 8 + "px";
            throbberEl.style.display = "block";
        },
        load: function() {
            this.showThrobber();
            var img = new Image();
            img.onload = this.onLoad.bind(this, img);
            img.src = this.model.get("original_pic");
        },
        onLoad: function(img) {
            this.$el.find(".throbber").remove();
            this.inited = true;
            this.expand();
        },
        _show: function() {
            var img = document.createElement("img"), rect;
            img.src = this.model.get("original_pic");
            rect = util.scale(img.width, img.height, this.widthLimit);
            img.width = rect.width;
            img.height = rect.height;
            this.originalEl.style.display = "block";
            img.style.marginLeft = (this.widthLimit - rect.width) / 2 + "px";
            this.originalEl.appendChild(img);
        },
        collapse: function() {
            var originalEl = this.originalEl;
            originalEl.removeChild(originalEl.lastChild);
            originalEl.style.display = "none";
            this.thumbEl.style.display = "block";
        },
        expand: function() {
            this.thumbEl.style.display = "none";
            this._show();
        },
        rotateLeft: function(e) {
            e.preventDefault();
            this.deg -= 90;
            this.rotate();
        },
        rotateRight: function(e) {
            e.preventDefault();
            this.deg += 90;
            this.rotate();
        },
        rotate: function() {
            var canvas = this.originalEl.querySelector("canvas"), img = document.createElement("img");
            img.src = this.model.get("original_pic");
            if (!canvas) {
                canvas = document.createElement("canvas");
                this.originalEl.replaceChild(canvas, this.originalEl.querySelector("img"));
            }
            var ctx = canvas.getContext("2d");
            this.deg = this.deg + 360;
            this.deg %= 360;
            var revert, imgRect = [ img.width, img.height ];
            if (this.deg / 90 % 2) {
                revert = true;
                imgRect = [ imgRect[1], imgRect[0] ];
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
            canvas.style.marginLeft = (this.widthLimit - rect.width) / 2 + "px";
            ctx.save();
            ctx.translate(translateData[0] | 0, translateData[1] | 0);
            if (this.deg > 0) {
                ctx.rotate(Math.PI * this.deg / 180);
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

define("less/app/1.0.0/views/stream-picture-debug.tpl", [], '{{#unless expand}}\n	<div class="tweet-pic-thumb" data-original="{{ original_pic }}"><img src="{{ thumbnail_pic }}"></div>\n	<img src="images/loading.gif" class="throbber" hidden>\n{{/unless}}\n<div class="tweet-pic-origin" {{#unless expand}}hidden{{/unless}}>\n    <div class="actions">\n				{{#unless expand}}<a href="#" class="action-collapse">收起</a>{{/unless}}\n        <a href="{{ original_pic }}" target="_blank" class="action-view-origin">查看大图</a>\n        <a href="#" class="action-rotate-left">左转</a>\n        <a href="#" class="action-rotate-right">右转</a>\n    </div>\n		{{#if expand}}<img src="{{ original_pic }}">{{/if}}\n</div>\n');

define("less/app/1.0.0/models/statuses-debug", [ "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var StreamModel = require("less/app/1.0.0/models/stream-debug");
    var Statuses = Backbone.Collection.extend({
        url: "statuses/home_timeline.json",
        parse: function(resp, xhr) {
            return resp.statuses;
        },
        comparator: function(statusA, statusB) {
            return statusB.get("id") - statusA.get("id");
        },
        sync: StreamModel.prototype.sync,
        getNextCursor: function() {
            return {
                max_id: this.last().id
            };
        }
    });
    return Statuses;
});

define("less/app/1.0.0/modules/timeline-debug", [], function(require, exports) {
    var tpl = require("less/app/1.0.0/views/timeline-debug.tpl");
    var TimelineModule = Backbone.Module.extend({
        initialize: function(options) {
            this.options = {};
            this.options.cursor = options.cursor || "maxid";
            var self = this;
            _.bindAll(this, "_handleScroll");
            document.addEventListener("scroll", this._handleScroll, false);
            this.collection.on("reset", function(collection) {
                var docFragment = document.createDocumentFragment();
                collection.each(function(model) {
                    model.url = null;
                    var mod = self.append(self.__item, docFragment, {
                        model: model
                    });
                    mod.__enter();
                });
                self.el.querySelector(".stream").appendChild(docFragment);
            });
            this.collection.on("add", function(model, collection, options) {
                var docFragment = document.createDocumentFragment();
                var position = options.position || "append";
                var mod = self.append(self.__item, docFragment, {
                    model: model
                });
                self.$el.find(".stream")[position](docFragment);
                mod.__enter();
            });
            TimelineModule.__super__.initialize.apply(this, arguments);
        },
        _handleScroll: function() {
            var body = document.body;
            var offset = 100;
            if (this._scrollFetching || window.innerHeight + body.scrollTop + offset < body.scrollHeight) return;
            var nextCursor = this.collection.getNextCursor();
            if (!nextCursor) return;
            var data = _.extend({}, this.options.data, nextCursor);
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
            this.collection.fetch(mergedOptions);
        },
        render: function() {
            var self = this;
            this.$el.html(tpl);
            this.collection.fetch({
                data: this.options.data
            });
            return this;
        },
        destroy: function() {
            document.removeEventListener("scroll", this._handleScroll, false);
            TimelineModule.__super__.destroy.apply(this, arguments);
        }
    });
    return TimelineModule;
});

define("less/app/1.0.0/views/timeline-debug.tpl", [], '<div class="stream"></div>');

define("less/app/1.0.0/view_states/profile-debug", [ "less/app/1.0.0/modules/profile-nav-debug", "less/app/1.0.0/modules/profile-card-debug", "less/app/1.0.0/models/user-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/following-debug", "less/app/1.0.0/models/users-debug", "less/app/1.0.0/models/cursor-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/modules/timeline-debug", "less/app/1.0.0/modules/user-debug", "less/app/1.0.0/modules/relationship-action-debug", "less/app/1.0.0/modules/followers-debug", "less/app/1.0.0/modules/user-timeline-debug", "less/app/1.0.0/models/statuses-debug", "less/app/1.0.0/modules/stream-item-debug", "less/app/1.0.0/modules/mini-repost-list-debug", "less/app/1.0.0/modules/tweet-repost-debug", "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/modules/mini-repost-body-debug", "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/modules/mini-comment-list-debug", "less/app/1.0.0/modules/tweet-comment-debug", "less/app/1.0.0/modules/mini-comment-body-debug", "less/app/1.0.0/models/comments-debug", "less/app/1.0.0/modules/stream-picture-debug" ], function(require, exports) {
    return function config(application) {
        var tpl = require("less/app/1.0.0/views/profile-debug.tpl");
        var profileNavView = require("less/app/1.0.0/modules/profile-nav-debug");
        var profileCardView = require("less/app/1.0.0/modules/profile-card-debug");
        var profileFollowing = require("less/app/1.0.0/modules/following-debug");
        var profileFollowers = require("less/app/1.0.0/modules/followers-debug");
        var UserTimeline = require("less/app/1.0.0/modules/user-timeline-debug");
        var ProfileViewState = Backbone.Module.extend({
            name: "profile",
            __parseParent: function() {
                return application.el;
            },
            initialize: function() {
                this.__exports = {
                    "profile-timeline": ".content-main",
                    "profile-following": ".content-main",
                    "profile-followers": ".content-main"
                };
                ProfileViewState.__super__["initialize"].apply(this, arguments);
            },
            render: function() {
                this.$el.html(tpl);
                this.append(profileNavView, ".dashboard");
                this.append(profileCardView, ".profile-card-container");
                return this;
            }
        });
        var ProfileTimeline = Backbone.Module.extend({
            name: "profile-timeline",
            render: function() {
                this.append(UserTimeline, this.el, {
                    uid: JSON.parse(localStorage.getItem("uid"))
                });
                return this;
            }
        });
        application.register("u/:uid", ProfileViewState, ProfileTimeline);
        var ProfileFollowingViewState = Backbone.Module.extend({
            name: "profile-following",
            render: function() {
                this.append(profileFollowing, this.el, {
                    uid: JSON.parse(localStorage.getItem("uid"))
                });
                return this;
            }
        });
        application.register("u/:uid/following", ProfileViewState, ProfileFollowingViewState);
        var ProfileFollowersViewState = Backbone.Module.extend({
            name: "profile-followers",
            render: function() {
                this.append(profileFollowers, this.el, {
                    uid: JSON.parse(localStorage.getItem("uid"))
                });
                return this;
            }
        });
        application.register("u/:uid/followers", ProfileViewState, ProfileFollowersViewState);
    };
});

define("less/app/1.0.0/views/profile-debug.tpl", [], '<div class="container">\n    <div class="profile-card-container"></div>\n    <div class="row standard-page-body">\n        <div class="dashboard span4"></div>\n        <div class="content-main span8"></div>\n    </div>\n</div>\n');

define("less/app/1.0.0/modules/profile-nav-debug", [], function(require) {
    var tpl = require("less/app/1.0.0/views/profile-nav-debug.tpl");
    var ProfileNav = Backbone.Module.extend({
        name: "profile-nav",
        template: tpl,
        initialize: function() {
            this.model = new Backbone.Model();
            this.model.url = null;
            ProfileNav.__super__["initialize"].apply(this, arguments);
        },
        __onRefresh: function(options) {
            var uid = options.params[0];
            var nav = options.path.split("/")[2] || "timeline";
            var prevId = this.model.get("id");
            if (prevId && prevId !== uid) {
                this.__activeNav = "timeline";
                this.render({
                    force: true
                });
                return;
            } else if (typeof this.__activeNav !== "undefined") {
                this.__setupNav(nav);
            }
            this.model.set({
                id: uid
            });
            this.__activeNav = nav;
            this.__id = uid;
        },
        render: function() {
            ProfileNav.__super__.render.apply(this, arguments);
            this.__setupNav(this.__activeNav);
        },
        __setupNav: function(nav) {
            var activeClassName = "active";
            var $target = $("li[data-nav=" + nav + "]", this.$el).addClass(activeClassName);
            $target.siblings().removeClass(activeClassName);
        }
    });
    return ProfileNav;
});

define("less/app/1.0.0/views/profile-nav-debug.tpl", [], '<ul class="nav nav-tabs nav-stacked">\n    <li data-nav="timeline"><a href="#u/{{id}}">Tweets</a></li>\n    <li data-nav="following"><a href="#u/{{id}}/following">Following</a></li>\n    <li data-nav="followers"><a href="#u/{{id}}/followers">Followers</a></li>\n</ul>');

define("less/app/1.0.0/modules/profile-card-debug", [ "less/app/1.0.0/models/user-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var tpl = require("less/app/1.0.0/views/profile-card-debug.tpl");
    var UserModel = require("less/app/1.0.0/models/user-debug");
    var ProfileCardModule = Backbone.Module.extend({
        name: "profile-card",
        template: tpl,
        __onRefresh: function(options) {
            var uidOrName = options.params[0];
            var type = parseInt(uidOrName) == uidOrName ? "uid" : "screen_name";
            this.options.data = {};
            this.options.data[type] = uidOrName;
            if (typeof this.__id != "undefined" && this.__id !== uidOrName) {
                this.render({
                    force: true
                });
            }
            this.__id = uidOrName;
        },
        initialize: function() {
            this.model = new UserModel();
            this.options = {};
            ProfileCardModule.__super__["initialize"].apply(this, arguments);
        }
    });
    return ProfileCardModule;
});

define("less/app/1.0.0/views/profile-card-debug.tpl", [], '<div class="flex-module clearfix">\n    <img src="{{avatar_large}}" width="180" height="180" class="avator" alt="{{screen_name}}">\n    <div class="profile-card-inner">\n        <h1>{{screen_name}}</h1>\n        {{#if description}}\n            <p class="bio">{{description}}</p>\n        {{/if}}\n        <p>\n            <span class="location">{{location}}</span>\n            {{#if url}}\n                <span class="divider">.</span>\n                <a class="url" href={{url}} target="_blank">{{url}}</a>\n            {{/if}}\n        </p>\n    </div>\n    <div class="profile-card-actions">\n\n        {{> profile-stats}}\n    </div>\n</div>\n');

define("less/app/1.0.0/modules/following-debug", [ "less/app/1.0.0/models/users-debug", "less/app/1.0.0/models/cursor-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/timeline-debug", "less/app/1.0.0/modules/user-debug", "less/app/1.0.0/modules/relationship-action-debug" ], function(require, exports) {
    var UsersModel = require("less/app/1.0.0/models/users-debug");
    var tpl = require("less/app/1.0.0/views/users-debug.tpl");
    var TimelineModule = require("less/app/1.0.0/modules/timeline-debug");
    var StreamItem = require("less/app/1.0.0/modules/user-debug");
    var FriendsModel = UsersModel.extend({
        url: "friendships/friends.json"
    });
    var FollowingModule = TimelineModule.extend({
        name: "followings",
        template: tpl,
        __onRefresh: function(options) {
            var uidOrName = options.params[0];
            var type = parseInt(uidOrName) == uidOrName ? "uid" : "screen_name";
            this.options.data = {};
            this.options.data[type] = uidOrName;
        },
        initialize: function() {
            this.collection = new FriendsModel();
            this.options = {};
            this.__item = StreamItem;
            FollowingModule.__super__["initialize"].apply(this, arguments);
        }
    });
    return FollowingModule;
});

define("less/app/1.0.0/models/users-debug", [ "less/app/1.0.0/models/cursor-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var Cursor = require("less/app/1.0.0/models/cursor-debug");
    var Users = Cursor.extend({
        parse: function(resp, xhr) {
            Users.__super__.parse.apply(this, arguments);
            return resp.users;
        }
    });
    return Users;
});

define("less/app/1.0.0/models/cursor-debug", [ "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var StreamModel = require("less/app/1.0.0/models/stream-debug");
    var Cursor = Backbone.Collection.extend({
        initialize: function() {
            this.__next_cursor = 0;
        },
        parse: function(resp, xhr) {
            this.__next_cursor = resp.next_cursor;
        },
        getNextCursor: function() {
            if (this.__next_cursor === 0) return null;
            return {
                cursor: this.__next_cursor
            };
        },
        sync: StreamModel.prototype.sync
    });
    return Cursor;
});

define("less/app/1.0.0/views/users-debug.tpl", [], '<div class="stream">\n</div>\n');

define("less/app/1.0.0/modules/user-debug", [ "less/app/1.0.0/modules/relationship-action-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var tpl = require("less/app/1.0.0/views/user-debug.tpl");
    var RelationshipButton = require("less/app/1.0.0/modules/relationship-action-debug");
    var UserModule = Backbone.Module.extend({
        name: "user",
        tagName: "li",
        className: "stream-item",
        template: tpl,
        render: function() {
            UserModule.__super__["render"].apply(this, arguments);
            this.append(RelationshipButton, ".relationship-button-container", {
                following: this.model.get("following"),
                follow_me: this.model.get("follow_me"),
                user_id: this.model.get("id")
            });
            return this;
        },
        follow: function(e) {
            e.preventDefault();
            var target = e.target;
            if (target.disabled) return;
            target.disabled = true;
            var followed = target.classList.contains("followed");
            var action = followed ? "destroy" : "create";
            app.weibo.request("POST", "friendships/" + action, {
                uid: this.model.id
            }, function() {
                app.message.show(chrome.i18n.getMessage(handle + "Success"), true);
                target.disabled = false;
                target.classList.toggle("followed");
                var handle = followed ? "follow" : "unfollow";
                target.textContent = chrome.i18n.getMessage(handle);
            });
        }
    });
    return UserModule;
});

define("less/app/1.0.0/views/user-debug.tpl", [], '{{> stream-item-vcard}}\n<div class="stream-item-content">\n	<div class="pull-right relationship-button-container"></div>\n	<strong>{{name}}</strong>\n	<p>{{description}}</p>\n</div>\n');

define("less/app/1.0.0/modules/relationship-action-debug", [ "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug" ], function(require, exports) {
    var tpl = require("less/app/1.0.0/views/relationship-action-debug.tpl");
    var weibo = require("less/app/1.0.0/weibo-debug");
    var RelationshipActionModule = Backbone.Module.extend({
        name: "relationship-action",
        template: tpl,
        events: {
            "click .action-unfollow": "unfollow",
            "click .action-follow": "follow"
        },
        initialize: function(options) {
            this.model = new Backbone.Model(options);
            this.model.url = null;
            RelationshipActionModule.__super__.initialize.apply(this, arguments);
        },
        unfollow: function(e) {
            e.preventDefault();
            weibo.request({
                method: "POST",
                path: "friendships/destroy.json",
                params: {
                    uid: this.model.get("user_id")
                }
            }, function() {
                var $container = $(e.currentTarget).parents(".relationship-container");
                $container.removeClass("following");
            });
        },
        follow: function(e) {
            e.preventDefault();
            weibo.request({
                method: "POST",
                path: "friendships/create.json",
                params: {
                    uid: this.model.get("user_id")
                }
            }, function() {
                var $container = $(e.currentTarget).parents(".relationship-container");
                $container.addClass("following");
            });
        }
    });
    return RelationshipActionModule;
});

define("less/app/1.0.0/views/relationship-action-debug.tpl", [], '<div class="relationship-container {{#if following}} following{{/if}}{{#if follow_me}} follow-me{{/if}}">\n	<a href="#" class="btn btn-primary relationship-btn">\n			<span class="btn-text action-following">Following</span>\n			<span class="btn-text action-follow">Follow</span>\n			<span class="btn-text action-unfollow">Unfollow</span>\n	</a>\n	<div class="relationship-mutual">{{#if following}}{{#if follow_me}}相互关注{{/if}}{{/if}}</div>\n</div>\n');

define("less/app/1.0.0/modules/followers-debug", [ "less/app/1.0.0/models/users-debug", "less/app/1.0.0/models/cursor-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/timeline-debug", "less/app/1.0.0/modules/user-debug", "less/app/1.0.0/modules/relationship-action-debug" ], function(require, exports) {
    var UsersModel = require("less/app/1.0.0/models/users-debug");
    var tpl = require("less/app/1.0.0/views/users-debug.tpl");
    var TimelineModule = require("less/app/1.0.0/modules/timeline-debug");
    var StreamItem = require("less/app/1.0.0/modules/user-debug");
    var Followers = UsersModel.extend({
        url: "friendships/followers.json"
    });
    var FollowersModule = TimelineModule.extend({
        name: "followers",
        template: tpl,
        __onRefresh: function(options) {
            var uidOrName = options.params[0];
            var type = parseInt(uidOrName) == uidOrName ? "uid" : "screen_name";
            this.options.data = {};
            this.options.data[type] = uidOrName;
        },
        initialize: function(options) {
            this.collection = new Followers();
            this.__item = StreamItem;
            FollowersModule.__super__["initialize"].apply(this, arguments);
        }
    });
    return FollowersModule;
});

define("less/app/1.0.0/modules/user-timeline-debug", [ "less/app/1.0.0/models/statuses-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/stream-item-debug", "less/app/1.0.0/modules/mini-repost-list-debug", "less/app/1.0.0/modules/tweet-repost-debug", "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/modules/mini-repost-body-debug", "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/modules/mini-comment-list-debug", "less/app/1.0.0/modules/tweet-comment-debug", "less/app/1.0.0/modules/mini-comment-body-debug", "less/app/1.0.0/models/comments-debug", "less/app/1.0.0/modules/stream-picture-debug", "less/app/1.0.0/modules/timeline-debug" ], function(require) {
    var tpl = require("less/app/1.0.0/views/user-timeline-debug.tpl");
    var Statuses = require("less/app/1.0.0/models/statuses-debug");
    var StreamItem = require("less/app/1.0.0/modules/stream-item-debug");
    var TimelineModule = require("less/app/1.0.0/modules/timeline-debug");
    var UserStatuses = Statuses.extend({
        url: "statuses/user_timeline.json"
    });
    var UserTimelineModule = TimelineModule.extend({
        name: "user-timeline",
        template: tpl,
        __onRefresh: function(options) {
            var uidOrName = options.params[0];
            var type = parseInt(uidOrName) == uidOrName ? "uid" : "screen_name";
            this.options.data = {};
            this.options.data[type] = uidOrName;
        },
        initialize: function() {
            this.collection = new UserStatuses();
            this.options = {};
            this.__item = StreamItem;
            UserTimelineModule.__super__["initialize"].apply(this, arguments);
        }
    });
    return UserTimelineModule;
});

define("less/app/1.0.0/views/user-timeline-debug.tpl", [], '<div class="stream">\n\n</div>');

define("less/app/1.0.0/view_states/connect-debug", [ "less/app/1.0.0/modules/connect-nav-debug", "less/app/1.0.0/modules/profile-nav-debug", "less/app/1.0.0/modules/comments-debug", "less/app/1.0.0/modules/comment-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/models/user-comments-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/models/statuses-debug", "less/app/1.0.0/modules/timeline-debug", "less/app/1.0.0/modules/mentions-debug", "less/app/1.0.0/modules/stream-item-debug", "less/app/1.0.0/modules/mini-repost-list-debug", "less/app/1.0.0/modules/tweet-repost-debug", "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/mini-repost-body-debug", "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/modules/mini-comment-list-debug", "less/app/1.0.0/modules/tweet-comment-debug", "less/app/1.0.0/modules/mini-comment-body-debug", "less/app/1.0.0/models/comments-debug", "less/app/1.0.0/modules/stream-picture-debug" ], function(require, exports) {
    var tpl = require("less/app/1.0.0/views/connect-debug.tpl");
    var slice = Array.prototype.slice;
    var ConnectNavView = require("less/app/1.0.0/modules/connect-nav-debug");
    var CommentsView = require("less/app/1.0.0/modules/comments-debug");
    var MentionsView = require("less/app/1.0.0/modules/mentions-debug");
    return function config(application) {
        var Connect = Backbone.Module.extend({
            name: "connect",
            __parseParent: function() {
                return application.el;
            },
            initialize: function() {
                this.__exports = {
                    "connect-comment": ".content-main",
                    mentions: ".content-main"
                };
                Connect.__super__["initialize"].apply(this, arguments);
            },
            render: function() {
                this.$el.html(tpl);
                this.append(ConnectNavView, ".dashboard");
                return this;
            },
            __onRefresh: function() {}
        });
        var ConnectComment = Backbone.Module.extend({
            name: "connect-comment",
            render: function() {
                this.append(CommentsView, this.el, {
                    uid: JSON.parse(localStorage.getItem("uid"))
                });
                return this;
            }
        });
        var Mentions = Backbone.Module.extend({
            name: "mentions",
            render: function() {
                this.append(MentionsView, this.el, {
                    uid: JSON.parse(localStorage.getItem("uid"))
                });
                return this;
            }
        });
        application.register("connect", Connect, ConnectComment);
        application.register("mentions", Connect, Mentions);
    };
});

define("less/app/1.0.0/views/connect-debug.tpl", [], '<div class="container">\n    <div class="row">\n        <div class="dashboard span4"> </div>\n        <div class="content-main span8"> </div>\n    </div>\n</div>');

define("less/app/1.0.0/modules/connect-nav-debug", [ "less/app/1.0.0/modules/profile-nav-debug" ], function(require) {
    var tpl = require("less/app/1.0.0/views/connect-nav-debug.tpl");
    var ProfileNavModule = require("less/app/1.0.0/modules/profile-nav-debug");
    return ProfileNavModule.extend({
        name: "connect-nav",
        template: tpl,
        __onRefresh: function(options) {
            var nav = options.path;
            if (typeof this.__activeNav !== "undefined") {
                this.__setupNav(nav);
            }
            this.__activeNav = nav;
        }
    });
});

define("less/app/1.0.0/views/connect-nav-debug.tpl", [], '<ul class="nav nav-tabs nav-stacked">\n    <li data-nav="connect"><a href="#connect">Comments</a></li>\n    <li data-nav="mentions"><a href="#mentions">Mentions</a></li>\n</ul>\n');

define("less/app/1.0.0/modules/comments-debug", [ "less/app/1.0.0/modules/comment-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/models/user-comments-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/models/statuses-debug", "less/app/1.0.0/modules/timeline-debug" ], function(require, exports) {
    var tpl = require("less/app/1.0.0/views/comments-timeline-debug.tpl");
    var slice = Array.prototype.slice;
    var Comment = require("less/app/1.0.0/modules/comment-debug");
    var CommentModel = require("less/app/1.0.0/models/user-comments-debug");
    var TimelineModule = require("less/app/1.0.0/modules/timeline-debug");
    var CommentsTimelineModule = TimelineModule.extend({
        name: "comments-timeline",
        initialize: function() {
            this.collection = new CommentModel();
            this.__item = Comment;
            CommentsTimelineModule.__super__["initialize"].apply(this, arguments);
        }
    });
    return CommentsTimelineModule;
});

define("less/app/1.0.0/views/comments-timeline-debug.tpl", [], '<div class="stream">\n\n</div>\n');

define("less/app/1.0.0/modules/comment-debug", [ "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug" ], function(require) {
    var tpl = require("less/app/1.0.0/views/comment-debug.tpl");
    var weibo = require("less/app/1.0.0/weibo-debug");
    return Backbone.Module.extend({
        name: "comment",
        className: "stream-item",
        tagName: "li",
        template: tpl,
        events: {
            "click .action-reply": "reply",
            "click .action-del": "del"
        },
        reply: function() {
            var TweetReply = require("less/app/1.0.0/modules/tweet-reply-debug");
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
                method: "POST",
                path: "comments/destroy.json",
                params: {
                    cid: this.model.get("id")
                }
            }, function() {
                currentTarget.disabled = false;
                self.$el.slideUp(function() {
                    self.destroy();
                });
            });
        }
    });
});

define("less/app/1.0.0/views/comment-debug.tpl", [], '{{#with user}}\n    {{> stream-item-vcard}}\n{{/with}}\n<div class="stream-item-content">\n    <div class="tweet">\n        <a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{ text }}</p>\n				<p class="pull-right">\n					<button class="action-reply btn-link" i18n-content="reply">Reply</button>\n					<button class="action-del btn-link" i18n-content="delete">Delete</button>\n				</p>\n				<span class="metadata">\n					<a href="#!/{{user.id}}/{{id}}">{{date_format created_at}}</a>\n					<span i18n-content="from">from</span> {{{ source }}}\n				</span>\n    </div>\n</div>\n');

define("less/app/1.0.0/models/user-comments-debug", [ "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/models/statuses-debug" ], function(require, exports) {
    var StreamModel = require("less/app/1.0.0/models/stream-debug");
    var Statuses = require("less/app/1.0.0/models/statuses-debug");
    return Statuses.extend({
        url: "comments/timeline.json",
        parse: function(resp, xhr) {
            return resp.comments;
        }
    });
});

define("less/app/1.0.0/modules/mentions-debug", [ "less/app/1.0.0/models/statuses-debug", "less/app/1.0.0/models/stream-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/stream-item-debug", "less/app/1.0.0/modules/mini-repost-list-debug", "less/app/1.0.0/modules/tweet-repost-debug", "less/app/1.0.0/modules/tweet-publisher-inline-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/modules/mini-repost-body-debug", "less/app/1.0.0/modules/mini-stream-item-debug", "less/app/1.0.0/modules/tweet-reply-debug", "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug", "less/app/1.0.0/models/reposts-debug", "less/app/1.0.0/modules/mini-comment-list-debug", "less/app/1.0.0/modules/tweet-comment-debug", "less/app/1.0.0/modules/mini-comment-body-debug", "less/app/1.0.0/models/comments-debug", "less/app/1.0.0/modules/stream-picture-debug", "less/app/1.0.0/modules/timeline-debug" ], function(require) {
    var Statuses = require("less/app/1.0.0/models/statuses-debug");
    var StreamItem = require("less/app/1.0.0/modules/stream-item-debug");
    var TimelineModule = require("less/app/1.0.0/modules/timeline-debug");
    var Mentions = Statuses.extend({
        url: "statuses/mentions.json"
    });
    var MentionsModule = TimelineModule.extend({
        name: "mentions-timeline",
        initialize: function() {
            this.collection = new Mentions();
            this.__item = StreamItem;
            MentionsModule.__super__["initialize"].apply(this, arguments);
        }
    });
    return MentionsModule;
});

define("less/app/1.0.0/modules/new-tweet-debug", [ "less/app/1.0.0/modules/tweet-modal-debug", "less/app/1.0.0/modules/tweet-debug", "less/app/1.0.0/weibo-debug", "less/app/1.0.0/lib/oauth2-debug", "less/app/1.0.0/util-debug", "less/app/1.0.0/message-debug", "less/app/1.0.0/modules/weibo-emoticons-debug", "less/app/1.0.0/models/weibo-debug" ], function(require) {
    var TweetModalModule = require("less/app/1.0.0/modules/tweet-modal-debug");
    var Message = require("less/app/1.0.0/message-debug");
    var util = require("less/app/1.0.0/util-debug");
    function readImage(file, callback) {
        var readerDataURL = new FileReader();
        readerDataURL.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                callback && callback(img);
            };
            img.src = e.target.result;
        };
        readerDataURL.readAsDataURL(file);
    }
    var PicView = Backbone.View.extend({
        loadFile: function(file, callback) {
            var self = this;
            var err;
            if (file.size > 5 * 1024 * 1024) {
                err = new Error(chrome.i18n.getMessage("fileSizeError"));
            }
            if (err) return callback(err);
            this.pic = file;
            readImage(file, function(img) {
                var canvas = self.el.querySelector(".status-pic-canvas");
                var ctx = canvas.getContext("2d");
                var limit = 200;
                var rect = util.scale(img.width, img.height, limit, limit);
                canvas.height = rect.height;
                ctx.clearRect(0, 0, 200, 200);
                ctx.drawImage(img, parseInt((limit - rect.width) / 2), 0, rect.width, rect.height);
                callback(null);
            });
        },
        events: {
            "click .status-pic-del": "del"
        },
        show: function() {
            this.active = true;
            this.$el.show();
        },
        del: function() {
            $(document).trigger("picture:del");
            this.$el.hide();
            this.pic = null;
            this.active = false;
        }
    });
    var NewTweetModule = TweetModalModule.extend({
        events: {
            "click .action-geo": "_toggleGeo",
            "click .pic-action": "_triggerFileChange",
            "change .status-pic-file": "_loadFile",
            "click .topic-action": "_insertTopic"
        },
        initialize: function() {
            var self = this;
            this.model = new Backbone.Model();
            this.model.url = null;
            _.extend(this.events, NewTweetModule.__super__["events"]);
            this.model.set({
                title: chrome.i18n.getMessage("statusDefaultTitle"),
                actions_list: {
                    pic: true,
                    geo: true,
                    topic: true
                }
            });
            this._setType("update");
            $(document).on("picture:del", function() {
                self._setType("update");
            });
            NewTweetModule.__super__["initialize"].apply(this, arguments);
        },
        render: function() {
            NewTweetModule.__super__["render"].apply(this, arguments);
            this.picView = new PicView({
                el: this.el.querySelector("#status-pic-dropdown-menu")
            });
            return this;
        },
        _toggleGeo: function(e) {
            e.preventDefault();
            var control = e.currentTarget;
            var text;
            var self = this;
            if (!control.checked) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    self.geo = {
                        lat: position.coords.latitude,
                        "long": position.coords.longitude
                    };
                    control.textContent = chrome.i18n.getMessage("disableGeolocation");
                });
                text = "enableGeolocation";
                control.checked = true;
            } else {
                control.textContent = chrome.i18n.getMessage("enableGeolocation");
                this.geo = null;
                control.checked = false;
            }
        },
        _triggerFileChange: function(e) {
            e.preventDefault();
            if (this.picView.active) return;
            this.el.querySelector(".status-pic-file").click();
        },
        _loadFile: function(e) {
            e.preventDefault();
            var fileEl = e.currentTarget;
            var file = fileEl.files[0];
            var self = this;
            if (!file) return;
            this.submitBtn.disabled = true;
            var message = Message.createMessage({
                text: chrome.i18n.getMessage("generatePreview"),
                autoHide: false
            });
            this._setType("upload");
            this.picView.loadFile(file, function(err) {
                self.picView.show();
                self.indicateCounter();
                message.hide();
            });
        },
        _insertTopic: function(e) {
            e.preventDefault();
            var text = chrome.i18n.getMessage("topicMessage");
            var textarea = this.el.querySelector(".status-editor");
            var delimeter = "#";
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
                    value = value.slice(0, start) + delimeter + value.slice(start, end) + delimeter + value.slice(end);
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
                update: "statuses/update.json",
                upload: "statuses/upload.json"
            };
            this.url = map[type];
        },
        getParameters: function() {
            var parameters = _.extend({
                status: this.getTextareaValue()
            }, this.geo);
            if (this.type == "upload") {
                parameters.pic = this.picView.pic;
            }
            return parameters;
        }
    });
    return NewTweetModule;
});
