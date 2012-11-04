define(function(require) {
    var tpl = require('../views/mini-comment-repost-list.tpl');

    var MiniCommentRepostListModule = Backbone.Module.extend({
        name: 'mini-comment-repost-list',

        events: {
            'click .nav-prev': 'navPrev',
            'click .nav-next': 'navNext'
        },

        template: tpl,

        initialize: function() {
            MiniCommentRepostListModule.__super__['initialize'].apply(this, arguments);

            this.currentPage = 0;
            this.totalPage = 0;

            // list is shown
            this.active = false;

            _.defaults(this.options.data, { count: 10 });
        },

        navPrev: function() {
            this.fetch(this.currentPage - 1);
        },

        navNext: function() {
            this.fetch(this.currentPage + 1);
        },

        checkNav: function() {
            this.el.querySelector('.nav-prev').disabled = !!(this.currentPage == 1);
            this.el.querySelector('.nav-next').disabled = !!(this.currentPage == this.totalPage);
        },

        _disableNav: function() {
            this.el.querySelector('.nav-prev').disabled = true;
            this.el.querySelector('.nav-next').disabled = true;
        },

        setupBody: function(streams) {
            var coll = new Backbone.Collection(streams);
            var MiniComments = new require('./mini-comment-body');
            var miniComments = new MiniComments({
                model: coll
            });
            this._setBody('');
            this.append(miniComments, '.body');
            return this;
        },

        _setBody: function(html) {
            this.$el.find('.body').html(html);
            return this;
        },

        fetch: function(page) {
            this._disableNav();
            this.active = true;

            var loading_tpl = require('../views/loading.tpl');

            this._setBody(loading_tpl);

            var data = $.extend({}, this.options.data, {
                page: page
            });

            this.model.fetch({
                data: data,
                success: this._fetchCallback.bind(this, page)
            });
        },

        _handleNone: function() {
            this._setBody('<p>Empty!</p>');
        },

        _fetchCallback: function(page) {
            var comments = this.model.get(this.options.key);

            this.currentPage = page;
            this.totalPage = Math.ceil(this.model.get('total_number') / this.options.data.count);

            if (comments.length == 0) {
                this._handleNone();
            } else {
                if (this.currentPage == 1) {
                    this.el.querySelector('nav').classList.remove('hide');
                }
                this.setupBody(comments);
            }

            this.checkNav();

//          this.trigger.textContent = data.total_number;
        }
    });

    return MiniCommentRepostListModule;
});