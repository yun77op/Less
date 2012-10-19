<div class="stream-item-footer">
    <span class="metadata">
        <a href="#!/statuses/{{id}}">{{#date_format
            created_at}}{{/date_format}}</a>
        <span i18n-content="from">from</span> {{{ source }}} </span>
    <ul class="actions">
        <li>
            <a href="#" title="Repost" class="action-repost" i18n-content="repost" i18n-values="title:repost">
                <span class="icon icon-16 icon-repost"></span>
            </a>
            <a href="#" class="action-show-repostList">{{ reposts_count }}</a>
        </li>
        <li>
            <a href="#" title="Comment" class="action-comment" i18n-content="comment" i18n-values="title:comment">
                <span class="icon icon-16 icon-comment"></span>
            </a>
            <a href="#" class="action-show-commentList">{{ comments_count }}</a>
        </li>
    </ul>
</div>