define(function(require, exports) {
    var oauth2 = require('./oauth2').getInstance();
    var util = require('./util.js');

    if (!oauth2.hasToken()) {
        window.location.href = chrome.extension.getURL('login.html');
    }

    Backbone.install({
        el: '#page-container'
    }, function(application, routeManager) {
        Handlebars.registerHelper('date_format', util.dateFormat);

        Handlebars.registerPartial('stream-item-vcard', require('./views/stream_item_vcard.tpl'));
        Handlebars.registerPartial('stream-item-tweet-content', require('./views/stream-item-tweet-content.tpl'));
        Handlebars.registerPartial('stream-item-footer', require('./views/stream-item-footer.tpl'));
        Handlebars.registerPartial('profile-stats', require('./views/profile-stats.tpl'));
        Handlebars.registerPartial('stream-item-profile-content', require('./views/stream-item-profile-content.tpl'));


//        routeManager.registerSubViewState(profileFollowingViewState, profileViewState);
//        routeManager.registerSubViewState(profileFollowersViewState, profileViewState);


        application.registerModule(require('./modules/stream-picture.js'));
        application.registerModule(require('./modules/stream-item-tweet.js'));
        application.registerModule(require('./modules/mini_profile.js'));
        application.registerModule(require('./modules/home_timeline.js'));
        application.registerModule(require('./modules/status.js'));
        application.registerModule(require('./modules/stream.js'));
        application.registerModule(require('./modules/user-timeline.js'));
        application.registerModule(require('./modules/relationship-action.js'));
        application.registerModule(require('./modules/profile-card.js'));
        application.registerModule(require('./modules/profile-nav.js'));
        application.registerModule(require('./modules/new-tweet.js'));

        require('./view_states/index.js')(application, routeManager);
        require('./view_states/profile.js')(application, routeManager);

        Backbone.history.start();
        Backbone.history.checkUrl();
    });

});