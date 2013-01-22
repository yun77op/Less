define(function (require) {

    var weibo = require('../weibo');
    var tpl = require('../views/stream-item.tpl');

    var StreamItem = Backbone.Module.extend({
        name: 'stream-item',

        className:'stream-item',

        template: tpl,

        events:{
            'click .stream-item-footer .action-repost':'repost',
            'click .stream-item-footer .action-comment':'comment',
            'click .stream-item-footer .action-favorite':'favorite',
            'click .stream-item-footer .action-del':'del'
        },

        initialize: function() {
          var user = JSON.parse(localStorage.getItem('user'));
          if (user.id == this.model.get('user').id) {
            this.model.set({ action_del: true });
          }

          this.model.set({ fav_del: true});

          StreamItem.__super__['initialize'].apply(this, arguments);
        },

        repost:function (e) {
            e.preventDefault();
            this._removeActiveCommentRepostList();

            if (this.activeListName == 'mini-repost-list') {
                this.activeListName = null;
                return;
            }

            this._setupList('mini-repost-list');
        },

        comment:function (e) {
            e.preventDefault();
            this._removeActiveCommentRepostList();

            if (this.activeListName == 'mini-comment-list') {
                this.activeListName = null;
                return;
            }

            this._setupList('mini-comment-list');
        },

        _setupList: function(moduleName) {
            var module = Backbone.application.getModuleInstance(moduleName, {
                model: this.model.clone()
            });
            this.append(module, '.stream-item-content > .tweet');

            this.activeListName = module.name;
            this.miniCommentRepostList = module;
        },

        _removeActiveCommentRepostList: function() {
            if (this.miniCommentRepostList) {
                this.miniCommentRepostList.remove();
                this.miniCommentRepostList = null;
            }
        },

        favorite:function (e) {
            e.preventDefault();

            var self = this;
            var currentTarget = e.currentTarget;

            // prevent race
            if (currentTarget.disabled) return;

            currentTarget.disabled = true;

            var action = currentTarget.classList.contains('favorited') ? 'destroy' : 'create';
            var id = this.model.get('id');

            weibo.request({
                method:'POST',
                path:'favorites/' + action + '.json',
                params:{ id: id }
            }, function () {
                currentTarget.disabled = false;
                currentTarget.classList.toggle('favorited');
//                    $(self.el).slideUp(function () {
//                        self.remove();
//                    });
            });
        },

        del:function (e) {
            e.preventDefault();
            var self = this;
            weibo.request({
                method:'POST',
                path:this.type + '/destroy.json',
                params:{id:this.model.id}
            }, function () {
                $(self.el).slideUp(function () {
                    self.remove();
                });
            });
        }

    });

    return StreamItem;
});
