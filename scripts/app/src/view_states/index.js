define(function(require, exports) {

    var tpl = require('../views/index.tpl');
    var MiniProfileMod = require('../modules/mini_profile');
    var HomeTimelineMod = require('../modules/home-timeline');

    return function config(application) {
        var IndexViewState = Backbone.Module.extend({
            name: 'index',
            __parseParent: function() {
                return application.el;
            },
            render: function() {
                this.$el.html(tpl);

                this.append(MiniProfileMod, '.dashboard', [{ uid: localStorage.uid }]);

                this.append(HomeTimelineMod, '.content-main');
                return this;
            }
        });

        application.register('', IndexViewState);
    };
});
