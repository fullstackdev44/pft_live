(function($) {
  
  "use strict";


    //  ============= MOBILE RESPONSIVE MENU ===============

    $(".menu-btn").on("click", function(){
      $(this).toggleClass("active");
      $(".responsive-mobile-menu").toggleClass("active");
      $(this).parent().parent().toggleClass("no-br");
    });

    $(".responsive-mobile-menu ul ul").parent().addClass("menu-item-has-children");
    $(".responsive-mobile-menu ul li.menu-item-has-children > a").on("click", function() {
      $(this).parent().toggleClass("active").siblings().removeClass("active");
      $(this).next("ul").slideToggle();
      $(this).parent().siblings().find("ul").slideUp();
      return false;
    });


    //  ============= SETTING HEIGHT  ===============


    var hd_height = $(".top-header").innerHeight();
    $(".responsive-mobile-menu").css({
      "top": hd_height
    });


    //  ============= SEARCH PG  ===============

    $(".search-btn > a").on("click", function(){
      $(".search-page").addClass("active");
    });
    $(".close-search").on("click", function(){
      $(".search-page").removeClass("active");
    });


    $(".login_form_show").on("click", function() {
      $(".form_popup").addClass("opened");
      $(".login_form").addClass("show");
      $(".signup_form").removeClass("show");
      $("body").addClass("overlay");
    });

    $(".show_signup").on("click", function() {
      $(".form_popup").addClass("opened");
      $(".signup_form").addClass("show");
      $(".login_form").removeClass("show");
    });

    $("body").on("click", function(){
      $(this).removeClass("overlay");
      $(".form_popup").removeClass("opened");
      $(".signup_form").removeClass("show");
      $(".login_form").removeClass("show");
    });

    $(".form_popup, .login_form_show, .show_signup").on("click", function(e){
      e.stopPropagation();
    });



    $(".form_popup .login_form_show").click(function() {
        $(".form_popup").animate({
            scrollTop: $("#login_form").offset().top
        }, 1000);
     });
    $(".form_popup .show_signup").click(function() {
        $(".form_popup").animate({
            scrollTop: $("#signup_form").offset().top
        }, 1000);
     });

    var header_height = $(".top_bar").innerHeight();

    $(".side_menu").css({
      "top" : header_height
    });




    $(".dp_menu").on("click", function(){
      $(".side_links ul .dp_down").slideToggle();
      return false;
    });

    $("html").on("click", function(){
      $(".side_links ul .dp_down").slideUp();
    });

    $(".side_links ul .dp_down, .dp_menu").on("click", function(e){
      e.stopPropagation();
    });



    /*==============================================
                      SEARCH PAGE
    ===============================================*/

    $(".search_form form button").on("click", function(){
      $(".search-page").addClass("active");
      return false;
    });
    $(".close-search").on("click", function(){
      $(".search-page").removeClass("active");
    });


    //  ==================== SCROLLING FUNCTION ====================

    $(window).on("scroll", function() {
        var scroll = $(window).scrollTop();
        if (scroll > 30) {
            $(".top_bar").addClass("scroll animated slideInDown");
        } else if (scroll < 30) {
            $(".top_bar").removeClass("scroll animated slideInDown")
        }
    });




    $(".menu").on("click", function(){
      $(".side_menu").toggleClass("active");
      return false;
    });





})(window.jQuery);


