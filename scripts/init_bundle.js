(function() {
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

	document.querySelector('.navbar .signout-button').onclick = function() {
		localStorage.clear();
		app.Settings.cancelPersist = true;
		window.location.href = chrome.extension.getURL('main.html');
	};

	_.each(document.querySelectorAll('.panel'), function(panel) {
		panel.querySelector('.close-button').onclick = function(e) {
			e.preventDefault();
			panel.classList.remove('slideDown');
		};
	});

	$('#elevator').elevator({
		min: 400,
		fadeSpeed: 500
	});

	i18nTemplate.process(document, chrome.i18n.getMessage);
})();