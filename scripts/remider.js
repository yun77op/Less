// Reminder

app.define('app.weibo.reminder', function() {

  var pollingInterval = app.settings.get('general', 'pollingInterval') * 1000,
      tabSelected = true,
      event = new app.EventTarget();

  chrome.tabs.getCurrent(function (tab) {
    var currentTabId = tab.id;
    chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
      tabSelected = currentTabId == tabId;
    });
  });

  // setInterval(fetchUnread, pollingInterval);

  function fetchUnread() {
    //Idle threshold in seconds
    chrome.idle.queryState(30, function (newState) {
      var idle = newState != 'active';
      if (idle || !tabSelected) { return; }
      fetchUnread_();
    });
  }

  function fetchUnread_() {

    app.weibo.request({
      base_url: 'https://rm.api.weibo.com/2/',
      path: 'remind/unread_count.json'
    }, {
      success: function(xhr, ret) {
        var e = new app.Event('remind');

        e.data = ret;
        event.dispatchEvent(e);
      },

      failure: function (xhr, ret) {
        self.pollingInterval *= 2;
      }
    });
  }

  return {
    addEventListener: function(fn) {
      event.addEventListener('remind', fn);
    }
  }

});