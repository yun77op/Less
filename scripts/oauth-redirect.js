chrome.runtime.sendMessage({ hash: location.hash }, function(response) {
    if (response === 0) {
        window.close();
    }
});