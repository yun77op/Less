<div class="modal-header">
    <button type="button" i18n-values="title:close" class="close" data-dismiss="modal">x</button>
    <h3>{{title}}</h3>
</div>
<div class="modal-body">
    <textarea name="status" class="status-editor fullspace"></textarea>
    <div class="status-actions clearfix">
        <div class="pull-right">
            <span class="status-counter">140</span>
            <input type="submit" value="Submit" class="status-submit-btn btn btn-primary" disabled>
        </div>
        <ul class="status-actions-list">
            <li>{{#module name="weibo-emoticons"}}{{/module}}</li>
            {{#if actions_list.picture}}
                <li class="dropdown" id="status-pic-dropdown">
                    <a href="#status-pic-dropdown" class="pic-action" i18n-content="image">Image</a>
                    <input type="file" class="status-pic-file visuallyhidden" accept="image/*">
                    <ul class="dropdown-menu" id="status-pic-dropdown-menu">
                        <li>
                            <canvas class="status-pic-canvas" width="200"></canvas>
                            <div class="actions">
                                <button class="status-pic-del btn-link" i18n-content="delete">Delete</button>
                            </div>
                        </li>
                    </ul>
                </li>
            {{/if}}
            {{#if actions_list.geo}}
                <li>
                    <button id="status-geo-control" class="action-geo btn-link" i18n-content="enableGeolocation">Enable Geolocation</button>
                </li>
            {{/if}}
            {{#if actions_list.topic}}
                <li><a href="#" class="topic-action" i18n-content="topic">Topic</a></li>
            {{/if}}
        </ul>
    </div>
    <ul class="status-aside">
        {{#if comment}}
            {{#each comment}}
                <li>
                    <label><input type="checkbox" class="comment-control">{{this}}</label>
                </li>
            {{/each}}
        {{/if}}
        {{#if comment_ori}}
            <li>
                <label><input type="checkbox" class="commentOrigin-control">{{ori_username}}</label>
            </li>
        {{/if}}
    </ul>
</div>

