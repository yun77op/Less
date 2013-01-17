{{#if this.length}}
    {{#each this}}
        {{#module this name="mini-stream-item"}} {{/module}}
    {{/each}}
{{else}}
    <p>Empty!</p>
{{/if}}