<form class="form-inline">
    <textarea name="status" class="status-editor"></textarea>
    <input type="submit" value="Submit" class="status-submit-btn btn btn-primary" disabled>
</form>
<div class="status-actions clearfix">
    <ul class="status-actions-list">
        <li></li>
    </ul>
</div>
<ul class="status-aside">
    {{#if comment}}
        <li>
            <label><input type="checkbox" name="comment" class="js-comment">{{comment}}</label>
        </li>
    {{/if}}
    {{#if repost}}
        <li>
            <label><input type="checkbox" name="repost" class="js-repost">{{repost}}</label>
        </li>
    {{/if}}
    {{#if comment_ori}}
        <li>
            <label><input type="checkbox" name="commentOrigin" class="js-commentOrigin">{{ori_username}}</label>
        </li>
    {{/if}}
</ul>
