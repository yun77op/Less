<div class="relationship-container {{#if following}} following{{/if}}{{#if follow_me}} follow-me{{/if}}">
	<a href="#" class="btn btn-primary relationship-btn">
			<span class="btn-text action-following">Following</span>
			<span class="btn-text action-follow">Follow</span>
			<span class="btn-text action-unfollow">Unfollow</span>
	</a>
	<div class="relationship-mutual">{{#if following}}{{#if follow_me}}相互关注{{/if}}{{/if}}</div>
</div>
