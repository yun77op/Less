app.define('app.weibo', function() {

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

});
