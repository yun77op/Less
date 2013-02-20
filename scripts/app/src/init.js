define(function(require, exports) {

    var oauth2 = require('./lib/oauth2').getInstance();
    var util = require('./util');
    var TweetPlugins = require('./tweet_plugin');

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

        Handlebars.registerPartial('stream-item-vcard', require('./views/stream_item_vcard.tpl'));
        Handlebars.registerPartial('stream-item-tweet-content', require('./views/stream-item-content.tpl'));
        Handlebars.registerPartial('stream-item-footer', require('./views/stream-item-footer.tpl'));
        Handlebars.registerPartial('profile-stats', require('./views/profile-stats.tpl'));
        Handlebars.registerPartial('stream-item-profile-content', require('./views/stream-item-profile-content.tpl'));

        application.registerModule(require('./modules/mini_profile.js'));
        application.registerModule(require('./modules/weibo-emoticons.js'));
        application.registerModule(require('./modules/stream-picture.js'));
        application.registerModule(require('./modules/stream-item.js'));
        application.registerModule(require('./modules/user.js'));
        application.registerModule(require('./modules/home-timeline.js'));
        application.registerModule(require('./modules/status.js'));
        application.registerModule(require('./modules/stream.js'));
        application.registerModule(require('./modules/user-timeline.js'));
        application.registerModule(require('./modules/comments.js'));
        application.registerModule(require('./modules/comment.js'));
        application.registerModule(require('./modules/mentions.js'));
        application.registerModule(require('./modules/relationship-action.js'));
        application.registerModule(require('./modules/profile-card.js'));
        application.registerModule(require('./modules/profile-nav.js'));
        application.registerModule(require('./modules/connect-nav.js'));
        application.registerModule(require('./modules/new-tweet.js'));
        application.registerModule(require('./modules/following.js'));
        application.registerModule(require('./modules/followers.js'));
        application.registerModule(require('./modules/mini-repost-list.js'));
        application.registerModule(require('./modules/mini-comment-list.js'));
        application.registerModule(require('./modules/mini-repost-body.js'));
        application.registerModule(require('./modules/mini-comment-body.js'));
        application.registerModule(require('./modules/mini-stream-item.js'));
        application.registerModule(require('./modules/tweet-comment.js'));
        application.registerModule(require('./modules/tweet-repost.js'));


        require('./view_states/index.js')(application, routeManager);
        require('./view_states/status.js')(application, routeManager);
        require('./view_states/profile.js')(application, routeManager);
        require('./view_states/connect.js')(application, routeManager);

        var Reminder = require('./reminder.js');
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

            var NewTweetModule = require('./modules/new-tweet');
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
