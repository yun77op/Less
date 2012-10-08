define(function(require, exports) {

	var tpl = require('../views/status.tpl');

	return function config(routeManager) {

		var StatusView = Backbone.View.extend({
			template: tpl,
			render: function() {
				this.$el.html(this.template(this.model.toJSON()));
				return this;
			}
		});

		var StatusViewState = Backbone.ViewStatus.extend({
			name: 'status',
			path: '!/statuses/:id',
			view: StatusView
		});

		routeManager.register(StatusViewState);
	};
});
