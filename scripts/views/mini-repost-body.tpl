{{#if reposts.length}}
    {{#each reposts}}
        {{#module this name="mini-repost-item"}} {{/module}}
    {{/each}}
{{else}}
    <p>Empty!</p>
{{/if}}