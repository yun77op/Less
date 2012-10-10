<div class="flex-module clearfix">
    <img src="{{avatar_large}}" class="pull-left avator" alt="{{screen_name}}">
    <div class="profile-card-inner">
        <h1>{{screen_name}}</h1>
        {{#if description}}
            <p class="bio">{{description}}</p>
        {{/if}}
        <p>
            <span class="location">{{location}}</span>
            {{#if url}}
                <span class="divider">.</span>
                <a class="url" href={{url}} target="_blank">{{url}}</a>
            {{/if}}
        </p>
    </div>
    <div class="profile-card-actions">
        {{#module this name="relationship-action"}} {{/module}}
        {{> profile-stats}}
    </div>
</div>