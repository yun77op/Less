define(function (require) {

    var weibo = require('../weibo');
    var tpl = require('../views/stream-item.tpl');

    return Backbone.Module.extend({
        name: 'stream-item',

        className:'stream-item',

        template: tpl,

        events:{
            'click .action-repost':'repost',
            'click .action-comment':'comment',
            'click .action-favorite':'favorite',
            'click .action-del':'del'
        },

        repost:function (e) {
            e.preventDefault();
            this._removeActiveCommentRepostList();

            if (this.activeListName == 'mini-repost-list') {
                this.activeListName = null;
                return;
            }

            var MiniRepostList = require('./mini-repost-list');
            this._setupList(MiniRepostList);
        },

        comment:function (e) {
            e.preventDefault();
            this._removeActiveCommentRepostList();

            if (this.activeListName == 'mini-comment-list') {
                this.activeListName = null;
                return;
            }

            var MiniCommentList = require('./mini-comment-list');
            this._setupList(MiniCommentList);
        },

        _setupList: function(List) {
            var list = new List({
                model: this.model.clone()
            });

            this.append(list, '.stream-item-content > .tweet');
            //list.fetch(1);

            this.activeListName = list.name;
            this.miniCommentRepostList = list;
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
});
