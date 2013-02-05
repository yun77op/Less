define(function (require) {

    var tpl = require('../views/weibo-emoticons.tpl');
    var StreamModel = require('../models/stream.js');

    var EmotionsModel = StreamModel.extend({
        url: 'emotions.json',
        storeID: 'emotions'
    });

    var EmoticonsModule = Backbone.Module.extend({
        name: 'weibo-emoticons',

        tagName: 'span',

        className: 'dropdown',

        template: tpl,

        model: new EmotionsModel(),

        initialize: function() {
            EmoticonsModule.__super__['initialize'].apply(this, arguments);
            this.initialized = false;
            this.pageNum = 5;
            this.currentPage = 1;

            this.onReady(function() {
                var self = this;

                if (this.initialized) return;

                this.model.fetch({
                    success: function() {
                        self.initialized = true;
                        self.initializeUI();
                    }
                });
            })

        },

        events: {
            'click .emoticons-body img': 'appendFace',
            'click .nav-prev': 'navPrev',
            'click .nav-next': 'navNext',
            'click .emoticons-category-list a': 'showEmoticonsByCategory'
        },

        initializeUI: function() {
            var emoticons = {};

            _.each(this.model.attributes, function(elm, i) {
                if (i != parseInt(i)) return;

                var category = elm.category || '默认';

                if (!emoticons[category]) {
                    emoticons[category] = [];
                }

                emoticons[category].push(elm);
            });

            var categories = _.keys(emoticons);

            this.model.set({
                emoticons: emoticons,
                categories: categories
            });

            this.setupNav();
        },

        setupFaces: function(category) {
            var body_tpl = require('../views/weibo-emoticons-body.tpl');
            var template = Handlebars.compile(body_tpl);
            var emoticons = this.model.get('emoticons')[category];
            emoticons = emoticons.map(function(elm, i) {
                elm.title = elm.phrase.slice(1, -1);
                return elm;
            });
            var html = template({
                emoticons: emoticons
            });
            this.$el.find('.emoticons-body').html(html);
        },

        setupNav: function() {
            var categories = this.model.get('categories');
            var totalPage = Math.ceil(categories.length / this.pageNum);

            this.totalPage = totalPage;
            this.renderNav(1);
            this.checkNav();
        },

        checkNav: function() {
            this.el.querySelector('.nav-prev').disabled = this.currentPage == 1 ? true : false;
            this.el.querySelector('.nav-next').disabled = this.currentPage == this.totalPage ? true : false;
        },

        appendFace: function(e) {
            var imgEl = e.currentTarget;
            var textarea = document.querySelector('.status-editor');
            var value = textarea.value;
            var start = textarea.selectionStart;
            var emoticon = imgEl.getAttribute('data-emoticon');
            textarea.value = value.slice(0, start) +
                emoticon + value.slice(textarea.selectionEnd);
            textarea.selectionStart = textarea.selectionStart = start + emoticon.length;
        },

        renderNav: function(page) {
            var nav_tpl = require('../views/weibo-emoticons-nav.tpl');
            var template = Handlebars.compile(nav_tpl);

            var categories = this.model.get('categories');
            var list = categories.slice((page - 1) * this.pageNum, page * this.pageNum);

            var html = template({
                categories: list
            });
            this.$el.find('.emoticons-category-list').html(html);
            this.setupFaces(list[0]);
            this.el.querySelector('.emoticons-category-list li:first-child').classList.add('active');
            this.currentPage = page;
        },

        navPrev: function(e) {
            e.stopPropagation();
            this.renderNav(this.currentPage - 1);
            this.checkNav();
        },

        navNext: function(e) {
            e.stopPropagation();
            this.renderNav(this.currentPage + 1);
            this.checkNav();
        },

        showEmoticonsByCategory: function(e) {
            e.preventDefault();
            e.stopPropagation();

            this.el.querySelector('.emoticons-category-list .active').classList.remove('active');
            var target = e.currentTarget;
            target.parentNode.classList.add('active');

            var category = target.getAttribute('data-category');
            this.setupFaces(category);
        }
    });

    return EmoticonsModule;
});
