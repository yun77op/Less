<div class="modal-header">
    <button type="button" i18n-values="title:close" class="close" data-dismiss="modal">x</button>
    <h3>{{title}}</h3>
</div>
<div class="modal-body">
    <textarea name="status" class="status-editor fullspace"></textarea>
    <div class="status-actions clearfix">
        <div class="pull-right">
            <span class="status-counter">140</span>
            <input type="submit" value="Submit" class="status-submit-btn btn" disabled>
        </div>
        <ul class="status-actions-list">
            <li>
                <a href="#" id="status-action-emoticons" i18n-content="emoticons">Emoticons</a>
                <div id="status-emoticons" hidden>
                    <div id="status-emoticons-header">
                        <ul id="status-emoticons-list"></ul>
                        <div id="status-emoticons-nav">
                            <button class="nav-prev" disabled></button>
                            <button class="nav-next" disabled></button>
                        </div>
                    </div>
                    <div id="status-emoticons-faces">
                        <div class="loadingArea">
                            <img src="images/loading.gif"><span i18n-content="loading">Loading</span>
                        </div>
                    </div>
                </div>
            </li>
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
                    <input class="geo-control" id="status-geo-control" type="checkbox">
                    <label for="status-geo-control" i18n-content="enableGeolocation">Enable Geolocation</label>
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
                <label><input type="checkbox" class="commentOrigin-control">{{comment_ori}}</label>
            </li>
        {{/if}}
    </ul>
</div>

