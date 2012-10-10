define(function(require, exports) {

    var tpl = require('../views/status_module.tpl');
    var StreamModuleModel = require('../models/stream.js');

    var StatusModule = Backbone.Module.extend({
        name: 'status',

        template: tpl,

        model: new StreamModuleModel({
            _url: 'statuses/show.json'
        }),

        enter: function(id) {
            this.model.set('urlParams', {
                id: id
            });
        },

        render: function() {
            StatusModule.__super__['render'].call(this);
            var picEl = this.el.querySelector('.tweet-pic');
            var self = this;

            if (picEl) {
                new app.weibo.ImageView({
                    el: picEl,
                    expand: true
                });
            }

            $('a[data-toggle="tab"]').on('show', function() {
                self.model.fetch();
            });
        },

        events: {
            'click .action-show-commentList': 'showCommentList'
        },

        showCommentList: function(e) {

        }
    });

    return StatusModule;
});