<ul>
    {{#each emoticons}}
        <li>
            <img width="22" height="22" title="{{this.title}}" data-emoticon="{{this.phrase}}" src="{{this.icon}}" alt="{{this.phrase}}">
        </li>
    {{/each}}
</ul>
