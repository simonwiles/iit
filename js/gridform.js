(function($) {
  "use strict";
  $("#gridform").submit(function(e) {
    e.preventDefault();
    var tmp1 = $("#vf_img1").val();
    var tmp2 = $("#vf_img2").val();
    var elementExists = document.getElementById("img_overlay1");

    if (elementExists) {
      var element1 = document.getElementById("img_overlay1");
      element1.parentNode.removeChild(element1);
      var element2 = document.getElementById("img_overlay2");
      element2.parentNode.removeChild(element2);
    } else if (tmp1 === "" || tmp2 === "") {
      alert("Two images must be selected.");
      return false;
    } else {
      var img1top = $("#image1")
        .find("img")
        .position();
      var img1w = $("#image1")
        .find("img")
        .width();
      var img1h = $("#image1")
        .find("img")
        .height();

      var img2top = $("#image2")
        .find("img")
        .position();
      var img2w = $("#image2")
        .find("img")
        .width();
      var img2h = $("#image2")
        .find("img")
        .height();

      var overlay1 = $('<div id="img_overlay1"> </div>');
      var overlay2 = $('<div id="img_overlay2"> </div>');
      var table1 = $("<table></table>").addClass("imgtbl");

      var i;
      for (i = 0; i < 5; i++) {
        var row = $("<tr><td></td><td></td><td></td><td></td><td></td></tr>");
        table1.append(row);
      }
      var table2 = $("<table></table>").addClass("imgtbl");
      var i;
      for (i = 0; i < 5; i++) {
        var row = $("<tr><td></td><td></td><td></td><td></td><td></td></tr>");
        table2.append(row);
      }
      overlay1.append(table1);
      overlay2.append(table2);
      $("#image1").append(overlay1);
      $("#image2").append(overlay2);
      $("#img_overlay1").css("top", img1top.top);
      $("#img_overlay1").css("left", img1top.left);
      $("#img_overlay1").css("width", img1w);
      $("#img_overlay1").css("height", img1h);
      $("#img_overlay2").css("top", img2top.top);
      $("#img_overlay2").css("left", img2top.left);
      $("#img_overlay2").css("width", img2w);
      $("#img_overlay2").css("height", img2h);
    }
  });
})(jQuery);
