define(function(require, exports) {

    var util = require('../util');

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
			var blob = new WebKitBlobBuilder(),
					builder,
					pic = this.pic;

			this.getUniqueBoundary();

			var boundary = this.boundary,
					crlf = '\r\n',
					dashdash = '--';

			builder = dashdash + boundary + crlf;
			for (var i in this.params) {
				builder += 'Content-Disposition: form-data; name="' + i + '"' + crlf + crlf;
				builder += this.params[i] + crlf;
				builder += dashdash;
				builder += boundary;
				builder += crlf;
			}

			builder += 'Content-Disposition: form-data; name="pic"; filename="' + pic.fileName + '"' + crlf;
			builder += 'Content-Type: ' + pic.fileType + crlf + crlf;
			blob.append(builder);
			blob.append(pic);
			builder = crlf;
			builder += dashdash;
			builder += boundary;
			builder += dashdash;
			builder += crlf;
			blob.append(builder);
			data = blob.getBlob();

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
