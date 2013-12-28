define(function(require, exports) {

    var tpl = require('../views/user.tpl');
    var RelationshipButton = require('./relationship-action');

    var UserModule = Backbone.Module.extend({
        name: 'user',

        tagName: 'li',

        className: 'stream-item',

        template: tpl,

        render: function() {
            UserModule.__super__['render'].apply(this, arguments);
            this.append(RelationshipButton, '.relationship-button-container', {
                following: this.model.get('following'),
                follow_me: this.model.get('follow_me'),
                user_id: this.model.get('id')
            });
            return this;
        },

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
