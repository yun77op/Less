<div class="stream-item-footer {{#if primary}}stream-item-primary-footer{{else}}stream-item-footer-retweet{{/if}}">
    <span class="metadata">
        <a href="#!/{{user.id}}/{{id}}">{{date_format created_at}}</a>
        <span i18n-content="from">from</span> {{{ source }}}
    </span>
    <ul class="actions">
        {{#if primary}}
            {{#if action_del}}
                <li>
                    <a href="#" title="Delete" class="action-del" i18n-values="title:delete">
                        <span class="icon icon-16 icon-del"></span>
                    </a>
                </li>
            {{/if}}
            <li>{{! FIXME: favorited is aways false }}
                    <a href="#" title="Favorite" class="action-favorite{{#if favorited}} favorited{{/if}}" i18n-values="title:favorite">
                            <span class="icon icon-16 icon-favorite"></span>
                    </a>
            </li>
        {{/if}}
        <li>
            <a href="{{#if primary}}#!/{{user.id}}/{{id}}/repost{{else}}#{{/if}}"{{#unless primary}} target="_blank"{{/unless}} title="Repost" class="action-repost" i18n-values="title:repost">
                <span class="icon icon-16 icon-repost"></span>
                {{ reposts_count }}
            </a>
        </li>
        <li>
            <a href="{{#if primary}}#!/{{user.id}}/{{id}}/comment{{else}}#{{/if}}"{{#unless primary}} target="_blank"{{/unless}} title="Comment" class="action-comment" i18n-values="title:comment">
                <span class="icon icon-16 icon-comment"></span>
                {{ comments_count }}
            </a>
        </li>
    </ul>
</div>
