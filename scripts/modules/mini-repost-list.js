define(function(require) {
    var tpl = require('../views/mini-repost-list.tpl');

    var MiniRepostList = Backbone.Module.extend({
        name: 'mini-repost-list',

        events: {
            'click .nav-prev': 'navPrev',
            'click .nav-next': 'navNext'
        },

        template: tpl,

        initialize: function() {
            MiniRepostList.__super__['initialize'].apply(this, arguments);

            this.options.data = _.defaults({}, this.options.data, {
                count: 10
            });
            this.currentPage = 0;
            this.totalPage = 0;

            this.on('fetch', function(page, totalNumber) {
                this.currentPage = page;
                this.checkNav();
                if (this.currentPage == 1) {
                    this.el.querySelector('nav').classList.remove('hide');
                }
                this.totalPage = Math.ceil(totalNumber / this.options.data.count);
            });
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

        _setBody: function(html) {
            this.$el.find('.body').html(html);
            return this;
        },

        fetch: function(page) {
            this._disableNav();

			var previousMiniReposts = this.getChildModule('mini-repost-body');
			previousMiniReposts && previousMiniReposts.destroy();

            var data = _.extend({}, this.options.data, {
				page: page,
                id: this.model.get('id')
            });

            var MiniReposts = new require('./mini-repost-body');
            var Reposts = require('../models/reposts');
            var miniReposts = new MiniReposts({
                model: new Reposts(),
                data: data
            });
            this.append(miniReposts, '.body');
        }
    });

    return MiniRepostList;
});
