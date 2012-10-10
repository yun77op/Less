<div class="modal-header">
    <button type="button" i18n-values="title:close" class="close" data-dismiss="modal">x</button>
    <h3>Whats happening?</h3>
</div>
<div class="modal-body">
    <textarea name="status" class="status-editor fullspace"></textarea>
    <div class="status-actions clearfix">
        <div class="pull-right">
            <span class="status-counter">140</span>
            <input type="submit" value="Submit" class="status-submit-btn btn" disabled>
        </div>
        <ul class="status-actions-list">
            {{#if actions_list.emoticons}}
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
            {{/if}}
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
            {{#if actions_list.topic}}
                <li><a href="#" class="topic-action" i18n-content="topic">Topic</a></li>
            {{/if}}
        </ul>
    </div>
    <ul class="status-aside"></ul>
</div>

