define(function (require, exports) {

    var tpl = require('../views/stream-picture.tpl');
    var util = require('../util');

    var StreamPictureModule = Backbone.Module.extend({
        name: 'stream-picture',

        className: 'tweet-pic',

        template: tpl,

        initialize: function(options) {
            StreamPictureModule.__super__['initialize'].apply(this, arguments);

            this.widthLimit = 420;
            this.deg = 0;
        },

        events: {
            'click .tweet-pic-thumb img':'show',
            'click .action-collapse':'collapse',
            'click .action-rotate-left':'rotateLeft',
            'click .action-rotate-right':'rotateRight'
        },

        render: function() {
            StreamPictureModule.__super__['render'].apply(this, arguments);

            this.originalEl = this.el.querySelector('.tweet-pic-origin');
            this.originalSrc = this.el.querySelector('.tweet-pic-thumb').getAttribute('data-original');
            this.thumbEl = this.el.querySelector('.tweet-pic-thumb');

            if (this.options.expand) {
                this.show();
                this.el.querySelector('.action-collapse').style.display = 'none';
            } else {
                _.bindAll(this, 'collapse');
                this.$el.on('click', '.tweet-pic-origin img', this.collapse);
                this.$el.on('click', '.tweet-pic-origin canvas', this.collapse);
            }

            return this;
        },

        show:function () {
            if (this.inited) {
                this.expand();
            } else {
                this.load();
            }
        },

        load:function () {
            var throbberEl = this.el.querySelector('.throbber'),
                rect = this.el.querySelector('.tweet-pic-thumb img').getBoundingClientRect();

            throbberEl.style.left = (rect.width / 2 - 8) + 'px';
            throbberEl.style.top = (rect.height / 2 - 8) + 'px';
            throbberEl.style.display = 'block';

            var img = new Image();
            img.onload = this.onLoad.bind(this, img);
            img.src = this.originalSrc;
        },

        onLoad:function (img) {
            this.$el.find('.throbber').remove();
            this.el.querySelector('.action-view-origin').href = this.originalSrc;

            this.inited = true;
            this.expand();
        },

        _show:function () {
            var img = document.createElement('img'), rect;

            img.src = this.originalSrc;
            rect = util.scale(img.width, img.height, this.widthLimit);
            img.width = rect.width;
            img.height = rect.height;

            this.originalEl.style.display = 'block';
            img.style.marginLeft = (this.widthLimit - rect.width) / 2 + 'px';

            this.originalEl.appendChild(img);
        },

        collapse:function () {
            var originalEl = this.originalEl;
            originalEl.removeChild(originalEl.lastChild);
            originalEl.style.display = 'none';
            this.thumbEl.style.display = 'block';
        },

        expand:function () {
            this.thumbEl.style.display = 'none';
            this._show();
        },

        rotateLeft:function (e) {
            e.preventDefault();
            this.deg -= 90;
            this.rotate();
        },

        rotateRight:function (e) {
            e.preventDefault();
            this.deg += 90;
            this.rotate();
        },

        rotate:function () {
            var canvas = this.originalEl.querySelector('canvas'),
                img = document.createElement('img'),
                canvas;

            img.src = this.originalSrc;

            if (!canvas) {
                canvas = document.createElement('canvas');
                this.originalEl.replaceChild(canvas, this.originalEl.querySelector('img'));
            }

            var ctx = canvas.getContext('2d');
            this.deg = this.deg + 360;
            this.deg %= 360;
            var revert,
                imgRect = [img.width, img.height];

            if (this.deg / 90 % 2) {
                revert = true;
                imgRect = [imgRect[1], imgRect[0]];
            }
            var rect = util.scale(imgRect[0], imgRect[1], this.widthLimit);
            var translateData = [];
            switch (this.deg) {
                case 0:
                    translateData[0] = 0;
                    translateData[1] = 0;
                    break;
                case 90:
                    translateData[0] = rect.width;
                    translateData[1] = 0;
                    break;
                case 180:
                    translateData[0] = rect.width;
                    translateData[1] = rect.height;
                    break;
                case 270:
                    translateData[0] = 0;
                    translateData[1] = rect.height;
                    break;
            }
            canvas.width = rect.width;
            canvas.height = rect.height;
            canvas.style.marginLeft = (this.widthLimit - rect.width) / 2 + 'px';
            ctx.save();
            ctx.translate(translateData[0] | 0, translateData[1] | 0);
            if (this.deg > 0) {
                ctx.rotate(Math.PI * (this.deg) / 180);
            }
            if (revert) {
                ctx.drawImage(img, 0, 0, rect.height, rect.width);
            } else {
                ctx.drawImage(img, 0, 0, rect.width, rect.height);
            }

            ctx.restore();
        }
    });

    return StreamPictureModule;
});
