define(function (require, exports, module) {

  module.exports = flexTextarea

  var tpl = '<div id="flex-textarea"></div>'
    , $flex = $(tpl).appendTo('body');

  $flex.css({
    visibility: 'hidden',
    position: 'fixed'
  });

  function flexTextarea(el) {
    var $el = $(el)
      , eventName = 'keyup.flexTextarea';

    $el.on(eventName, function(e) {
      respond(this.value);
    });

    setupEl($el);

    function setupEl($el) {
      var attrs = ['font-size', 'line-height', 'width'];

      attrs.forEach(function(attr) {
        $flex.css(attr, $el.css(attr));
      });

      setTimeout(function() {
        respond($el.val())
      }, 0)
    }

    function respond(val) {
      $flex.height('auto').text('');
      var feedHeight = 0;
      var lineHeight = parseInt($el.css('line-height'));
      if (val[val.length - 1] == '\n') feedHeight = lineHeight;
      $flex.html(val.replace(/\n/g, '<br>'));
        console.log($flex.height());
      $el.height(Math.max($flex.height() + feedHeight, lineHeight));
    }

    return {
      destroy: function() {
        $el.off(eventName)
      }
    }
  }
});
