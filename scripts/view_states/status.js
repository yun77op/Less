define(function(require, exports) {

	var tpl = require('../views/status.tpl');

	return function config(routeManager) {

		var StatusView = Backbone.View.extend({
			template: tpl,
			render: function() {
				$(this.el).html(this.template(this.model.toJSON()));
				return this.template();
			}
		});

		var statusViewState = new Backbone.ViewStatus({
			name: 'status',
			path: '!/statuses/:id',
			view: statusView
		});

		routeManager.register(statusViewState);
	};
});
