app.define('app.weibo', function() {
	var weibo = app.weibo,
		status = weibo.status,
		each = Array.prototype.forEach;


	var StreamItemTweetView = Backbone.View.extend({
	    	className: 'stream-item',
		template: Handlebars.compile('  {{#with user}} {{> stream-item-vcard}} {{/with}} {{> stream-item-tweet-content}} '),
		render: function() {
			this.$el.html(this.template(this.model));
			each.call(this.el.querySelectorAll('.tweet-pic'), function(el) {
				new ImageView({
					el: el
				});
			});

			return this;
		},

		events: {
			'click .action-repost': 'repost',
			'click .action-comment': 'comment',
			'click .action-favorite': 'favorite',
			'click .action-del': 'del',
			'click .action-show-repostList': 'repostList',
			'click .action-show-commentList': 'commentList'
		},

		repost: function(e) {
			e.preventDefault();
			var options = {
				type: 'repost',
				username: this.model.user.name
			};

			if (this.model.retweeted_status) {
				options.comment_ori = true;
				options.ori_username = this.model.retweeted_status.user.name;
				options.text = this.model.text;
			}

			app.weibo.status.show(options);
		},

		comment: function(e) {
			e.preventDefault();
			var options = {
				type: 'comment',
				username: this.model.user.name
			};

			if (this.model.retweeted_status) {
				options.comment_ori = true;
				options.ori_username = this.model.retweeted_status.user.name;
			}

			app.weibo.status.show(options);
		},

		favorite: function(e) {
			e.preventDefault();
			var self = this;
			var currentTarget = e.currentTarget;
			//Prevent race
			if (currentTarget.disabled) { return; }
			var action = currentTarget.classList.contains('favorited') ? 'destroy' : 'create';
			var model = this.model;
			if ($(currentTarget).parents('.retweet').length > 0) {
				model = model[model.key];
			}
			app.weibo.request({
				method: 'POST',
				path: 'favorites/'+ action + '.json',
				params: {id: model.id}
			}, function() {
				currentTarget.disabled = false;
				currentTarget.classList.toggle('favorited');
				if (self.type == 'favorites') {
					$(self.el).slideUp(function() {
						self.remove();
					});
				}
			});
			currentTarget.disabled = true;
		},

		del: function(e) {
			e.preventDefault();
			var self = this;
			app.weibo.request({
				method: 'POST',
				path: this.type + '/destroy.json',
				params: {id: this.model.id}
			}, function() {
				$(self.el).slideUp(function() {
					self.remove();
				});
			});
		},

		commentList: function(e) {
			var currentTarget = $(e.currentTarget);
			var name, isRetweet;
			if (currentTarget.parents('.retweet').length > 0) {
				name = 'retweetComments';
				isRetweet = true;
			} else {
				name = 'comments';
			}
			this.setupListView(e, name, 'comments', isRetweet);
		},

		repostList: function(e) {
			var currentTarget = $(e.currentTarget);
			var name, isRetweet;
			if (currentTarget.parents('.retweet').length > 0) {
				name = 'retweetReposts';
				isRetweet = true;
			} else {
				name = 'reposts';
			}
			this.setupListView(e, name, 'reposts', isRetweet);
		},

		setupListView: function(e, name, type, isRetweet) {
			e.preventDefault();
			var currentTarget = e.currentTarget;
			var listViewEl = this.el.querySelector('.tweet-listView');
			var action = type == 'comments' ? 'comments/show' : 'statuses/repost_timeline';
			var model = !isRetweet ? this.model : this.model[this.model.key];
			if (this.currentListViewName == name || listViewEl) {
				listViewEl.parentNode.removeChild(listViewEl);
			}
			if (this.currentListViewName != name) {
				new ListView(this.el, model, action, type, currentTarget).retrievePage(1);
				this.currentListViewName = name;
			} else {
				this.currentListViewName = null;
			}
		}
	});


	// Tweet.View = Backbone.View.extend({
	// 	tagName: 'li',
	// 	className: 'tweet',
	// 	// template: new EJS({url: 'views/tweet.ejs.html'}),
	// 	initialize: function() {
	// 		_.bindAll(this, 'render');
	// 	},

	// 	render: function() {
	// 		var map = {
	// 			'mentions': 'retweeted_status',
	// 			'statuses': 'retweeted_status',
	// 			'comments': 'reply_comment',
	// 			'favorites': 'status'
	// 		};
	// 		var key = map[this.type];
	// 		var model = this.model;
	// 		if (this.type == 'favorites') {
	// 			model = this.model.status;
	// 			model.favorited_time = this.model.favorited_time;
	// 		}
	// 		if (this.type == 'comments' && !model[key]) {
	// 			key = 'status';
	// 		}
	// 		this.model = model = $.extend({key: key, type: this.type}, model);
	// 		this.template.update(this.el, model);
	// 		this.processImage();
	// 		return this;
	// 	}
	// });


	var ImageView = Backbone.View.extend({
		template: ' <img src="images/loading.gif" class="throbber" hidden> <div class="tweet-pic-origin" hidden> <div class="actions"> <a href="#" class="action-collapse">收起</a> <a href="#" target="_blank" class="action-view-origin">查看大图</a> <a href="#" class="action-rotate-left">左转</a> <a href="#" class="action-rotate-right">右转</a> </div> </div>',
		initialize: function(options) {
			this.widthLimit = 420;
			this.$el.append(this.template);

			this.originalEl = this.el.querySelector('.tweet-pic-origin');
			this.originalSrc = this.el.querySelector('.tweet-pic-thumb').getAttribute('data-original');
			this.thumbEl = this.el.querySelector('.tweet-pic-thumb');
			this.deg = 0;

			if (this.options.expand) {
				this.show();
				this.el.querySelector('.action-collapse').style.display = 'none';
			} else {
				_.bindAll(this, 'collapse');
				this.$el.on('click', '.tweet-pic-origin img', this.collapse);
				this.$el.on('click', '.tweet-pic-origin canvas', this.collapse);
			}

		},

		events: {
			'click .tweet-pic-thumb img': 'show',
			'click .action-collapse': 'collapse',
			'click .action-rotate-left': 'rotateLeft',
			'click .action-rotate-right': 'rotateRight'
		},

		show: function() {
			if (this.inited) {
				this.expand();
			} else {
				this.load();
			}
		},

		load: function() {
			var throbberEl = this.el.querySelector('.throbber'),
					rect = this.el.querySelector('.tweet-pic-thumb img').getBoundingClientRect();

			throbberEl.style.left = (rect.width / 2 - 8) + 'px';
			throbberEl.style.top = (rect.height / 2 - 8) + 'px';
			throbberEl.style.display = 'block';

			var img = new Image();
			img.onload = this.onLoad.bind(this, img);
			img.src = this.originalSrc;
		},

		onLoad: function(img) {
			this.$el.find('.throbber').remove();
			this.el.querySelector('.action-view-origin').href = this.originalSrc;

			this.inited = true;
			this.expand();
		},

		_show: function() {
			var img = document.createElement('img'), rect;

			img.src = this.originalSrc;
			rect = app.util.scale(img.width, img.height, this.widthLimit);
			img.width = rect.width;
			img.height = rect.height;

			this.originalEl.style.display = 'block';
			img.style.marginLeft = (this.widthLimit - rect.width) / 2 + 'px';

			this.originalEl.appendChild(img);
		},

		collapse: function() {
			var originalEl = this.originalEl;
			originalEl.removeChild(originalEl.lastChild);
			originalEl.style.display = 'none';
			this.thumbEl.style.display = 'block';
		},

		expand: function() {
			this.thumbEl.style.display = 'none';
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

		rotate: function () {
			var canvas = this.originalEl.querySelector('canvas'),
					img = document.createElement('img'),
					canvas;
			
			img.src = this.originalSrc;

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
			var rect = app.util.scale(imgRect[0], imgRect[1], this.widthLimit);
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



	function ListView(el, model, action, type, trigger) {
		this.type = type;
		this.action = action;
		this.model = model;
		this.initial = true;
		this.countPerPage = 7;
		var count = model[type + '_count'];
		this.totalPage = Math.ceil(count / this.countPerPage);
		var listViewEl = ListView.template.cloneNode(true);
		listViewEl.classList.add(type + '-listView');
		el.querySelector('.column-right').appendChild(listViewEl);
		this.listViewEl = listViewEl;
		this.template = new EJS({element: 'tweet-listView-tmpl'});
		this.trigger = trigger;
		this.setupNav();
	}



	var ListView = Backbone.View.extend({
		template: '<div class="listView"> <div class="loading-area"> <img src="images/loading.gif"><span i18n-content="loading">Loading</span> </div> <div class="listView-container" hidden> <div class="arrow"> <span>◆</span> </div> <div class="listView-content"></div> <nav> <a href="#" class="prev" i18n-content="prev">Prev</a> <a href="#" class="next" i18n-content="next">Next</a> </nav> </div> </div>',
		fetch: function(page) {
			this.listViewEl.style.display = 'block';
			var params = {};
			params.id = this.model.id;
			params.count = this.countPerPage;
			params.page = page;
			app.weibo.request({
				path: this.action + '.json',
				params: params
			}, this.retrieveCallback.bind(this, page));
		},

		retrieveCallback: function(page, xhr, data) {
			if (this.initial) {
				this.listViewEl.querySelector('.loadingArea').style.display = 'none';
				this.listViewEl.querySelector('.tweet-listView-container').style.display = 'block';
				this.initial = false;	
			}

			var self = this;
			this.page = page;
			this.trigger.textContent = data.total_number;

			var contentEl = this.listViewEl.querySelector('.tweet-listView-content'),
					fragment = document.createDocumentFragment(),
					items = data[this.type];
			if (items.length) {
				var ul = document.createElement('ul');
				items.forEach(function(model) {
					//No need to use Backbone.View 
					var li = document.createElement('li');
					li.className = 'listView-item tweet column';
					self.template.update(li, model);
					li.querySelector('.reply').onclick = function(e) {
						e.preventDefault();
						app.weibo.status.type = 'reply';
						model.cid = model.id;
						model.id = self.model.id;
						app.weibo.status.model = model;
						app.weibo.status.show();
					};
					i18nTemplate.process(li, chrome.i18n.getMessage);
					ul.appendChild(li);
				});
				fragment.appendChild(ul);
			} else {
				this.listViewEl.classList.add('tweet-listView-empty');
				var handle = this.type.replace(/^(\w)/, function(s0, s1) {
					return s1.toUpperCase();
				});
				var text = document.createTextNode(chrome.i18n.getMessage('no' + handle));
				fragment.appendChild(text);
			}
			contentEl.innerHTML = '';
			contentEl.appendChild(fragment);
		},

		setupNav: function() {
			var self = this;
			var prevEl = this.listViewEl.querySelector('.prev');
			var nextEl = this.listViewEl.querySelector('.next');
			prevEl.setAttribute('disabled', 'true');
			if (this.totalPage == 0 || this.totalPage == 1) {
				nextEl.setAttribute('disabled', 'true');
			}
			prevEl.onclick = function(e) {
				e.preventDefault();
				if (this.disabled) { return; }
				var page = self.page - 1;
				self.fetch(page);
				if (page == 1) {
					this.setAttribute('disabled', 'true');
				}
				this.nextElementSibling.setAttribute('disabled', 'false');
			};

			nextEl.onclick = function(e) {
				e.preventDefault();
				if (this.disabled) { return; }
				var page = self.page + 1;
				self.fetch(page);
				if (page == self.totalPage) {
					this.setAttribute('disabled', 'true');
				}
				this.previousElementSibling.setAttribute('disabled', 'false');
			};
		}
	});

		


	
	var StreamItemProfileView = Backbone.View.extend({
		className: 'stream-item stream-item-profile',
	    	template: Handlebars.compile('  {{> stream-item-vcard}} {{> stream-item-profile-content}} '),
		events: {
			'click .follow': 'follow',
			'click .directMessage': 'directMessage'
		},

		render: function() {
			this.$el.html(this.template(this.model));
			return this;
		},

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
		},

		directMessage: function(e) {
			e.preventDefault();
			app.weibo.status.type = 'directMessage';
			app.weibo.status.model = this.model;
			app.weibo.status.show();
		}
	});
	

	return {
		ImageView: ImageView,
		StreamItemTweetView: StreamItemTweetView,
		StreamItemProfileView: StreamItemProfileView
	};

});
