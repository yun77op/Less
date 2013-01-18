(function() {

  seajs.config({
    base: '/scripts',
    preload: ['seajs/plugin-text']
  }).use('init.js', function() {

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

    $('#global-actions').on('click', 'li', function() {
          var $li = $(this).addClass('active');
          $li.siblings().removeClass('active');
      });

    $('#elevator').elevator({
      min: 400,
      fadeSpeed: 500
    });

    i18nTemplate.process(document, chrome.i18n.getMessage);

  });

})();
