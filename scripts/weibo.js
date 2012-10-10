define(function(require, exports) {
    var oauth2 = require('./oauth2').getInstance();

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

	var loadMoreButton = document.getElementById('loadMore-button');
	loadMoreButton.onclick = function() {
		this.disabled = true;
		this.textContent = chrome.i18n.getMessage('loading');
		routeManager.currentSection.request('loadMore');
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

	request.errorHandler = function(data, xhr) {
		console.log(data);
		app.message.option('actions', [
			{
				label: 'Ok',
				click: function() {
					var self = this;
					this.el.slideUp(function() {
						self.option('actions', null);
					});
				}
			}
		]);
		app.message.show(data.error, 'error');
	};




		// routeManager.on('enter', function() {

		// 	return;
		// 	//保存上一个section的scrollTop
		// 	if (prevSection) {
		// 		prevSection.scrollState = document.body.scrollTop;
		// 	}

		// 	//还原当前section的scrollTop
		// 	document.body.scrollTop = currentSection.scrollState;
		// 	this.currentSection = currentSection;
		// });




		// var timelineSection = new PrimarySection({
		// 	name: 'timeline',
		// 	type: 'statuses',
		// 	elementID: 'timeline',
		// 	path: 'timeline'
		// });

		// routeManager.register(timelineSection);

		// var mentionsSection = new PrimarySection({
		// 	name: 'mentions',
		// 	type: 'mentions',
		// 	elementID: 'mentions',
		// 	key: 'statuses',
		// 	path: 'mentions'
		// });

		// routeManager.register(mentionsSection);

		// var favoritesSection = new Section({
		// 	name: 'favorites',
		// 	type: 'favorites',
		// 	elementID: 'favorites',
		// 	path: 'favorites'
		// });

		// routeManager.register(favoritesSection);


		// routeManager.register(UserSection.getInstance());

		// var relationsSection = new PrimarySection({
		// 	name: 'relations',
		// 	elementID: 'relations',
		// 	containerID: 'follows'
		// });

		// relationsSection.changeNavText();
		// relationsSection.el.querySelector('.rtRelations').setAttribute('href',
		// 		'#follows/' + app.util.toRfc3986(app.weibo.user.id)); 

		// routeManager.register(relationsSection);

		// var followsSection = new FollowsSection({
		// 	name: 'follows',
		// 	elementID: 'follows',
		// 	path: 'follows/:uid'
		// });

		// var followersSection = new FollowsSection({
		// 	name: 'followers',
		// 	elementID: 'followers',
		// 	path: 'followers/:uid'
		// });

		// routeManager.registerSubViewState(followsSection, relationsSection);
		// routeManager.registerSubViewState(followersSection, relationsSection);
	
		// commentsSection = CommentsSection.getInstance();
		// routeManager.register(commentsSection);

		// var commentsTomeSection = new CommentsSubSection({
		// 	name: 'comments-tome',
		// 	elementID: 'comments-tome'
		// });
		// commentsTomeSection.prepareRefreshCallback = function(items) {
		// 	var parent = this.parent;
		// 	parent.prepareRefreshCallback(items);
		// 	parent.unreadCount = 0;
		// 	parent.updateIndicator();
		// };
		// routeManager.registerSubViewState(commentsTomeSection, commentsSection);
		
		// routeManager.registerSubViewState(new CommentsSubSection({
		// 		name: 'comments-byme',
		// 		elementID: 'comments-byme'
		// 	}), commentsSection);




	/**
	 * @constructor
	 */
	function Section(options) {
		ViewState.call(this, {
			path: options.path,
			name: options.name
		});

		$.extend(this, options);
		this.key = this.key || this.type;
		this.el = document.getElementById(this.elementID);
		if (!this.containerID) {
			this.containerID = this.elementID;
			this.isDifContainer = false;
		} else {
			this.isDifContainer = true;
		}
		this.containerEl = document.getElementById(this.containerID);
		this.navEl = document.getElementById('nav-' + this.elementID);

		// console.log(this.elementID);
		// console.log(this.navEl);

		this.currentPage = 2;
		this.initial = true;
		this.scrollState = 0;

		this.data = $.extend({count: 20}, this.data);
		//Privileged member
		this.params = {
			common: {
				count: this.data.count
			},

			loadMore: {
				page: function() {
					return this.currentPage;
				}
			},

			refresh: {}
		};

		this.bindNav();
	}

	Section.prototype = {
		constructor: Section,

		__proto__: Backbone.ViewState.prototype,

		makeTweets: function(data) {
			var self = this;
			var fragment = document.createDocumentFragment();
			var items = data[this.key];
			if (items.length === 0) {
				var text = chrome.i18n.getMessage('noResult');
				var textNode = document.createTextNode(text);
				fragment.appendChild(textNode);
			} else {
				items.forEach(function(item) {
					if (item.deleted == '1') { return; }
					var tweet = new app.weibo.Tweet(self.type, item);
					var li = tweet.render().el;
					i18nTemplate.process(li, chrome.i18n.getMessage);
					fragment.appendChild(li);
				});
			}
			return fragment;
		},

		requestCallbacks: {
			'refresh': function(xhr, data) {
				var self = this;
				var containerJq = $(this.containerEl);
				var fragment = this.makeTweets(data);
				var items = data[this.key];
				if (this.prepareRefreshCallback) {
					this.prepareRefreshCallback(items);
				}
				var hasItems = !!items.length;
				if (!hasItems) {
					this.containerEl.appendChild(fragment);
				} else {
					var ul;
					if (ul = this.containerEl.querySelector('ul')) {
						ul.insertBefore(fragment, ul.firstChild);
					} else {
						ul = document.createElement('ul');
						ul.appendChild(fragment);
						this.containerEl.appendChild(ul);
					}
				}

				window.scroll(0, 0);

				var callback = function() {
					if (hasItems) {
						$(loadMoreButton).fadeIn();
					}

					self.initial = false;
					self.currentPage = 2;
					containerJq.find('> ul').children().slice(self.data.count).remove();
					app.message.hide();
				};

				if (this.isDifContainer) {
					containerJq.fadeIn(callback);
				} else {
					callback();
				}
			},

			'loadMore': function(xhr, data) {
				this.currentPage++;
				var items = data[this.key];
				var hasItems = !!items.length;
				loadMoreButton.disabled = false;
				loadMoreButton.textContent = chrome.i18n.getMessage('loadMore');
				if (hasItems) {	
					this.containerEl.querySelector('ul').appendChild(this.makeTweets(data));
				} else {
					$(loadMoreButton).fadeOut();
				}
				app.message.hide();
			}
		},

		getParams: function(type) {
			var paramsRet = {},
					key, value,
					params = $.extend({}, this.params.common, this.params[type]);

			for (key in params) {
				value = params[key];
				if (typeof value == 'function') {
					value = value.call(this);
				}
				//Filter undefined
				if (value != undefined) {
					paramsRet[key] = value;
				}
			}
			return paramsRet;
		},

		setParams: function(type, params) {
			$.extend(this.params[type], params);
		},

		request: function(type, callback) {
			if (typeof type == 'function') {
				callback = type;
				type = 'refresh';
			}

			var requestCallback = this.requestCallbacks[type],
					params = this.getParams(type),
					self = this;

			app.message.show(chrome.i18n.getMessage('loading'), 'loading');
			if (this.initial) {
				loadMoreButton.style.display = 'none';
			}
			shorthandRequest(this.name, params, function() {
				requestCallback.apply(self, arguments);
				callback && callback();
			});
		},

		get selected() {
			return this.navEl.classList.contains('selected');
		},

		getRootSection: function() {
			var section = this;
			while (section.parent) {
				section = section.parent;
			}
			return section;
		},

		enter: function() {
			this.request('refresh', this.changeNavStatus.bind(this));
		},

		changeNavStatus: function() {
			var navEl, el,
					id = this.name,
					selectedClassName = 'selected';

			// if (id === undefined) {
				navEl = this.navEl;
				el = this.el;
			// } else {
			// 	navEl = document.getElementById('nav-' + id);
			// 	el = document.getElementById(id);
			// }
			

			if (this.selected) return;

			var other = navEl.parentNode.querySelector('.' + selectedClassName);
			if (other) {
				other.classList.remove(selectedClassName);
				document.getElementById(other.id.slice(4)).style.display = 'none';
			}
			navEl.classList.add(selectedClassName);
			el.style.display = 'block';
		},

		bindNav: function() {
			this.navEl.addEventListener('click', this.navFn.bind(this));
		},

		navFn: function(e) {
			if (this.selected) {
				e.preventDefault();
				this.request('refresh');
			}
		}
	};


	/**
	 * @constructor
	 */
	function PrimarySection(options) {
		Section.apply(this, arguments);
		this.indicatorEl = this.navEl.querySelector('.unread-indicator');
		this.unreadCount = 0;

		this.params.refresh = {
			since_id: function() {
				return this.initial ? undefined : this.since_id;
			}
		};
	}


	PrimarySection.prototype = {
		constructor: PrimarySection,

		__proto__: Section.prototype,

		get dirty() {
			return this.initial || this.unreadCount != 0;
		},

		enter: function() {
			if (this.dirty) {
				Section.prototype.enter.apply(this, arguments);
			} else {
				this.changeNavStatus();
			}
		},

		request: function(type) {
			Section.prototype.request.apply(this, arguments);
			if (type == 'refresh') {
				this.unreadCount = 0;
				this.updateIndicator()
			}
		},

		prepareRefreshCallback: function(items) {
			if (items.length) {
				var id = items[0].id;
				this.since_id = id;
			}
		},

		notify: function() {
			if (!app.settings.get('notification.desktop.items', this.name) ||
					this.unreadCount == 0) { return; }

			var user = app.weibo.user;
			var type = chrome.i18n.getMessage(this.type);
			var notification = webkitNotifications.createNotification(
					user.profile_image_url,
					user.name,
					chrome.i18n.getMessage('unreadMessage', [this.unreadCount, type])
				);
			notification.show();
			setTimeout(function() {
				notification.cancel();
			}, app.settings.get('notification.desktop.disappearTimeout') * 1000);
		},

		updateIndicator: function() {
			var text = this.unreadCount;
			if (this.unreadCount == 0) {
				text = '';
			}
			this.indicatorEl.textContent = text;
		}
	};

	function CommentsSection() {
		PrimarySection.call(this, 'comments', {
			name: 'comments',
			elementID: 'comments'
		});
	}

	CommentsSection.prototype = {
		constructor: CommentsSection,
		__proto__: PrimarySection.prototype,

		navFn: function(e) {
			e.preventDefault();
			var fragment;
			if (this.selected) {
				routeManager.currentSection.request('refresh');
			} else if (this.initial) {
				fragment = '#comments-tome';
				this.initial = false;
			} else {
				fragment = '#' + this.currentSectionName + '/off';
			}
			location.hash = fragment;
		}
	};

	app.addSingletonGetter(CommentsSection);


	function CommentsSubSection(options) {
		Section.call(this, 'comments', options);
	}
	
	CommentsSubSection.prototype = {
		constructor: CommentsSubSection,
		__proto__: Section.prototype,

		request: function(type) {
			this.parent.currentSectionName = this.name;
			Section.prototype.request.call(this, type);
		}
	};


	function UserSection() {
		Section.call(this, {
			name: 'user',
			type: 'statuses',
			elementID: 'user',
			path: 'user/:id'
		});

		this.changeNavText();
		this.navEl.querySelector('a').setAttribute('href', '#user/' + app.weibo.user.id);
	}

	UserSection.prototype = {
		constructor: UserSection,

		__proto__: Section.prototype,

		enter: function(uid) {
			this.setParams('common', {uid: uid});
			Section.prototype.enter.call(this, arguments);
		},

		prepareRefreshCallback: function(items) {
			var user = items[0].user;
			this.changeNavText(user);
			user.item_name = this.name;
			var userView = new app.weibo.UserView({model: user});
			this.el.innerHTML = '';
			var el = userView.render().el;
			i18nTemplate.process(el, chrome.i18n.getMessage);
			this.el.appendChild(el);
		},

		changeNavText: function(data) {
			var text;
			if (typeof data == 'undefined' ||
					data.id == app.weibo.user.id) {
				text = chrome.i18n.getMessage('myTimeline');
			} else {
				text = chrome.i18n.getMessage('userTimeline', data.screen_name);
			}
			this.navEl.querySelector('a').textContent = text;
		}
	};

	app.addSingletonGetter(UserSection);

	function RelationsSection(options) {
		PrimarySection.call(this, options);
	}

	RelationsSection.prototype = {
		constructor: RelationsSection,

		__proto__: PrimarySection.prototype,

		enter: function() {
			var dirty = this.parent.dirty;

				this.parent.enter.call(this, arguments);

		},

		request: function(type, screen_name) {
			if (screen_name !== undefined) {
				this.setParams('common', {screen_name: screen_name});
			}
			this.parent.currentSectionName = this.name;
			Section.prototype.request.call(this, type);
		},

		enter: function() {

		},

		makeTweets: function(data) {
			var self = this;
			var fragment = document.createDocumentFragment();
			var items = data[this.key];

			this.parent.initial = false;
			this.changeNavText(this.parent.screen_name);
			var action = this.parent.screen_name == app.weibo.user.screen_name ?
					'add' : 'remove';
			this.parent.el.classList[action]('myRelations');

			if (items.length === 0) {
				var text = chrome.i18n.getMessage('noResult');
				var textNode = document.createTextNode(text);
				fragment.appendChild(textNode);
			} else {
				this.cursor = data.next_cursor;
				items.forEach(function(model) {
					var li = document.createElement('li');
					li.className = 'tweet';
					model.item_name = self.name;
					var userView = new app.weibo.UserView({model: model});
					var userDiv = userView.render().el;
					li.appendChild(userDiv);
					i18nTemplate.process(li, chrome.i18n.getMessage);
					fragment.appendChild(li);
				});
			}
			return fragment;
		},

		changeNavText: function(screenName) {
			var text;
			if (typeof screenName == 'undefined'
					|| screenName == app.weibo.user.screen_name) {
				text = chrome.i18n.getMessage('myRelations');
			} else {
				text = chrome.i18n.getMessage('relations', screenName);
			}
			var rootSection = this.getRootSection();
			rootSection.navEl.querySelector('a').textContent = text;	
		}
	};


	function FollowsSection(options) {
		options = $.extend({key: 'users'}, options); 
		RelationsSection.call(this, options);
		this.cursor = 0;
		this.params.loadMore = {
			cursor: function() {
				return this.cursor;
			}
		};
	}

	FollowsSection.prototype = {
		constructor: FollowsSection,
		__proto__: RelationsSection.prototype,

		request: function(type, screenName) {
			if (typeof screenName != 'undefined') {
				if (this.screen_name == screenName) return;
				this.parent.screen_name = this.screen_name = screenName;
			}
			this.parent.request.apply(this, arguments);
		},

		navFn: function(e) {
			e.preventDefault();
			if (this.selected) {
				this.request('refresh');
			} else {
				var hash = '#'+ this.name + '/' + app.util.toRfc3986(this.parent.screen_name);
				location.hash = hash;
			}
		}
	};


	return {
		request: request
	};

});
