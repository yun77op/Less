(function() {

  seajs.config({
    plugins: ['text']
  }).use('app/dist/init.js', function() {
    seajs.use('less/app/0.0.1/init')
//  }).use('app/src/init.js', function() {
    var settings = app.settings;

    function detectLanguage() {
      var lang = settings.get('general.preferredLanguage');
      if (!lang) {
        lang = navigator.language;
        if (!~['zh-CN', 'zh-TW', 'zh-HK'].indexOf(lang)) {
          lang = 'en-US';
        }
        settings.set('general.preferredLanguage', lang);
      }
      return lang;
    }

    document.querySelector('.navbar .signout-btn').onclick = function() {
      localStorage.clear();
      //app.Settings.cancelPersist = true;
      window.location.href = chrome.extension.getURL('main.html');
    };

    $('#elevator').elevator({
      min: 400,
      fadeSpeed: 500
    });

    i18nTemplate.process(document, chrome.i18n.getMessage);

  });

})();
