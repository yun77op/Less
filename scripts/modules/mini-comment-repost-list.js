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
            this.currentPage = 1;

        },

        navPrev: function(e) {
            this.renderPage(this.currentPage - 1);
            this.checkNav();
        },

        navNext: function(e) {
            this.renderPage(this.currentPage + 1);
            this.checkNav();
        },

        checkNav: function() {
            this.el.querySelector('.nav-prev').disabled = this.currentPage == 1 ? true : false;
            this.el.querySelector('.nav-next').disabled = this.currentPage == this.totalPage ? true : false;
        },

        setupBody: function(streams) {
            var body_tpl = require('../views/mini-comment-repost-body.tpl');
            var template = Handlebar.compile(body_tpl);
            var html = template({
                streams: streams
            });
            this.$el.find('.body').html(html);
            return this;
        },

        fetch: function(page) {
            this.model.fetch({
                data: {
                    id: this.model.get('id'),
                    page: page,
                    count: this.pageNum
                },
                success: this._fetchCallback.bind(this)
            });
        },

        _fetchCallback: function(resp, status, xhr) {
            var self = this;



//            this.trigger.textContent = data.total_number;

//                this.listViewEl.classList.add('tweet-listView-empty');
//                var handle = this.type.replace(/^(\w)/, function(s0, s1) {
//                    return s1.toUpperCase();
//                });
//                var text = document.createTextNode(chrome.i18n.getMessage('no' + handle));
//                fragment.appendChild(text);
        }
    });

    return MiniCommentRepostListModule;
});