{{#with user}}
    {{> stream-item-vcard}}
{{/with}}
<div class="stream-item-content">
    <div class="tweet">
        <a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{ text }}</p>
        {{#if action_list.reply}}
            <p><button class="action-reply btn-link" i18n-content="reply">Reply</button></p>
        {{/if}}
        {{#if action_list.repost}}
            <p><button class="action-repost btn-link" i18n-content="repost">Repost</button></p>
        {{/if}}
    </div>
</div>
