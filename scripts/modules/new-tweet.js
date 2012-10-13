define(function (require) {

    function readImage(file, callback) {
        var readerDataURL = new FileReader();

        readerDataURL.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                callback && callback(img);
            };
            img.src = e.target.result;
        };

        readerDataURL.readAsDataURL(file);
    }


    var PicView = Backbone.View.extend({
        loadFile:function (file, callback) {
            var size = file.size,
                self = this,
                err;

            if (size > 5 * 1024 * 1024) {
                err = new Error(chrome.i18n.getMessage('fileSizeError'));
            }

            if (err) {
                return callback(err);
            }

            this.imageFile = file;

            readImage(file, function(img) {
                var canvas = self.el.querySelector('.status-pic-canvas'),
                    ctx = canvas.getContext('2d'), limit = 200,
                    rect = util.scale(img.width, img.height, limit, limit);

                canvas.height = rect.height;
                ctx.clearRect(0, 0, 200, 200);
                ctx.drawImage(img, parseInt((limit - rect.width) / 2), 0, rect.width, rect.height);
                callback(null);
            });
        },

        events:{
            'click .status-pic-del':'del'
        },

        del:function () {
            this.imageFile = null;
            this.$el.hide();
        }
    });

    var TweetModalModule = require('./tweet-modal');

    TweetModalModule.extend({
        events: {
            'change .geo-control':'enableGeo',
            'click .pic-action':'triggerFileChange',
            'change .status-pic-file':'loadFile',
            'click .topic-action':'insertTopic'
        },

        initialize: function() {
            _.extend(this.events, TweetModalModule.__super__['events']);
            this.model.set({
                title: chrome.i18n.getMessage('statusDefaultTitle'),
                actions_list: {
                    picture: true,
                    geo: true,
                    topic: true
                }
            });
            TweetModalModule.__super__['initialize'].apply(this, arguments);
        },

        render: function() {
            TweetModalModule.__super__['render'].call(this);
            this.picView = new PicView({
                el: this.el.querySelector('#status-pic-dropdown-menu')
            });
            return this;
        },

        enableGeo:function (e) {
            e.preventDefault();
            var control = e.currentTarget;
            var self = this;

            if (control.checked) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    self.geo = {
                        lat:position.coords.latitude,
                        long:position.coords.longitude
                    }
                });
            } else {
                this.geo = null;
            }
        },

        _triggerFileChange:function (e) {
            e.preventDefault();
            this.el.querySelector('.status-pic-file').click();
        },

        loadFile:function (e) {
            e.preventDefault();

            var fileEl = e.currentTarget;
            var file = fileEl.files[0];
            var self = this;

            if (!file) return;

            this.submitBtn.disabled = true;
            Message.show(chrome.i18n.getMessage('generatePreview'));
            this.type = 'upload';
            this.picView.loadFile(file, function (err) {
                if (err) return;

                self.picView.$el.show();
                self.submitBtn.disabled = false;
            });
        },

        insertTopic:function (e) {
            e.preventDefault();

            var text = chrome.i18n.getMessage('topicMessage');
            var textarea = this.el.querySelector('.status-editor');
            var delimeter = '#';
            var textFormatted = delimeter + text + delimeter;
            var value = textarea.value;
            var index = value.indexOf(textFormatted);

            if (~index) {
                textarea.selectionStart = index + 1;
                textarea.selectionEnd = index + textFormatted.length - 1;
            } else {
                var start = textarea.selectionStart;
                var end = textarea.selectionEnd;
                if (start != end) {
                    value = value.slice(0, start) +
                        delimeter + value.slice(start, end)
                        + delimeter + value.slice(end);
                    textarea.value = value;
                    textarea.selectionStart = start + 1;
                    textarea.selectionEnd = end + 1;
                } else {
                    value = value.slice(0, start) + textFormatted + value.slice(end);
                    textarea.value = value;
                    textarea.selectionStart = start + 1;
                    textarea.selectionEnd = start + text.length + 1;
                }
            }
            textarea.focus();
            this.indicateCouter();
        }
    });

    return TweetModalModule;
});