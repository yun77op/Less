<div class="stream-item-footer">
    <span class="metadata">
        <a href="#!/{{user.id}}/{{id}}">{{date_format created_at}}</a>
        <span i18n-content="from">from</span> {{{ source }}}
    </span>
    <ul class="actions">
				{{#if action_del}}
            <a href="#" title="Delete" class="action-del" i18n-values="title:delete">
                <span class="icon icon-16 icon-del"></span>
            </a>
				{{/if}}
				{{#if fav_del}}
					<li>{{! FIXME: favorited is aways false }}
							<a href="#" title="Favorite" class="action-favorite{{#if favorited}} favorited{{/if}}" i18n-values="title:favorite">
									<span class="icon icon-16 icon-favorite"></span>
							</a>
					</li>
				{{/if}}
        <li>
            <a href="#!/{{user.id}}/{{id}}/repost" title="Repost" class="action-repost" i18n-values="title:repost">
                <span class="icon icon-16 icon-repost"></span>
                {{ reposts_count }}
            </a>
        </li>
        <li>
            <a href="#!/{{user.id}}/{{id}}/comment" title="Comment" class="action-comment" i18n-values="title:comment">
                <span class="icon icon-16 icon-comment"></span>
                {{ comments_count }}
            </a>
        </li>
    </ul>
</div>
