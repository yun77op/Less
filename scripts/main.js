(function() {
	var oauth2 = app.OAuth2.getInstance();
	if (!oauth2.hasToken()) {
		window.location.href = chrome.extension.getURL('login.html');
	}

	$('#loading-mask').fadeOut();

	app.message = new app.Message('top');
	app.alert = $('.global-alert').alert2();

	app.weibo.request({
		path: 'users/show.json',
		params: {
			uid: localStorage['uid']
		}
	}, function(data) {
		app.weibo.user = data;

		Handlebars.registerHelper('date_format', function(date, options) {
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
		});

		Handlebars.registerPartial('stream-item-vcard', '  <div class="stream-item-vcard"> <a class="vcard" title="{{ name }}" href="#!/{{ id }}"> <img width="50" height="50" src="{{ profile_image_url }}" class="avator"> </a> </div> ');
		Handlebars.registerPartial('stream-item-footer', '<div class="stream-item-footer"> <span class="metadata"> <a href="#!/statuses/{{id}}">{{#date_format created_at}}{{/date_format}}</a> <span i18n-content="from">from</span> {{{ source }}} </span> <ul class="actions"> <li> <a href="#" title="Repost" class="action-repost" i18n-content="repost" i18n-values="title:repost"> <span class="icon icon-16 icon-repost"></span> </a> {{#if reposts_count}} <a href="#" class="action-show-repostList">{{ reposts_count }}</a> {{/if}} </li> <li> <a href="#" title="Comment" class="action-comment" i18n-content="comment" i18n-values="title:comment"> <span class="icon icon-16 icon-comment"></span> </a> {{#if comments_count}} <a href="#" class="action-show-commentList">{{ comments_count }}</a> {{/if}} </li> </ul> </div> ');
		Handlebars.registerPartial('stream-item-tweet-content', '<div class="stream-item-content"> <div class="tweet"> <a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{ text }}</p> {{#if thumbnail_pic}} <div class="tweet-pic"> <div class="tweet-pic-thumb" data-original="{{ original_pic }}"> <img src="{{ thumbnail_pic }}"> </div> </div> {{/if}} {{#if retweeted_status}} {{#with retweeted_status}} {{> stream-item-tweet-content}} {{/with}} {{/if}} {{> stream-item-footer}} </div> </div>');
		Handlebars.registerPartial('stream-item-profile-content', '  <div class="stream-item-content"> <div class="actions"> {{#module this name="application.relationship-action"}} {{/module}} </div> <div class="content"> <a href="#!/{{id}}" class="username">{{screen_name}}</a> <p class="bio">{{description}}</p> </div> </div> ');
		Handlebars.registerPartial('profile-stats', ' <ul class="profile-stats"> <li><a href="#!/{{id}}"><strong>{{statuses_count}}</strong>TWEETS</a></li> <li><a href="#!/{{id}}/following"><strong>{{friends_count}}</strong>FOLLOWING</a></li> <li><a href="#!/{{id}}/followers"><strong>{{followers_count}}</strong>FOLLOWERS</a></li> </ul> ');

		var methodMap = {
			'create': 'POST',
			'update': 'PUT',
			'delete': 'DELETE',
			'read': 'GET'
		};

		var StreamModuleModel = Backbone.Model.extend({
			sync: function(method, model, options) {
				var obj = {
					path: model.get('_url'),
					method: methodMap[method],
					params: model.get('urlParams')
				};

				app.weibo.request(obj, {
					success: options.success,
					error: options.error
				});
			}
		});



		var MiniProfileModule = Backbone.Module.extend({
			name: 'mini-profile',
			className: 'module',
			template: ' <div class="flex-module"> <div class="profile-summary"> <a href="#!/{{id}}"> <div class="content"> <img src="{{profile_image_url}}" class="avatar"> <b class="fullname">{{screen_name}}</b> <small class="meta">View my profile page</small> </div> </a> </div> </div> <div class="flex-module">{{> profile-stats}}</div>'
		});

		var miniProfileModule = new MiniProfileModule({
			model: {
				attributes: app.weibo.user
			},
			placeholder: 'Loading..'
		});



		var StreamModule = Backbone.Module.extend({
			render: function() {
				this.$el.html(this.template());

				var data = this.model.attributes;
		    	var $stream = $('.stream', this.$el);
                var View = this.View;

				data[data._key].forEach(function(status, i) {
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

		var HomeTimelineModule = StreamModule.extend({
			name: 'home-timeline',
			View: app.weibo.StreamItemTweetView
		});

		var homeTimelineModule = new HomeTimelineModule({
			model: new StreamModuleModel({
				_url: 'statuses/home_timeline.json',
				_key: 'statuses'
			})
		});

		var StreamNeedUidModule = StreamModule.extend({
		    	enter: function(uid) {
				this.model.set('urlParams', {
				      uid: uid
				});
			}
		});

		var UserTimelineModule = StreamNeedUidModule.extend({
			name: 'user-timeline',
			View: app.weibo.StreamItemTweetView
		});
	
		var userTimelineModule = new UserTimelineModule({
			model: new StreamModuleModel({
				_url: 'statuses/user_timeline.json',
				_key: 'statuses'
			})
		});
	

		var ProfileFollowingModule = StreamNeedUidModule.extend({
			name: 'profile-following',
			View: app.weibo.StreamItemProfileView
		});

		var profileFollowingModule = new ProfileFollowingModule({
			model: new StreamModuleModel({
				_url: 'friendships/friends.json',
				_key: 'users'
			})
		});

		var ProfileFollowersModule = StreamNeedUidModule.extend({
			name: 'profile-followers',
			View: app.weibo.StreamItemProfileView
		});

		var profileFollowersModule = new ProfileFollowersModule({
			model: new StreamModuleModel({
				_url: 'friendships/followers.json',
				_key: 'users'
			})
		});


		var CommentsRepostsModule = Backbone.Module.extend({
		    	enter: function(id) {
				this.model.set('urlParams', {
					id: id
				});
			}			
		});

		var RepostsModule = CommentsRepostsModule.extend({ 
			name: 'reposts',
			template: document.getElementById('reposts-template'),
			model: new StreamModuleModel({
				_url: 'statuses/repost_timeline.json'
			})
		});

		var repostsModule = new RepostsModule();


		var RepostModule = Backbone.Module.extend({
			name: 'repost',
		    	className: 'stream-item',
	    		template: document.getElementById('repost-template'),
		    	events: {
				'click .repost-action': 'repost'
			},
			repost: function(e) {
					
			}
		});

		var CommentsModule = CommentsRepostsModule.extend({
			name: 'comments',
			template: document.getElementById('comments-template'),
			model: new StreamModuleModel({
				_url: 'comments/show.json'
			})
		});

		var commentsModule = new CommentsModule();

		var CommentModule = Backbone.Module.extend({
			name: 'comment',
		    	className: 'stream-item',
	    		template: document.getElementById('comment-template'),
		    	events: {
				'click .comment-action': 'comment'
			},
			comment: function(e) {
					
			}		
		});		
		





		var ProfileCardNavModule = Backbone.Module.extend({
		    	enter: function(uid) {
				this.model.set('urlParams', {
					uid: uid
				});
			},
			model: new StreamModuleModel({
				_url: 'users/show.json'
			}),
		    	placeholder: 'Loading..'
		});

		var ProfileCardModule = ProfileCardNavModule.extend({
			name: 'profile-card',
		    	className: 'module',
		    	template: '  <div class="flex-module clearfix"> <img src="{{avatar_large}}" class="pull-left avator" alt="{{screen_name}}"> <div class="profile-card-inner"> <h1>{{screen_name}}</h1> {{#if description}} <p class="bio">{{description}}</p> {{/if}} <p> <span class="location">{{location}}</span> {{#if url}} <span class="divider">.</span> <a class="url" href={{url}} target="_blank">{{url}}</a> {{/if}} </p> </div> <div class="profile-card-actions"> {{#module this name="application.relationship-action"}} {{/module}} {{> profile-stats}} </div> </div> '
		});

		var profileCardModule = new ProfileCardModule();

		var ProfileNavModule = ProfileCardNavModule.extend({
			name: 'profile-nav',

			template: ' <ul class="nav nav-tabs nav-stacked"> <li data-nav="tweets"><a href="#!/{{id}}">Tweets</a></li> <li data-nav="following"><a href="#!/{{id}}/following">Following</a></li> <li data-nav="followers"><a href="#!/{{id}}/followers">Followers</a></li> </ul> ',
		  	afterEnter: function() {
				var self = this;

				new Backbone.Available(function() {
					return self.active;
				}, function() {
					self.highlightTab();
				});
			},

		    	events: {
				'click .nav-tabs li': 'handleTabClick'
			},

		    	highlightTab: function() {
				var fragment = Backbone.history.getFragment(),
		    			ary = fragment.split('/'),
		    			nav = 'tweets';

				if (ary.length == 3) nav = ary.pop();
				$('[data-nav="' + nav + '"]', this.$el).addClass('active');
			},

			handleTabClick: function(e) {
				var $el = $(e.currentTarget),
		    			activeClassName = 'active';

				$el.siblings().removeClass(activeClassName);
				$el.addClass(activeClassName);
			}
		});
		
		var profileNavModule = new ProfileNavModule();

		var RelationshipActionModule = Backbone.Module.extend({
			name: 'relationship-action',
			template: '  <a href="#" class="btn btn-primary relationship-btn{{#if following}} following{{/if}}{{#if follow_me}} follow-me{{/if}}"> <span class="btn-text action-following">Following</span> <span class="btn-text action-follow">Follow</span> <span class="btn-text action-unfollow">Unfollow</span> </a> ',

			events: {
				'click .action-unfollow': 'unfollow',
		    		'click .action-follow': 'follow'
			},

		    	unfollow: function(e) {
				e.preventDefault();
				app.weibo.request({
					method: 'POST',
					path: 'friendships/destory.json',
					params: {
						uid: this.model.attributes.id
					}
				}, function() {
					var $btn = $(e.currentTarget).parent();
					$btn.removeClass('following');
				});
			},

		    	follow: function(e) {
				e.preventDefault();

				app.weibo.request({
					method: 'POST',
					path: 'friendships/create.json',
					params: {
						uid: this.model.attributes.id
					}
				}, function() {
					var $btn = $(e.currentTarget).parent();
					$btn.addClass('following');
				});
			}
		});


		application.registerModule(repostsModule);
		application.registerModule(RepostModule);
		application.registerModule(commentsModule);
		application.registerModule(CommentModule);
		application.registerModule(miniProfileModule);
		application.registerModule(homeTimelineModule);
		application.registerModule(userTimelineModule);
		application.registerModule(profileFollowingModule);
		application.registerModule(profileFollowersModule);
		application.registerModule(profileCardModule);
		application.registerModule(profileNavModule);
		application.registerModule(RelationshipActionModule);
		application.registerModule(app.weibo.NewTweetModule);


		var StatusModalModule = Backbone.Module.extend({
			id: 'status-modal',
		    className: 'modal hide',
			template: document.getElementById('status-modal-template')
		});
		
		var statusModalModule = new StatusModalModule();
		statusModalModule.render().$el.appendTo('body');
		app.weibo.status = statusModalModule;


		var BaseViewState = Backbone.ViewState.extend({
			enter: function() {
				if (!this.active) {
					this.view.render();
				}
			}
		});


		var IndexView = Backbone.View.extend({
			template: Handlebars.compile('<div class="container"> <div class="row"> <div class="dashboard span4"> {{#module name="application.mini-profile"}} {{/module}} </div> <div class="content-main span8"> {{#module name="application.home-timeline"}} {{/module}} </div> </div> </div>'),
			render: function() {
				application.$el.html(this.template());
				return this;
			}
		});

		var indexView = new IndexView();


		var indexViewState = new BaseViewState({
			path: '/',
			view: indexView
		});


		var ProfileView = Backbone.View.extend({
			template: Handlebars.compile(' <div class="container"> {{#module name="application.profile-card"}} {{/module}} <div class="row"> <div class="dashboard span4"> {{#module name="application.profile-nav"}} {{/module}} </div> <div class="content-main span8"> </div> </div> </div> '),
			render: function() {
				application.$el.html(this.template());
			}
		});


		var profileView = new ProfileView();


		var ProfileViewState = Backbone.ViewState.extend({
			path: '!/:uid',
			view: profileView,
			enter: function() {
				if (!this.active) {
					this.view.render();
				}
							
				var $el = $('.content-main'),
		    			userTimelineModule = application.getModuleByName('user-timeline');
				$el.html(userTimelineModule.start(arguments));
			}
		});

		var profileViewState = new ProfileViewState();


		var ProfileFollowingViewState = BaseViewState.extend({
			enter: function() {
				var $el = $('.content-main'),
		    			profileFollowingModule = application.getModuleByName('profile-following');
				$el.html(profileFollowingModule.start(arguments));				
		       	}
		});

		var profileFollowingViewState = new ProfileFollowingViewState({
			path: 'following'
		});

		
		var ProfileFollowersViewState = BaseViewState.extend({
			enter: function() {
				var $el = $('.content-main'),
		    			profileFollowersModule = application.getModuleByName('profile-followers');
				$el.html(profileFollowersModule.start(arguments));
		       	}
		});

		var profileFollowersViewState = new ProfileFollowersViewState({
			path: 'followers'
		});


//		Backbone.install('twb', {
//			el: '#page-container'
//		}, function(routeManager) {
//			routeManager.register(profileViewState);
//			routeManager.registerSubViewState(profileFollowingViewState, profileViewState);
//			routeManager.registerSubViewState(profileFollowersViewState, profileViewState);
//			routeManager.register(indexViewState);
//
//			Backbone.history.start();
//		});
	});

})();
