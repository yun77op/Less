define(function (require, exports) {

    var each = each = Array.prototype.forEach;
    var weibo = require('../weibo');

    var StreamItemTweetModule = Backbone.Module.extend({
        name: 'stream-item-tweet',

        className:'stream-item',

        template:Handlebars.compile('{{#with user}} {{> stream-item-vcard}} {{/with}} {{> stream-item-tweet-content}}'),

        events:{
            'click .action-repost':'repost',
            'click .action-comment':'comment',
            'click .action-favorite':'favorite',
            'click .action-del':'del',
            'click .action-show-repostList':'repostList',
            'click .action-show-commentList':'commentList'
        },

        repost:function (e) {
            e.preventDefault();
            var options = {
                type:'repost',
                username:this.model.user.name
            };

            if (this.model.retweeted_status) {
                options.comment_ori = true;
                options.ori_username = this.model.retweeted_status.user.name;
                options.text = this.model.text;
            }

            weibo.status.show(options);
        },

        comment:function (e) {
            e.preventDefault();
            var options = {
                type:'comment',
                username:this.model.get('user').name
            };

            if (this.model.retweeted_status) {
                options.comment_ori = true;
                options.ori_username = this.model.retweeted_status.user.name;
            }

            weibo.status.show(options);
        },

        favorite:function (e) {
            e.preventDefault();
<<<<<<< HEAD

            //Prevent race
            if (currentTarget.disabled) return;

            var self = this;
            var currentTarget = e.currentTarget;

            var action = currentTarget.classList.contains('favorited') ? 'destroy' : 'create';
            var model = this.model;

            if ($(currentTarget).parents('.retweet').length > 0) {
                model = model[model.key];
            }

=======
            var self = this;
            var currentTarget = e.currentTarget;
            //Prevent race
            if (currentTarget.disabled) {
                return;
            }
            var action = currentTarget.classList.contains('favorited') ? 'destroy' : 'create';
            var model = this.model;
            if ($(currentTarget).parents('.retweet').length > 0) {
                model = model[model.key];
            }
>>>>>>> origin/master
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

        commentList:function (e) {
            var currentTarget = $(e.currentTarget);
            var name, isRetweet;
            if (currentTarget.parents('.retweet').length > 0) {
                name = 'retweetComments';
                isRetweet = true;
            } else {
                name = 'comments';
            }
            this.setupListView(e, name, 'comments', isRetweet);
        },

        repostList:function (e) {
            var currentTarget = $(e.currentTarget);
            var name, isRetweet;
            if (currentTarget.parents('.retweet').length > 0) {
                name = 'retweetReposts';
                isRetweet = true;
            } else {
                name = 'reposts';
            }
            this.setupListView(e, name, 'reposts', isRetweet);
        },

        setupListView:function (e, name, type, isRetweet) {
            e.preventDefault();
            var currentTarget = e.currentTarget;
            var listViewEl = this.el.querySelector('.tweet-listView');
            var action = type == 'comments' ? 'comments/show' : 'statuses/repost_timeline';
            var model = !isRetweet ? this.model : this.model[this.model.key];
            if (this.currentListViewName == name || listViewEl) {
                listViewEl.parentNode.removeChild(listViewEl);
            }
            if (this.currentListViewName != name) {
                new ListView(this.el, model, action, type, currentTarget).retrievePage(1);
                this.currentListViewName = name;
            } else {
                this.currentListViewName = null;
            }
        }
    });

    return StreamItemTweetModule;
});