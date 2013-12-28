define(function (require) {

    var weibo = require('../weibo');
    var tpl = require('../views/stream-item.tpl');
    var userID = JSON.parse(localStorage.getItem('uid'));
    var RepostList = require('./mini-repost-list');
    var CommentList = require('./mini-comment-list');
    var StreamPicture = require('./stream-picture');

    var StreamItem = Backbone.Module.extend({
        name: 'stream-item',

        className:'stream-item',

        template: tpl,

        events:{
            'click .stream-item-primary-footer .action-repost':'repost',
            'click .stream-item-primary-footer .action-comment':'comment',
            'click .stream-item-primary-footer .action-favorite':'favorite',
            'click .stream-item-primary-footer .action-del':'del',
            'click .stream-item-footer-retweet .action-repost': 'viewRetweetRepost',
            'click .stream-item-footer-retweet .action-comment': 'viewRetweetComment'
        },

        initialize: function() {
          if (userID == this.model.get('user').id) {
            this.model.set({ action_del: true });
          }

          this.model.set({ primary: true });

          StreamItem.__super__['initialize'].apply(this, arguments);
        },

        __getRetweetMid: function() {
            var dtd = $.Deferred();
            var self = this;
            weibo.request({
                path: 'statuses/querymid.json',
                params: {
                    type: 1,
                    id: this.model.get('retweeted_status').id
                }
            }, {
                success: function(resp) {
                    dtd.resolveWith(this, [resp.mid]);
                }
            });

            return dtd;
        },

        __viewRetweet: function(e, type) {
            var self = this;
            if (typeof this.__retweetedMid != 'undefined') return;
            e.preventDefault();
            var node = e.target;
            this.__getRetweetMid().
                done(function(mid) {
                    self.__retweetedMid = mid;
                    node.href = 'http://weibo.com/' + self.model.get('retweeted_status').user.id + '/' + self.__retweetedMid;
                    node.click();
                });
        },

        viewRetweetComment: function(e) {
            this.__viewRetweet(e, 'comment');
        },

        viewRetweetRepost: function(e) {
            this.__viewRetweet(e, 'repost');
        },

        render: function() {
            StreamItem.__super__.render.apply(this, arguments);
            if (this.model.get('thumbnail_pic')) {
                var model = this.model.clone();
                model.url = null;
                this.append(StreamPicture, '.thumbnail_pic-container', { model: model });
            }
        },

        repost:function (e) {
            e.preventDefault();
            this._removeActiveCommentRepostList();

            if (this.activeListName == 'mini-repost-list') {
                this.activeListName = null;
                return;
            }

            this._setupList(RepostList);
        },

        comment:function (e) {
            e.preventDefault();
            this._removeActiveCommentRepostList();

            if (this.activeListName == 'mini-comment-list') {
                this.activeListName = null;
                return;
            }

            this._setupList(CommentList);
        },

        _setupList: function(List) {
            var model = this.model.clone();
            model.url = null;
            var mod = this.append(List, '.stream-item-content > .tweet', { model: model });
            mod.__enter();

            this.activeListName = mod.name;
            this.miniCommentRepostList = mod;
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
