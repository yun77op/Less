define(function(require) {
    var tpl = require('../views/mini-repost-list.tpl');
    var TweetRepost = require('./tweet-repost');
    var MiniRepostBody = require('./mini-repost-body');

    var MiniRepostList = Backbone.Module.extend({
        name: 'mini-repost-list',

        events: {
            'click .nav-prev': 'navPrev',
            'click .nav-next': 'navNext'
        },

        template: tpl,

        initialize: function() {
            MiniRepostList.__super__['initialize'].apply(this, arguments);

            this.__textModule = TweetRepost;
            this.__bodyModule = MiniRepostBody;

            this.options.data = _.defaults({}, this.options.data, {
                count: 10
            });
            this.currentPage = 0;
            this.totalPage = 0;
        },

        render: function() {
            this.$el.html(tpl);
            this.navEl = this.el.querySelector('footer .nav');
            this.initBody();
            var model = this.model.clone();
            model.url = null;
            this.append(this.__textModule, '.header', { model: model });
        },

        navPrev: function() {
            this.fetch(this.currentPage - 1);
        },

        navNext: function() {
            this.fetch(this.currentPage + 1);
        },

        checkNav: function() {
            this.navEl.querySelector('.nav-prev').disabled = this.currentPage == 1;
            this.navEl.querySelector('.nav-next').disabled = this.currentPage == this.totalPage;
        },

        _disableNav: function() {
            _.each(this.navEl.querySelectorAll('button'), function(el) {
                el.disabled = true;
            });
        },

        getBodyModule: function(selector) {
            var data = _.extend({}, this.options.data, {
                page: 1,
                id: this.model.get('id')
            });

            var options = {
                data: data
            };

            return this.append(this.__bodyModule, selector, options);
        },

        initBody: function() {
            var mod = this.getBodyModule('.body');
            mod.on('fetch', function(page, totalNumber) {
                this.currentPage = page;
                var totalPage = this.totalPage = Math.ceil(totalNumber / this.options.data.count);

                if (totalPage > 1) {
                    this.navEl.hidden = false;
                    this.checkNav();
                }
            }.bind(this));
            this.__bodyMod = mod;
        },

        fetch: function(page) {
            this._disableNav();
            this.__bodyMod.fetch(page);
        }
    });

    return MiniRepostList;
});
