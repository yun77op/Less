define(function(require, exports) {

    var oauth2 = require('./lib/oauth2').getInstance();
    var util = require('./util');
    var TweetPlugins = require('./tweet_plugin');

    if (!oauth2.hasToken()) {
        window.location.href = chrome.extension.getURL('login.html');
    }

    var router = new Backbone.Router();

    Backbone.install({
        el: '#main'
    }, function(application) {
        var render_tmp  = Backbone.Module.prototype.__render;

        Backbone.Module.prototype.__render = function() {
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


        require('./view_states/index.js')(application, router);
//        require('./view_states/status.js')(application, router);
        require('./view_states/profile.js')(application, router);
        require('./view_states/connect.js')(application, router);

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

        $('body').on('click', '#global-new-tweet-button', function(e) {
            e.stopPropagation();

            var NewTweetModule = require('./modules/new-tweet');
            var newTweetModule = new NewTweetModule();
            newTweetModule.show();
        });

        $('#loading-mask').fadeOut();
    });

});
