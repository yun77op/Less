define(function (require) {

    var weibo = require('../weibo');
    var tpl = require('../views/stream-item.tpl');

    var StreamItemModule = Backbone.Module.extend({
        name: 'stream-item',

        className:'stream-item',

        template: tpl,

        events:{
            'click .action-repost':'repost',
            'click .action-comment':'comment',
            'click .action-favorite':'favorite',
            'click .action-del':'del',
            'click .action-show-repostList':'toggleRepostList',
            'click .action-show-commentList':'toggleCommentList'
        },

        repost:function (e) {
            e.preventDefault();
            var TweetRepostModule = require('./tweet-repost');

            var tweetRepostModule = new TweetRepostModule({
                model: this.model.clone()
            });

            tweetRepostModule.show();
        },

        comment:function (e) {
            e.preventDefault();
            var TweetCommentModule = require('./tweet-comment');

            var tweetCommentModule = new TweetCommentModule({
                model: this.model.clone()
            });

            tweetCommentModule.show();
        },

        favorite:function (e) {
            e.preventDefault();

            var self = this;
            var currentTarget = e.currentTarget;

            // prevent race
            if (currentTarget.disabled) return;

            var action = currentTarget.classList.contains('favorited') ? 'destroy' : 'create';
            var model = this.model;

            if ($(currentTarget).parents('.retweet').length > 0) {
                model = model[model.key];
            }

            weibo.request({
                method:'POST',
                path:'favorites/' + action + '.json',
                params:{id:model.id}
            }, function () {
                currentTarget.disabled = false;
                currentTarget.classList.toggle('favorited');
                if (self.type == 'favorites') {
                    $(self.el).slideUp(function () {
                        self.remove();
                    });
                }
            });
            currentTarget.disabled = true;
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
        },

        _setupListModule: function(key, target, model) {
            var $target = $(target);
            var MiniCommentRepostListModule = require('./mini-comment-repost-list');
            var miniCommentRepostListModule = new MiniCommentRepostListModule({
                model: model,
                data: {
                    id: this.model.get('id'),
                    count: 10
                },
                key: key
            });

            miniCommentRepostListModule.render().$el.insertAfter($target.parents('.stream-item-footer'));
            miniCommentRepostListModule.fetch(1);

            return miniCommentRepostListModule;
        },

        _removeActiveCommentRepostList: function() {
            var activeListModuleName;

            if (this.miniCommentRepostListModule) {
                activeListModuleName = this.miniCommentRepostListModule.name;
                this.miniCommentRepostListModule.remove();
                this.miniCommentRepostListModule = null;
            }

            return activeListModuleName;
        },

        toggleCommentList:function (e) {
            e.preventDefault();

            var moduleName = 'mini-comment-list';
            var activeListModuleName = this._removeActiveCommentRepostList();

            if (activeListModuleName == moduleName) return;

            var CommentsModel = require('../models/comments');
            var miniCommentRepostListModule = this._setupListModule('comments', e.currentTarget, new CommentsModel());
            miniCommentRepostListModule.name = moduleName;
            this.miniCommentRepostListModule = miniCommentRepostListModule;
        },

        toggleRepostList:function (e) {
            e.preventDefault();

            var moduleName = 'mini-repost-list';
            var activeListModuleName = this._removeActiveCommentRepostList();

            if (activeListModuleName == moduleName) return;

            var RepostsModel = require('../models/reposts');
            var miniCommentRepostListModule = this._setupListModule('reposts', e.currentTarget, new RepostsModel());
            miniCommentRepostListModule.name = moduleName;
            this.miniCommentRepostListModule = miniCommentRepostListModule;
        }
    });

    return StreamItemModule;
});