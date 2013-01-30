define(function (require, exports, module) {

  module.exports = flexTextarea

  var tpl = '<div id="flex-textarea"></div>'
    , $flex = $(tpl).appendTo('body')

  $flex.css({
    visibility: 'hidden',
    position: 'fixed'
  })

  function flexTextarea(el) {
    var $el = $(el)
      , eventName = 'keyup.flexTextarea'

    $el.on(eventName, respond)
    setupEl($el)

    function setupEl($el) {
      var attrs = ['font-size', 'line-height', 'width']

      attrs.forEach(function(attr) {
        $flex.css(attr, $el.css(attr));
      })
    }

    function respond() {
      $flex.text(this.value)
      $el.height($flex.height())
    }

    return {
      destroy: function() {
        $el.off(eventName)
        $flex.text('')
      }
    }
  }
});
