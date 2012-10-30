define(function(require, exports) {

    var tpl = require('../views/user.tpl');

    var UserModule = Backbone.Module.extend({
        name: 'user',

        tagName: 'li',

        className: 'stream-item user',

        syncOnStart: false,

        template: tpl,

        follow: function(e) {
            e.preventDefault();
            var target = e.target;
            if (target.disabled) return;
            target.disabled = true;
            var followed = target.classList.contains('followed');
            var action =  followed ? 'destroy' : 'create';
            app.weibo.request('POST', 'friendships/'+ action, {uid: this.model.id}, function() {
                app.message.show(chrome.i18n.getMessage(handle + 'Success'), true);
                target.disabled = false;
                target.classList.toggle('followed');
                var handle = followed ? 'follow' : 'unfollow';
                target.textContent = chrome.i18n.getMessage(handle);
            });
        }
    });

    return UserModule;
});