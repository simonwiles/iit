/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var twoviewsHtml = tmpl("twoviews_tmpl");

var image1Top, image2Top;
var image1Left = 0;
function comp_view() {
  $("header").hide();
  var container_width = $("#iit_container").width();
  var myOverlay = document.createElement("div");
  myOverlay.id = "overlay2";
  var img1 = $("#image1").find("img");
  var img2 = $("#image2").find("img");
  var baseheight = Math.max(img1.height(), img2.height());
  $("#iit_container").append(myOverlay);
  $("#overlay2").width(container_width);
  $("#overlay2").height(baseheight + 400);
  $("#overlay2").html(twoviewsHtml({ img1src: img1.attr("src"), img2src: img2.attr("src") }));
  $(window).scrollTop(0);
  var ol_width = $("#overlay2").width();
  var ol_height = $("#overlay2").height();
  // Set image dimensions before calling zoomy.
  $("#ol_i1").css("width", ol_width / 2 - 50);
  $("#ol_i2").css("width", ol_width / 2 - 50); // note: this is called during window resize.

  var top = Math.max($("#ol_i1").height(), $("#ol_i2").height()) + 5;
  image1Top = top;
  image2Top = top;
  var container_width = $("#ol_i1").width();
  $(".zoom").zoomy({
    zoomSize: container_width / 2,
    round: false,
    border: "6px solid #fff"
  });
  dims = {
    image1_width: img1[0].naturalWidth,
    image1_height: img1[0].naturalHeight,
    image2_width: img2[0].naturalWidth,
    image2_height: img2[0].naturalHeight
  };
}
function close_compview() {
  $(".zoom")
    .find(".zoomy")
    .remove();
  $("#overlay2").remove();
  $("header").show();
}
(function($) {
  // Drupal.behaviors.agileIITComparison = {
  //     attach: function (context, settings) {
  var rtime;
  var timeout = false;
  var delta = 200;
  $(window).resize(function() {
    if ($("#overlay2").length && $("#twoviews_container").length) {
      rtime = new Date();
      if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
      }
    }
  });

  function resizeend() {
    if (new Date() - rtime < delta) {
      setTimeout(resizeend, delta);
    } else {
      timeout = false;
      $("#ol_close").trigger("click");
      $("#viewform").trigger("submit");
    }
  }

  $(document).on("click", "#ol_close", close_compview);
  $(document).on("click", "#ol_help", function() {
    var myWindow = window.open("", "helpWindow", "width=500, height=500, scrollbars=yes, toolbar=yes");
    myWindow.focus();
    $.get("help", "crop", function(data) {
      myWindow.document.write(data);
      myWindow.location.href = "#comparison";
      myWindow.document.close();
    });
  });
  // Initiate comparison viewer.
  $("#viewform").submit(function(e) {
    e.preventDefault();
    var tmp1 = $("#vf_img1").val();
    var tmp2 = $("#vf_img2").val();
    if (tmp1 === "" || tmp2 === "") {
      alert("Two images must be selected to use comparison viewer.");
      return false;
    } else {
      comp_view();
    }
  });
})(jQuery);
