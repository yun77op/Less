define(function (require) {

    var TweetModalModule = require('./tweet-modal');
    var Message = require('../message');
    var util = require('../util');

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
            var self = this;
            var err;

            if (file.size > 5 * 1024 * 1024) {
                err = new Error(chrome.i18n.getMessage('fileSizeError'));
            }

            if (err) return callback(err);

            this.pic = file;

            readImage(file, function(img) {
                var canvas = self.el.querySelector('.status-pic-canvas');
                var ctx = canvas.getContext('2d');
                var limit = 200;
                var rect = util.scale(img.width, img.height, limit, limit);

                canvas.height = rect.height;
                ctx.clearRect(0, 0, 200, 200);
                ctx.drawImage(img, parseInt((limit - rect.width) / 2), 0, rect.width, rect.height);
                callback(null);
            });
        },

        events: {
            'click .status-pic-del':'del'
        },

        show: function() {
            this.active = true;
            this.$el.show();
        },

        del: function () {
            $(document).trigger('picture:del');
            this.$el.hide();
            this.pic = null;
            this.active = false;
        }
    });

    var NewTweetModule = TweetModalModule.extend({
        events: {
            'click .action-geo':'_toggleGeo',
            'click .pic-action':'_triggerFileChange',
            'change .status-pic-file':'_loadFile',
            'click .topic-action':'_insertTopic'
        },

        initialize: function() {
            var self = this;

            this.model = new Backbone.Model();
            this.model.url = null;
            _.extend(this.events, NewTweetModule.__super__['events']);

            this.model.set({
                title: chrome.i18n.getMessage('statusDefaultTitle'),
                actions_list: {
                    pic: true,
                    geo: true,
                    topic: true
                }
            });

            this._setType('update');
            $(document).on('picture:del', function() {
                self._setType('update');
            });
            NewTweetModule.__super__['initialize'].apply(this, arguments);
        },

        render: function() {
            NewTweetModule.__super__['render'].apply(this, arguments);
            this.picView = new PicView({
                el: this.el.querySelector('#status-pic-dropdown-menu')
            });
            return this;
        },

        _toggleGeo:function (e) {
            e.preventDefault();
            var control = e.currentTarget;
            var text;
            var self = this;

            if (!control.checked) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    self.geo = {
                        lat:position.coords.latitude,
                        long:position.coords.longitude
                    };

                    control.textContent = chrome.i18n.getMessage('disableGeolocation');
                });
                text = 'enableGeolocation';
                control.checked = true;
            } else {
                control.textContent = chrome.i18n.getMessage('enableGeolocation');
                this.geo = null;
                control.checked = false;
            }
        },

        _triggerFileChange:function (e) {
            e.preventDefault();
            if (this.picView.active) return;
            this.el.querySelector('.status-pic-file').click();
        },

        _loadFile:function (e) {
            e.preventDefault();

            var fileEl = e.currentTarget;
            var file = fileEl.files[0];
            var self = this;

            if (!file) return;

            this.submitBtn.disabled = true;
            var message = Message.createMessage({
              text: chrome.i18n.getMessage('generatePreview'),
              autoHide: false
            });
            this._setType('upload');
            this.picView.loadFile(file, function (err) {
                self.picView.show();
                self.indicateCounter();
                message.hide();
            });
        },

        _insertTopic:function (e) {
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
            this.indicateCounter();
        },

        _setType: function(type) {
            this.type = type;
            var map = {
                update: 'statuses/update.json',
                upload: 'statuses/upload.json'
            };
            this.url = map[type];
        },

        getParameters: function() {
            var parameters = _.extend({
                status: this.getTextareaValue()
            }, this.geo);

            if (this.type == 'upload') {
                parameters.pic = this.picView.pic
            }

            return parameters;
        }
    });

    return NewTweetModule;
});
