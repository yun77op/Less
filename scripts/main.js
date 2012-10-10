(function() {


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
		




		application.registerModule(repostsModule);
		application.registerModule(RepostModule);
		application.registerModule(commentsModule);
		application.registerModule(CommentModule);
		application.registerModule(profileFollowingModule);
		application.registerModule(profileFollowersModule);






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

	});

})();
