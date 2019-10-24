/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var image1Top, image2Top;
var image1Left = 0;
function comp_view() {
  $("#resizable-gallery-wrapper").hide();
  $("#page-title").hide();
  var container_width = $("#iit_container").width();
  var container_height = $("#iit_container").height();
  var myOverlay = document.createElement("div");
  myOverlay.id = "overlay2";
  var node1 = $("#image1")
    .find("img")
    .data("nid");
  var node2 = $("#image2")
    .find("img")
    .data("nid");
  var baseheight = Math.max(
    $("#image1")
      .find("img")
      .height(),
    $("#image2")
      .find("img")
      .height()
  );
  $("#iit_container").append(myOverlay);
  $("#overlay2").width(container_width);
  $("#overlay2").height(baseheight + 400);
  var values = [];
  values.push({ name: "node1", value: node1 });
  values.push({ name: "node2", value: node2 });
  $.post("agile/iit/twoviews", values, function(data) {
    $("#overlay2").append(data);
    $(window).scrollTop(0);
    var ol_width = $("#overlay2").width();
    var ol_height = $("#overlay2").height();
    // Set image dimensions before calling zoomy.
    var height = ol_height.toString() + "px";
    $("#ol_i1").css("width", ol_width / 2 - 50);
    $("#ol_i2").css("width", ol_width / 2 - 50); // note: this is called during window resize.

    var top = Math.max($("#ol_i1").height(), $("#ol_i2").height()) + 5;
    image1Top = top;
    image2Top = top;
    var src1 = $("#ol_i1")
      .find("img")
      .attr("src");
    var scr2 = $("#ol_i1")
      .find("img")
      .attr("src");
    var container_width = $("#ol_i1").width();
    $(".zoom").zoomy({
      zoomSize: container_width / 2,
      round: false,
      border: "6px solid #fff"
    });
    $.ajax({
      url: "agile/iit/image_dimensions",
      type: "POST",
      data: {
        img1: $("#ol_i1")
          .find("img")
          .attr("src"),
        img2: $("#ol_i2")
          .find("img")
          .attr("src")
      },
      async: false,
      success: function(results, status, xhr) {
        results = JSON.parse(results);
        dims = results;
      },
      error: function(data, status, xhd) {
        console.log("The function execute_callback has failed");
      }
    });
  });
}
function close_compview() {
  var dims = [];
  $(".zoom")
    .find(".zoomy")
    .remove();
  $("#overlay2").remove();
  $("#resizable-gallery-wrapper").show();
  $("#page-title").show();
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
    $.get("agile/iit/help", "crop", function(data) {
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
  //     }
  // };
})(jQuery);
