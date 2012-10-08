<div class="container">
    <div>
        {{#with user}}
        {{> stream-item-vcard}}
        {{#module this name="application.relationship-action"}}
        {{/module}}
        {{/with}}
    </div>
    {{> stream-item-tweet-content}}

    <ul class="nav nav-tabs">
        <li class="active"><a href="#reposts" data-toggle="tab">转发{{reposts_count}}</a></li>
        <li><a href="#comments" data-toggle="tab">评论{{comments_count}}</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane active" id="reposts">
            {{#module name="application.new-tweet"}}
            {{/module}}
            {{#module name="application.reposts"}}
            {{/module}}
        </div>
        <div class="tab-pane" id="comments">
            {{#module name="application.new-tweet"}}
            {{/module}}
            {{#module name="application.comments"}}
            {{/module}}
        </div>
    </div>
</div>