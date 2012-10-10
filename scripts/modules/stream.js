define(function(require, exports) {

    var StreamModule = Backbone.Module.extend({
        render: function() {
            this.$el.html(this.template());

            var data = this.model.attributes;
            var $stream = $('.stream', this.$el);
            var View = this.View;

            data[data.key].forEach(function(status, i) {
                var streamItemView = new View({
                    model: status
                });
                var el = streamItemView.render().el;
                $stream.append(el);
            });

            return this;
        },

        template: '<div class="stream"></div>'
    });

    return StreamModule;
});