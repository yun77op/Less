{{#if reposts.length}}
    {{#each reposts}}
        {{#module this name="mini-stream-item"}} {{/module}}
    {{/each}}
{{else}}
    <p>Empty!</p>
{{/if}}
