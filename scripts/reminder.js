// Reminder

define(function (require) {

//    var pollingInterval = app.settings.get('general', 'pollingInterval') * 1000;
    var pollingInterval = 120 * 1000;
    var tabSelected = true;
    var weibo = require('./weibo');

    chrome.tabs.getCurrent(function (tab) {
        var currentTabId = tab.id;
        chrome.tabs.onSelectionChanged.addListener(function (tabId, selectInfo) {
            tabSelected = currentTabId == tabId;
        });
    });

    function fetchUnread() {

        weibo.request({
            base_url:'https://rm.api.weibo.com/2/',
            path:'remind/unread_count.json'
        }, {
            success: function (data) {
                var i, val;
                for (i in data) {
                    val = data[i];
                    if (val) Reminder.trigger(i, val);
                }
            },

            failure: function () {
                self.pollingInterval *= 2;
            }
        });
    }

    setInterval(function () {
        //Idle threshold in seconds
        chrome.idle.queryState(30, function (newState) {
            var idle = newState != 'active';
            if (idle || !tabSelected) return;
            fetchUnread();
        });
    }, pollingInterval);



    var Reminder = function() {};

    _.extend(Reminder, Backbone.Events);

    return Reminder;
});