{{#with user}}
    {{> stream-item-vcard}}
{{/with}}
<div class="stream-item-content">
    <div class="tweet">
        <a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{ text }}</p>
				<p class="pull-right">
					<button class="action-reply btn-link" i18n-content="reply">Reply</button>
					<button class="action-del btn-link" i18n-content="delete">Delete</button>
				</p>
				<span class="metadata">
					<a href="#!/{{user.id}}/{{id}}">{{date_format created_at}}</a>
					<span i18n-content="from">from</span> {{{ source }}}
				</span>
    </div>
</div>
