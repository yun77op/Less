app.define('app.weibo', function() {
	var weibo = app.weibo,
		status = weibo.status,
		each = Array.prototype.forEach;


	function ListView(el, model, action, type, trigger) {
		this.type = type;
		this.action = action;
		this.model = model;
		this.initial = true;
		this.countPerPage = 7;
		var count = model[type + '_count'];
		this.totalPage = Math.ceil(count / this.countPerPage);
		var listViewEl = ListView.template.cloneNode(true);
		listViewEl.classList.add(type + '-listView');
		el.querySelector('.column-right').appendChild(listViewEl);
		this.listViewEl = listViewEl;
		this.template = new EJS({element: 'tweet-listView-tmpl'});
		this.trigger = trigger;
		this.setupNav();
	}



	var ListView = Backbone.View.extend({
		template: '<div class="listView"> <div class="loading-area"> <img src="images/loading.gif"><span i18n-content="loading">Loading</span> </div> <div class="listView-container" hidden> <div class="arrow"> <span>◆</span> </div> <div class="listView-content"></div> <nav> <a href="#" class="prev" i18n-content="prev">Prev</a> <a href="#" class="next" i18n-content="next">Next</a> </nav> </div> </div>',
		fetch: function(page) {
			this.listViewEl.style.display = 'block';
			var params = {};
			params.id = this.model.id;
			params.count = this.countPerPage;
			params.page = page;
			app.weibo.request({
				path: this.action + '.json',
				params: params
			}, this.retrieveCallback.bind(this, page));
		},

		retrieveCallback: function(page, xhr, data) {
			if (this.initial) {
				this.listViewEl.querySelector('.loadingArea').style.display = 'none';
				this.listViewEl.querySelector('.tweet-listView-container').style.display = 'block';
				this.initial = false;	
			}

			var self = this;
			this.page = page;
			this.trigger.textContent = data.total_number;

			var contentEl = this.listViewEl.querySelector('.tweet-listView-content'),
					fragment = document.createDocumentFragment(),
					items = data[this.type];
			if (items.length) {
				var ul = document.createElement('ul');
				items.forEach(function(model) {
					//No need to use Backbone.View 
					var li = document.createElement('li');
					li.className = 'listView-item tweet column';
					self.template.update(li, model);
					li.querySelector('.reply').onclick = function(e) {
						e.preventDefault();
						app.weibo.status.type = 'reply';
						model.cid = model.id;
						model.id = self.model.id;
						app.weibo.status.model = model;
						app.weibo.status.show();
					};
					i18nTemplate.process(li, chrome.i18n.getMessage);
					ul.appendChild(li);
				});
				fragment.appendChild(ul);
			} else {
				this.listViewEl.classList.add('tweet-listView-empty');
				var handle = this.type.replace(/^(\w)/, function(s0, s1) {
					return s1.toUpperCase();
				});
				var text = document.createTextNode(chrome.i18n.getMessage('no' + handle));
				fragment.appendChild(text);
			}
			contentEl.innerHTML = '';
			contentEl.appendChild(fragment);
		},

		setupNav: function() {
			var self = this;
			var prevEl = this.listViewEl.querySelector('.prev');
			var nextEl = this.listViewEl.querySelector('.next');
			prevEl.setAttribute('disabled', 'true');
			if (this.totalPage == 0 || this.totalPage == 1) {
				nextEl.setAttribute('disabled', 'true');
			}
			prevEl.onclick = function(e) {
				e.preventDefault();
				if (this.disabled) { return; }
				var page = self.page - 1;
				self.fetch(page);
				if (page == 1) {
					this.setAttribute('disabled', 'true');
				}
				this.nextElementSibling.setAttribute('disabled', 'false');
			};

			nextEl.onclick = function(e) {
				e.preventDefault();
				if (this.disabled) { return; }
				var page = self.page + 1;
				self.fetch(page);
				if (page == self.totalPage) {
					this.setAttribute('disabled', 'true');
				}
				this.previousElementSibling.setAttribute('disabled', 'false');
			};
		}
	});

		


	
	var StreamItemProfileView = Backbone.View.extend({
		className: 'stream-item stream-item-profile',
	    	template: Handlebars.compile('  {{> stream-item-vcard}} {{> stream-item-profile-content}} '),
		events: {
			'click .follow': 'follow',
			'click .directMessage': 'directMessage'
		},

		render: function() {
			this.$el.html(this.template(this.model));
			return this;
		},

		follow: function(e) {
			e.preventDefault();
			var target = e.target;
			if (target.disabled) return;
			target.disabled = true;
			var followed = target.classList.contains('followed');
			var action =  followed ? 'destroy' : 'create';
			app.weibo.request('POST', 'friendships/'+ action, {uid: this.model.id}, function() {
				app.message.show(chrome.i18n.getMessage(handle + 'Success'), true);
				target.disabled = false;
				target.classList.toggle('followed');
				var handle = followed ? 'follow' : 'unfollow';
				target.textContent = chrome.i18n.getMessage(handle);
			});
		},

		directMessage: function(e) {
			e.preventDefault();
			app.weibo.status.type = 'directMessage';
			app.weibo.status.model = this.model;
			app.weibo.status.show();
		}
	});
	

	return {
		StreamItemProfileView: StreamItemProfileView
	};

});
