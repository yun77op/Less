define(function (require, exports) {

    var tpl = require('../views/tweet-modal.tpl');
    var weibo = require('../weibo');
    var Message = require('../Message')('top');
    var util = require('../util');

    var TweetModalModule = Backbone.Module.extend({
        name:'tweet-modal',

        className: 'modal hide',

        id: 'status-modal',

        template: tpl,

        initialize:function () {
            NewTweetModule.__super__['initialize'].call(this);

            var self = this;

            this.$el.on('hidden', function () {
                self.remove();
            });
        },

        render: function () {
            NewTweetModule.__super__['render'].call(this);
            this.submitBtn = this.el.querySelector('.status-submit-btn');
            return this;
        },

        show:function (options) {
            this.render().$el.appendTo('body');
            var textareaValue = this.getTextareaValue && this.getTextareaValue() || '';
            this.el.querySelector('.status-editor').value = textareaValue;
            this.$el.modal('show');
        },

        events:{
            'click .status-submit-btn':'connect',
            'keyup .status-editor':'indicateCounter'
        },

        connect:function () {
            var textarea = this.el.querySelector('.status-editor');
            var text = String(textarea.value).trim();

            if (text === '') {
                textarea.focus();
                return Message.show(chrome.i18n.getMessage('fieldEmpty'), true);
            }

            var params = {}, self = this, path;

            switch (this.type) {
                case 'upload':
                    path = 'statuses/upload.json';
                    params.status = text;
                    params.imageFile = this.picView.imageFile;
                    $.extend(params, this.geo);
                    break;
                case 'update':
                    path = 'statuses/update.json';
                    params.status = text;
                    $.extend(params, this.geo);
                    break;
                case 'repost':
                    path = 'statuses/repost.json';
                    params.status = text;
                    params.id = this.model.id;
                    var is_comment = 0;
                    is_comment += el.querySelector('#status-comment').checked ? 1 : 0;
                    is_comment += el.querySelector('#status-commentOrigin').checked ? 2 : 0;
                    params.is_comment = is_comment;
                    break;
                case 'comment':
                    path = 'comments/create.json';
                    params.id = this.model.id;
                    if (this.model.retweeted_status) {
                        params.comment_ori = el.querySelector('#status-commentOrigin').checked ? 1 : 0;
                    }
                    params.comment = text;
                    break;
                case 'reply':
                    path = 'comments/reply.json';
                    params.comment = text;
                    params.cid = this.model.cid;
                    params.id = this.model.id;
                    params.without_mention = '0'; //TODO
            }

            Message.show(chrome.i18n.getMessage('loading'));
            weibo.request({
                method:'POST',
                path:path,
                params:params
            }, function () {
                self.$el.modal('hide');
                Message.show('Success', true);
            });
        },

        indicateCounter:function () {
            var textarea = this.el.querySelector('.status-editor');
            var counterEl = this.el.querySelector('.status-counter');
            var submitBtn = this.submitBtn;

            var text = textarea.value;
            var textTrimmedLen = text.trim().length;

            var result = text.match(/[^\x00-\xff]/g);
            var counter = text.length + result && result.length || 0;
            counter = Math.ceil(counter / 2);
            var limit = 140;
            var diff = limit - counter;

            counterEl.textContent = diff;

            if (diff < 0 || !textTrimmedLen) {
                submitBtn.disabled = true;
                submitBtn.classList.remove('btn-primary');
            } else {
                submitBtn.disabled = false;
                submitBtn.classList.add('btn-primary');
            }

            counterEl.classList[diff < 0 ? 'add' : 'remove']('danger');
        }
    });

    return TweetModalModule;
});