//http://davidwalsh.name/jquery-top-link
(function ($) {
  $.fn.elevator = function(settings) {
    settings = jQuery.extend({
      min: 1,
      fadeSpeed: 200
    }, settings);

    return this.each(function() {
      var el = $(this);
      el.hide(); //in case the user forgot
      $(window).scroll(function() {
        if($(window).scrollTop() >= settings.min) {
          el.fadeIn(settings.fadeSpeed);
        } else {
          el.fadeOut(settings.fadeSpeed);
        }
      });

      el.click(function (e) {
        e.preventDefault();
        // No smothness yet
        scrollTo(0, 0);
      });
    });
  };

})(jQuery);