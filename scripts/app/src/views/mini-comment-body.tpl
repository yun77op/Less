{{#if comments.length}}
    {{#each comments}}
        {{#module this name="mini-stream-item"}} {{/module}}
    {{/each}}
{{else}}
    <p>Empty!</p>
{{/if}}
