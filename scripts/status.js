app.define('app.weibo', function() {

	function Status() {
		var visible = true;
		el.addEventListener('webkitTransitionEnd', function(e) {
			if (visible) {
				if (self.type == 'reply') {
					var len = textarea.value.length;
					textarea.selectionStart = len;
					textarea.selectionEnd = len;
				}
				textarea.focus();
			} else {
				self.reset();
			}
			visible = !visible;
		}, true);

	}
	
	function readImage(file, callback) {
		var readerDataURL = new FileReader();

		readerDataURL.onload = function(e) {
			var img = new Image();
			img.onload = function(e) {
				callback && callback(img);
			};
			img.src = e.target.result;
		};

		readerDataURL.readAsDataURL(file);
	}

	var geoControlPartial = Handlebars.compile('<input class="geo-control" id="status-geo-control" type="checkbox"><label for="status-geo-control" i18n-content="enableGeolocation">Enable Geolocation</label>'),
		commentControlPartial = Handlebars.compile('<label><input type="checkbox" class="comment-control">{{text}}</label>'),
		commentOriControlPartial = Handlebars.compile('<label><input type="checkbox" class="commentOrigin-control">{{text}}</label>');

	var PicView = Backbone.View.extend({
		loadFile: function(file, callback) {
			var size = file.size,
				self = this,
				err;

			if (size > 5 * 1024 * 1024) {
				err = new Error(chrome.i18n.getMessage('fileSizeError'));
			}

			if (err) {
				return callback(err);
			}

			this.imageFile = file;

			readImage(file, function(img) {
				var canvas = self.el.querySelector('.status-pic-canvas'),
					ctx = canvas.getContext('2d'), ratio, limit = 200,
					rect = app.util.scale(img.width, img.height, limit, limit);

				canvas.height = rect.height;
				ctx.clearRect(0, 0, 200, 200);
				ctx.drawImage(img, parseInt((limit - rect.width) / 2), 0, rect.width, rect.height);
				callback(null);
			});
		},

		events: {
			'click .status-pic-del': 'del'
		},

		del: function() {
			this.imageFile = null;
			this.$el.hide();
		}
	});

	var NewTweetModule = Backbone.Module.extend({
		name: 'new-tweet',

	    	template: document.getElementById('new-tweet-template'),

		initialize: function() {
			NewTweetModule.__super__['initialize'].call(this);

			var self = this;

			this.type = 'update';
			this.$el.on('hidden', function() {
				self.reset();
			});

		},

	    	render: function() {
			NewTweetModule.__super__['render'].call(this);

			this.submitBtn = this.el.querySelector('.status-submit-btn');
			this.picView = new PicView({
				el: this.el.querySelector('#status-pic-dropdown-menu')
			});
		},

		reset: function() {
			this.el.querySelector('.status-editor').value = '';
			this.el.classList.remove('className', this.type);
			this.picView.del();
		},

		show: function(options) {
			var type = options.type || this.type,
				title, textareaValue = '',
				$statusAside = $('.status-aside', this.$el),
				asideItems = [];

			this.el.classList.add(type);
			this.type = type;

			switch (type) {
			case 'update':
			case 'upload':
				title = chrome.i18n.getMessage('statusDefaultTitle');
				break;
			case 'reply':
				title = chrome.i18n.getMessage('statusReplyTitle', options.username);
				textareaValue = chrome.i18n.getMessage('reply')+ '@' + options.username + ':';
				break;
			case 'comment':
				title = chrome.i18n.getMessage('statusCommentTitle', options.username);
				if (options.comment_ori) {
					asideItems.push(commentOriControlPartial({text: chrome.i18n.getMessage('commentToOrigin', options.ori_username)}));
				}
				break;
			case 'repost':
				title = chrome.i18n.getMessage('statusRepostTitle');
				asideItems.push(commentControlPartial({text: chrome.i18n.getMessage('commentTo', options.username)}));

				if (options.comment_ori) {
					asideItems.push(commentControlPartial({text: chrome.i18n.getMessage('commentTo', options.ori_username)}));
					textareaValue = '//@' + options.username + ':' + options.text;
				}
				break;
			}

			asideItems.forEach(function(html, i) {
				$(html).wrapAll('<li></li>').parent().appendTo($statusAside);
			});

			this.el.querySelector('.status-editor').value = textareaValue;
			this.el.querySelector('.modal-header h3').textContent = title;
			this.$el.modal('show');
		},

		events: {
			'change .geo-control': 'enableGeo',
			'click .pic-action': 'triggerFileChange',
			'change .status-pic-file': 'loadFile',
			'click .topic-action': 'insertTopic',
			'click .status-submit-btn': 'connect',
			'keyup .status-editor': 'indicateCouter'
		},

		enableGeo: function(e) {
			e.preventDefault();
			var control = e.currentTarget,
				self = this;

			if (control.checked) {
				navigator.geolocation.getCurrentPosition(function(position) {
					self.geo = {
						lat: position.coords.latitude,
						long: position.coords.longitude
					}
				});
			} else {
				this.geo = null;
			}
		},

		triggerFileChange: function(e) {
			e.preventDefault(); 
			this.el.querySelector('.status-pic-file').click();
		},

		loadFile: function(e) {
			e.preventDefault();
			var fileEl = e.currentTarget,
				file = fileEl.files[0],
				self = this;

			if (!file) return;
			
			this.submitBtn.disabled = true;
			app.message.show(chrome.i18n.getMessage('generatePreview'));
			this.type = 'upload';
			this.picView.loadFile(file, function(err) {
				if (err) {
					return;
				}

				self.picView.$el.show();
				self.submitBtn.disabled = false;
			});
		},

		insertTopic: function(e) {
			e.preventDefault();
			var text = chrome.i18n.getMessage('topicMessage'),
				textarea = this.el.querySelector('.status-editor'),
				delimeter = '#',
				textFormatted = delimeter + text + delimeter,
				value = textarea.value,
				index = value.indexOf(textFormatted);

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
			this.indicateCouter();
		},

		connect: function() {
			var textarea = this.el.querySelector('.status-editor'),
				text = String(textarea.value).trim();

			if (text == '') {
				textarea.focus();
				return app.message.show(chrome.i18n.getMessage('fieldEmpty'), true);
			}

			var params = {}, self = this, path;

			switch (this.type) {
				case 'upload':
					path = 'statuses/upload.json';
					params.status = text;
					params.imageFile = this.picView.imageFile;
					$.extend(params, this.geo);
					break;
				case 'update':
					path = 'statuses/update.json';
					params.status = text;
					$.extend(params, this.geo);
					break;
				case 'repost':
					path = 'statuses/repost.json';
					params.status = text;
					params.id = this.model.id;
					var is_comment = 0;
					is_comment += el.querySelector('#status-comment').checked ? 1 : 0;
					is_comment += el.querySelector('#status-commentOrigin').checked ? 2 : 0;
					params.is_comment = is_comment;
					break;
				case 'comment':
					path = 'comments/create.json';
					params.id = this.model.id;
					if (this.model.retweeted_status) {
						params.comment_ori = el.querySelector('#status-commentOrigin').checked ? 1 : 0;
					}
					params.comment = text;
					break;
				case 'reply':
					path = 'comments/reply.json';
					params.comment = text;
					params.cid = this.model.cid;
					params.id = this.model.id;
					params.without_mention = '0'; //TODO
			}

			app.message.show(chrome.i18n.getMessage('loading'));
			app.weibo.request({
				method: 'POST',
				path: path,
				params: params
			}, function() {
				self.$el.modal('hide');
				app.message.show('Success', true);
			});
		},

		indicateCouter: function() {
			var textarea = this.el.querySelector('.status-editor'),
				counterEl = this.el.querySelector('.status-counter'),
				text = textarea.value,
				textTrimmedLen = text.trim().length,
				counter = text.length,
				limit = 140,
				submitBtn = this.submitBtn,
				diff;

			result = text.match(/[^\x00-\xff]/g);
			counter += result && result.length || 0;
			counter = Math.ceil(counter / 2);
			diff = limit - counter;

			counterEl.textContent = diff;

			if (diff < 0 || !textTrimmedLen) {
				submitBtn.disabled = true;
				submitBtn.classList.remove('btn-primary');
			} else {
				submitBtn.disabled = false;
				submitBtn.classList.add('btn-primary');
			}
			
			counterEl.classList[diff < 0 ? 'add' : 'remove']('danger');
		}
	});
	

	return {
		NewTweetModule: NewTweetModule
	};

});
