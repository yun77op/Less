<input name="status" class="status-editor">
<input type="submit" value="Submit" class="status-submit-btn btn btn-primary" disabled>
<div class="status-actions clearfix">
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
    </ul>
</div>
<ul class="status-aside">
    {{#if comment}}
        {{#each comment}}
            <li>
                <label><input type="checkbox" name="comment" class="comment-control">{{this}}</label>
            </li>
        {{/each}}
    {{/if}}
    {{#if comment_ori}}
        <li>
            <label><input type="checkbox" name="commentOrigin" class="commentOrigin-control">{{ori_username}}</label>
        </li>
    {{/if}}
</ul>
