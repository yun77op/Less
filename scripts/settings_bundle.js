(function() {
	var settings = app.settings;
	var each = Array.prototype.forEach;

	const defaults = {
		general: {
			pollingInterval: 120
		},
		notification: {
			desktop: {
				items: {
					timeline: false,
					comments: true,
					mentions: true
				},
				disappearTimeout: 5
			}
		},
		customize: {
			theme: 'default',
			background: {
				fixed: true,
				repeat: true,
				align: 'left'
			}
		}
	};

	app.ui.decorate('input[pref][type=checkbox]', app.options.PrefCheckbox);
	app.ui.decorate('input[pref][type=number]', app.options.PrefNumber);
	app.ui.decorate('select[pref]', app.options.PrefSelect);

	settings.initialize(defaults);


	var settingsEl = document.getElementById('settings');
	$('#settings-background').delegate('input', 'click', setBackground)
													 .delegate('select', 'change', setBackground);

	document.querySelector('#nav-settings a').onclick = function(e) {
		e.preventDefault();
		settingsEl.classList.add('slideDown');
	};

	function setBackgroundImageData(file) {
		if (!file) { return; }
		var reader = new FileReader();
		reader.onload = function(e) {
			var imageData = event.target.result;    
			localStorage.setItem('settingsBackgroundImageData', imageData);
			setBackground();
		};
		reader.readAsDataURL(file);
	}

	function setBackground() {
		var exp = '';
		if (localStorage.settingsBackgroundImageData) {
			var imageData = localStorage.settingsBackgroundImageData,
					fixed = settings.get('customize.background.fixed'),
					repeat = settings.get('customize.background.repeat'),
					align = settings.get('customize.background.align');
			exp = 'url(' + imageData + ')';
			if (repeat) {
				exp += ' repeat';
			}
			exp += ' ' + align + ' 0';
			if (fixed) {
				exp += ' fixed';
			}
		}
		document.body.style.background = exp;
	}
	
	setBackground();

	document.documentElement.addEventListener('dragenter', function(e) {
		e.preventDefault();
	}, false);
	document.documentElement.addEventListener('dragover', function(e) {
		e.preventDefault();
	}, false)
	document.documentElement.addEventListener('drop', function(e) {
		var file = e.dataTransfer.files[0];
		setBackgroundImageData(file);
	}, false);


	//Customize
	var customizeEl = document.getElementById('customize-container');

	document.querySelector('.customize-button').onclick = function(e) {
		e.preventDefault();
		$(customizeEl).slideDown();;
	};

	customizeEl.querySelector('#customize-background-reset').onclick = function() {
		localStorage.removeItem('settingsBackgroundImageData');
		settings.flatten(defaults.customize.background, 'customize.background', true);
		setBackground();
	};

	customizeEl.querySelector('nav').onclick = function(e) {
		e.preventDefault();
		var a = e.target;
		if (a.tagName != 'A') { return; }
		var content = document.querySelector(a.getAttribute('href'));
		//var parent = content.parentNode;

		each.call(customizeEl.querySelectorAll('.tab-content'), function(el) {
			el.style.display = 'none';
		});

		content.style.display = 'block';
		var li = a.parentNode;
		li.parentNode.querySelector('.selected').classList.remove('selected');
		li.classList.add('selected');
	};
	
	
	customizeEl.querySelector('.close-button-2').onclick = function(e) {
		e.preventDefault();
		$(customizeEl).slideUp();
	};
	
	customizeEl.querySelector('#customize-background-onlineImage').onclick = function(e) {
		e.preventDefault();
		var imgURL = String(this.previousElementSibling.value).trim();
		if (imgURL === '') { return; }
		localStorage.settingsBackgroundImageData = imgURL;
		setBackground();
	};
	
	customizeEl.querySelector('#customize-background-localImage').onclick = function(e) {
		e.preventDefault();
		this.nextElementSibling.click();
	};
	
	customizeEl.querySelector('#customize-background-localFile').onchange = function(e) {
		setBackgroundImageData(this.files[0]);
	};

	function setTheme(name) {
		if (name == settings.get('customize.theme')) { return; }
		var style = document.getElementById('theme-' + name);
		if (style) {
			each.call(document.querySelectorAll('link[rel=stylesheet]'), function(el) {
				if (el.id.match(/^theme/)) {
					el.disabled = true;
				}
			});
			style.disabled = false;
		} else {
			app.util.loadStyle('stylesheets/themes/' + name + '/index.css', 'theme-' + name);
			document.getElementById('theme-' + currentTheme).disabled = true;
		}
		settings.set('customize.theme', name);
	}

	setTheme(settings.get('customize.theme'));
	
	each.call(customizeEl.querySelectorAll('#customize-theme a'), function(el) {
		el.onclick = function(e) {
			e.preventDefault();
			var li = this.parentNode,
					name = this.getAttribute('data-name');
			setTheme(name);
			each.call(li.parentNode.querySelectorAll('.selected'), function(el) {
				el.classList.remove('selected');
			});
			li.classList.add('selected');
		};
	});

	each.call(document.querySelectorAll('#customize-theme li > a'), function(el) {
		if (el.getAttribute('data-name') == settings.get('customize.theme')) {
			el.parentNode.classList.add('selected');
		}
	});

})();