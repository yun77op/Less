define(function (require) {

    var weibo = require('../weibo');
    var tpl = require('../views/stream-item.tpl');
    var userID = JSON.parse(localStorage.getItem('uid'));

    var StreamItem = Backbone.Module.extend({
        name: 'stream-item',

        className:'stream-item',

        template: tpl,

        events:{
            'click .stream-item-primary-footer .action-repost':'repost',
            'click .stream-item-primary-footer .action-comment':'comment',
            'click .stream-item-primary-footer .action-favorite':'favorite',
            'click .stream-item-primary-footer .action-del':'del'
        },

        initialize: function() {
          if (userID == this.model.get('user').id) {
            this.model.set({ action_del: true });
          }

          this.model.set({ action_fav: true });

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
                this.miniCommentRepostList.destroy();
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
            });
        },

        del:function (e) {
            e.preventDefault();
            var self = this;
            weibo.request({
                method:'POST',
                path: 'statuses/destroy.json',
                params:{ id: this.model.get('id') }
            }, function() {
                self.$el.slideUp(function () {
                    self.destroy();
                });
            });
        }

    });

    return StreamItem;
});
