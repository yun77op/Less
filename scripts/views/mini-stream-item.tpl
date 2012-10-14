{{#with user}}
    {{> stream-item-vcard}}
{{/with}}
<div class="stream-item-content">
    <div class="tweet">
        <a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{ text }}</p>
    </div>
</div>