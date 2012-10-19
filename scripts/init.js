define(function(require, exports) {
    var oauth2 = require('./oauth2').getInstance();
    var util = require('./util.js');

    if (!oauth2.hasToken()) {
        window.location.href = chrome.extension.getURL('login.html');
    }

    Backbone.install({
        el: '#page-container'
    }, function(application, routeManager) {
        var render_tmp  = Backbone.Module.prototype.render;

        Backbone.Module.prototype.render = function() {
            render_tmp.apply(this, arguments);
            i18nTemplate.process(this.el, chrome.i18n.getMessage);
            return this;
        };

        Handlebars.registerHelper('date_format', util.dateFormat);

        Handlebars.registerPartial('stream-item-vcard', require('./views/stream_item_vcard.tpl'));
        Handlebars.registerPartial('stream-item-tweet-content', require('./views/stream-item-content.tpl'));
        Handlebars.registerPartial('stream-item-footer', require('./views/stream-item-footer.tpl'));
        Handlebars.registerPartial('profile-stats', require('./views/profile-stats.tpl'));
        Handlebars.registerPartial('stream-item-profile-content', require('./views/stream-item-profile-content.tpl'));

        application.registerModule(require('./modules/weibo-emoticons.js'));
        application.registerModule(require('./modules/stream-picture.js'));
        application.registerModule(require('./modules/stream-item.js'));
        application.registerModule(require('./modules/mini-stream-item.js'));
        application.registerModule(require('./modules/mini_profile.js'));
        application.registerModule(require('./modules/home-timeline.js'));
        application.registerModule(require('./modules/status.js'));
        application.registerModule(require('./modules/stream.js'));
        application.registerModule(require('./modules/user-timeline.js'));
        application.registerModule(require('./modules/relationship-action.js'));
        application.registerModule(require('./modules/profile-card.js'));
        application.registerModule(require('./modules/profile-nav.js'));
        application.registerModule(require('./modules/new-tweet.js'));
        application.registerModule(require('./modules/followers.js'));

        require('./view_states/index.js')(application, routeManager);
        require('./view_states/profile.js')(application, routeManager);

        $('#global-new-tweet-button').click(function(e) {
            e.stopPropagation();

            var NewTweetModule = require('./modules/new-tweet');
            var newTweetModule = new NewTweetModule({
                model: new Backbone.Model()
            });
            newTweetModule.show();
        });

        Backbone.history.start();
        Backbone.history.checkUrl();
    });

});