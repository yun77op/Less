define(function(require, exports) {

    var tpl = require('../views/status_module.tpl');
    var StreamModel = require('../models/stream.js');
    var StatusModel = StreamModel.extend({
        url: 'statuses/show.json'
    })

    var StatusModule = Backbone.Module.extend({
        name: 'status',

        template: tpl,

        initialize: function() {
          StatusModule.__super__.initialize.apply(this, arguments)

          this.model = new StatusModel();

          this.onReady(function() {
              var self = this
                , picEl = this.el.querySelector('.tweet-pic');

              if (picEl) {
                  new app.weibo.ImageView({
                      el: picEl,
                      expand: true
                  });
              }

              $('a[data-toggle="tab"]').on('show', function() {
                var type = $(this).data('type')
                  , listModule = self.getChildModuleByName('mini-' + type + '-list')[0]
                listModule.refresh()
              });

              $('a[href="#' + self.type + 's"]').tab('show');
          })
        },

        beforeEnter: function(userId, statusId, type) {
            this.options.data = {
              id: statusId
            }

            this.type = type ? type.slice(1) : 'repost';
            this.setChildConfig('mini-' + this.type + '-list', {
              render: true
            });
        }
    });

    return {
      main: StatusModule,
      childConfig: {
        'mini-repost-list': {
          render: false
        },
        'mini-comment-list': {
          render: false
        },
        'stream-picture': {
          expand: true
        }
      }
    }
});
