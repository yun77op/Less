<div class="flex-module clearfix">
    <img src="{{avatar_large}}" width="180" height="180" class="avator" alt="{{screen_name}}">
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

        {{> profile-stats}}
    </div>
</div>
