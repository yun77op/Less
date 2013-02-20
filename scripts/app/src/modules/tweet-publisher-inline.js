define(function (require) {
    var TweetBase = require('./tweet');
    var tpl = require('../views/tweet-comment.tpl');
    var flexTextarea = require('../flex-textarea');

    var TweetPublisherInline = TweetBase.extend({
        className: 'tweet-publisher-inline',

        template: tpl,

        initialize: function() {
          this.on('load', function() {
            this.flexInstance = flexTextarea(this.el.querySelector('textarea'));
          }, this);

          TweetPublisherInline.__super__.initialize.apply(this, arguments);
        },

        destroy: function() {
          this.flexInstance.destroy()
          TweetPublisherInline.__super__.destroy.apply(this, arguments)
        }
    });

    return TweetPublisherInline;
});
