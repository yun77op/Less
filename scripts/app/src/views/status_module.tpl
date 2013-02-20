<div>
		{{#with user}}
			<div class="pull-right">
				{{#module this name="relationship-action"}}{{/module}}
			</div>
			{{> stream-item-vcard}}
		{{/with}}
</div>
<div class="tweet">
		{{> stream-item-tweet-content}}
		{{#if retweeted_status}}
				{{#with retweeted_status}}
						<div class="tweet">
								{{> stream-item-tweet-content}}
								{{> stream-item-footer}}
						</div>
				{{/with}}
		{{/if}}
		{{> stream-item-footer}}
</div>

<ul class="nav nav-tabs">
		<li><a href="#reposts" data-type="repost" data-toggle="tab">转发{{reposts_count}}</a></li>
		<li><a href="#comments" data-type="comment" data-toggle="tab">评论{{comments_count}}</a></li>
</ul>
<div class="tab-content">
		<div class="tab-pane" id="reposts">
				{{#module this name="mini-repost-list"}}{{/module}}
		</div>
		<div class="tab-pane" id="comments">
				{{#module this name="mini-comment-list"}}{{/module}}
		</div>
</div>
