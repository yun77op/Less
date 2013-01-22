{{#with user}}
    {{> stream-item-vcard}}
{{/with}}
<div class="stream-item-content">
    <div class="tweet">
        {{> stream-item-tweet-content}}
        {{#if retweeted_status}}
            {{#with retweeted_status}}
                <div class="tweet">
                    {{> stream-item-tweet-content}}
                    {{> stream-item-footer}}
                </div>
            {{/with}}
        {{/if}}
        {{> stream-item-footer}}
    </div>
</div>
