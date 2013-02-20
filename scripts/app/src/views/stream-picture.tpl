{{#unless expand}}
	<div class="tweet-pic-thumb" data-original="{{ original_pic }}"><img src="{{ thumbnail_pic }}"></div>
	<img src="images/loading.gif" class="throbber" hidden>
{{/unless}}
<div class="tweet-pic-origin" {{#unless expand}}hidden{{/unless}}>
    <div class="actions">
				{{#unless expand}}<a href="#" class="action-collapse">收起</a>{{/unless}}
        <a href="{{ original_pic }}" target="_blank" class="action-view-origin">查看大图</a>
        <a href="#" class="action-rotate-left">左转</a>
        <a href="#" class="action-rotate-right">右转</a>
    </div>
		{{#if expand}}<img src="{{ original_pic }}">{{/if}}
</div>
