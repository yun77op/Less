define(function (require) {
    var TweetBase = require('./tweet');
    var tpl = require('../views/tweet-comment.tpl');

    var TweetPublisherInline = TweetBase.extend({
        className: 'tweet-publisher-inline',

        template: tpl
    });

    return TweetPublisherInline;
});
