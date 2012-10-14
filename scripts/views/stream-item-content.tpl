<div class="stream-item-content">
    <div class="tweet">
        <a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{ text }}</p>
        {{#if thumbnail_pic}}
            {{#module this name="stream-picture"}}{{/module}}
        {{/if}}
        {{#if retweeted_status}}
            {{#with retweeted_status}} {{> stream-item-tweet-content}} {{/with}}
        {{/if}}
        {{> stream-item-footer}}
    </div>
</div>