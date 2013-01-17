<a href="#!/{{user.id}}" class="username">{{user.screen_name}}</a>: <p>{{#tweet_plugins_process text}}{{/tweet_plugins_process}}</p>
{{#if thumbnail_pic}}
    {{#module this name="stream-picture"}}{{/module}}
{{/if}}