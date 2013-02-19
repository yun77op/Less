define(function(require, exports) {

    var oauth2 = require('./lib/oauth2').getInstance();
    var util = require('./util.js');
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

        var Message = $('<div class="notifications bottom-right"></div>').appendTo('body');
        var Reminder = require('./reminder.js');
        var userID = JSON.parse(localStorage.getItem('uid'));
        var pathMap = {
          follower: userID + '/followers',
          cmt: 'connect',
          mention_status: 'mentions',
          mention_cmt: 'mentions'
        };

        Reminder.on('all', function(eventName, count) {
          if (eventName == 'status') return;
          var path = pathMap[eventName];
          path = path ? '#!/' + path : '#';
          Message.notify({
            message: '<a href="' + path + '">' + count + ' ' + eventName + '</a>'
          }).show();
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

        Backbone.history.start();
        Backbone.history.checkUrl();

        $('#loading-mask').fadeOut();
    });

});
