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
                var totalPage = this.totalPage = Math.ceil(totalNumber / this.options.data.count);

                if (totalPage > 1) {
                    this.navEl.hidden = false;
                    this.checkNav();
                }
            });

            this.onReady(function() {
                this.navEl = this.el.querySelector('footer .nav');
                this.initTweetModule();
                this.initBody();
            });


            this.on('load', function() {
                this.delegate('mini-stream-item', 'repost', function(text) {
                    var tweetModuleName = this.options.tweetModuleName;
                    this.getChildModuleByName(tweetModuleName)[0].trigger('repost', text);
                }.bind(this));
            }, this);
        },

        navPrev: function() {
            this.fetch(this.currentPage - 1);
        },

        navNext: function() {
            this.fetch(this.currentPage + 1);
        },

        checkNav: function() {
            this.navEl.querySelector('.nav-prev').disabled = !!(this.currentPage == 1);
            this.navEl.querySelector('.nav-next').disabled = !!(this.currentPage == this.totalPage);
        },

        _disableNav: function() {
            _.each(this.navEl.querySelectorAll('button'), function(el) {
                el.disabled = true;
            });
        },

        getBodyModule: function() {
            var data = _.extend({}, this.options.data, {
                page: 1,
                id: this.model.get('id')
            });

            var Reposts = require('../models/reposts');
            var options = {
                model: new Reposts(),
                data: data
            }

            var module = new (require('./mini-repost-body'))(options);

            return {
                main: module,
                args: ['repost']
            }
        },

        initBody: function() {
            var bodyModule = this.getBodyModule()
              , module = bodyModule.main
            this._bodyModuleId = module.id;
            this.append(module, '.body', bodyModule.args);
        },

        initTweetModule: function() {
            var module = Backbone.application.getModuleInstance(this.options.tweetModuleName, {
                model: this.model.clone()
            });

            module.on('connected', function() {
              var bodyModule = this.getChildModuleById(this._bodyModuleId);
              bodyModule.fetch(1);
            }, this);

            this.append(module, '.header');
        },

        fetch: function(page) {
            this._disableNav();
            var bodyModule = this.getChildModuleById(this._bodyModuleId);
            bodyModule.fetch(page);
        }
    });

    return {
        main: MiniRepostList,
        args: {
            tweetModuleName: 'tweet-repost'
        }
    }

});
