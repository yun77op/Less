define(function(require, exports) {

	var tpl = require('../views/status.tpl');

	return function config(application, routeManager) {

		var StatusViewState = Backbone.ViewState.extend({
			name: 'vs-status',
			path: '!/:userId/:statusId*type',
      el: application.el,
			template: tpl
		});

		routeManager.register(StatusViewState);
	};
});
