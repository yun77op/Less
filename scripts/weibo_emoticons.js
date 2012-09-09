(function() {
	var categories = {
		list: [],
		faces: {}
	};

	var current = 1,
			numberPerpage = 4, total;
	var emoticonsEl = document.getElementById('status-emoticons');
	var nav = emoticonsEl.querySelector('#status-emoticons-nav');
	var navPrev = nav.querySelector('.nav-prev');
	var navNext = nav.querySelector('.nav-next');
	var initial = true;
	var initialing = false;

	document.getElementById('status-action-emoticons').onclick = function(e) {
		e.preventDefault();
		e.stopPropagation();
		var emoticonsJq = $(emoticonsEl).toggle();
		if (initial) {
			initializeUI();
			initial = false;
		}
		if (emoticonsJq.is(':visible')) {
			listenBlur();
		}
	};

	function listenBlur() {
		$(document).click(function(e) {
			//TODO closest(emoticonsEl) error
			if ($(e.target).closest('#status-emoticons').length == 0) {
				emoticonsEl.style.display = 'none';
				$(document).unbind(e);
			}
		});
	}

	function initializeUI(callback) {
		app.weibo.emoticons.forEach(function(element) {
			var category = element.category;
			if (!category) {
				category = '默认';
			}

			if (!~categories.list.indexOf(category)) {
				categories.list.push(category);
			}
			if (!categories.faces[category]) {
				categories.faces[category] = [];
			}
			categories.faces[category].push(element);
		});
		total = Math.ceil(categories.list.length / numberPerpage);
		showPage(1);
	}

	if (current != total) {
		navNext.disabled = false;
	}

	navPrev.onclick = function(e) {
		if (this.disabled) { return; }
		showPage(--current);
		if (current == 1) {
			this.disabled = true;
		}
		this.nextElementSibling.disabled = false;
	};

	navNext.onclick = function(e) {
		if (this.disabled) { return; }
		showPage(++current);
		if (current == total) {
			this.disabled = true;
		}
		this.previousElementSibling.disabled = false;
	};
	
	var listEl = emoticonsEl.querySelector('#status-emoticons-list');
	var facesEl = emoticonsEl.querySelector('#status-emoticons-faces');

	$(listEl).delegate('a', 'click', function(e) {
		e.preventDefault();
		Array.prototype.forEach.call(this.parentNode.childNodes, function(element) {
			element.classList.remove('current');
		});
		this.classList.add('current');
		var category = this.getAttribute('category-data');
		makeFaces(category);
	});

	$(facesEl).delegate('li', 'click', appendFace);

	function showPage(page) {
		var list = categories.list.slice((page - 1) * numberPerpage, page * numberPerpage);
		makeList(list);
		makeFaces(list[0]);
	}
	
	function makeList(list) {
		var fragment = document.createDocumentFragment();
		var listItemClone = document.createElement('a');
		listItemClone.href = "#";
		list.forEach(function(category) {
			var listItem = listItemClone.cloneNode();
			listItem.textContent = category;
			listItem.setAttribute('category-data', category);
			fragment.appendChild(listItem);
		});
		fragment.childNodes[0].classList.add('current');
		listEl.innerHTML = '';
		listEl.appendChild(fragment);
	}

	function makeFaces(category) {
		var ul = document.createElement('ul');
		var liClone = document.createElement('li');
		var imgClone = document.createElement('img');
		imgClone.width = '22';
		imgClone.height = '22';
		categories.faces[category].forEach(function(element) {
			var face = liClone.cloneNode();
			var name = element.phrase.slice(1, -1);
			face.title = name;
			face.setAttribute('data-face', element.phrase);
			var img = imgClone.cloneNode();
			img.src = element.icon;
			img.alt = element.phrase;
			face.appendChild(img);
			ul.appendChild(face);
		});
		facesEl.innerHTML = '';
		facesEl.appendChild(ul);
	}

	function appendFace() {
		emoticonsEl.style.display = 'none';
		var textareaEl = document.querySelector('#status textarea');
		var value = textareaEl.value;
		var start = textareaEl.selectionStart;
		var face = this.getAttribute('data-face');
		textareaEl.value = value.slice(0, start) +
				face + value.slice(textareaEl.selectionEnd);
		textareaEl.selectionStart = textareaEl.selectionStart = start + face.length;
	}

})();