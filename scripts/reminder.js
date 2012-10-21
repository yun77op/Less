// Reminder

define(function (require) {

//    var pollingInterval = app.settings.get('general', 'pollingInterval') * 1000;
    var tabSelected = true;
    var weibo = require('./weibo');

    chrome.tabs.getCurrent(function (tab) {
        var currentTabId = tab.id;
        chrome.tabs.onSelectionChanged.addListener(function (tabId, selectInfo) {
            tabSelected = currentTabId == tabId;
        });
    });

    function fetchUnread_() {

        weibo.request({
            base_url:'https://rm.api.weibo.com/2/',
            path:'remind/unread_count.json'
        }, {
            success:function (xhr, data) {
                var i, val;
                for (i in data) {
                    val = data[i];
                    if (val) Reminder.trigger(i, val);
                }
            },

            failure:function (xhr, ret) {
                self.pollingInterval *= 2;
            }
        });
    }

    // setInterval(fetchUnread, pollingInterval);

    function fetchUnread() {
        //Idle threshold in seconds
        chrome.idle.queryState(30, function (newState) {
            var idle = newState != 'active';
            if (idle || !tabSelected) return;
            fetchUnread_();
        });
    }

    var Reminder = function() {};

    _.extend(Reminder, Backbone.Events);

    return Reminder;
});