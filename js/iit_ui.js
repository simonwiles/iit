/* global jQuery, tmpl, crop */

var sectionsCreatedThusFar = 0;
var image1 = {}; // Image dragged into the left-hand position
var image2 = {}; // Image dragged into the right-hand position

function loadImage(imageSrc, container) {

  jQuery(container).find("h4").hide();
  jQuery(container).find("img").remove();
  jQuery(container).append(jQuery("<img src='" + imageSrc + "'>"));

  if (container.id === "image1") {
    jQuery("#vf_img1").val(imageSrc);
    jQuery("#cf_img1").val(imageSrc);
  } else {
    jQuery("#vf_img2").val(imageSrc);
    jQuery("#cf_img2").val(imageSrc);
  }

}

(function($) {

  var extractdetailHtml = tmpl("extractdetail_tmpl");
  var croppedimageHtml = tmpl("croppedimage_tmpl");

  var section1 = {}; // [Croptool] section defined on the left-hand image
  var section2 = {}; // [Croptool] section overlaid on the right-hand image.

  var imageSize, imageSizePrefix, screenRatio, previousImagePrefix;

  $("#show-sample-images").on("click", function () {
    $(".sample-images").toggle();
  });

  function makeDraggable() {
    $(".iit-thumb")
      .draggable({
        cursor: "move",
        revert: "false",
        helper: "clone",
        scroll: false,
        cursorAt: { left: 5, top: 5 }
      })
      .on("dragstart", function(e, ui) {
        $(ui.helper).css("z-index", "99999"); // and make the helper super-high z-index. This good.
      });
  }

  // This initializes all the image derivatives using imageSizePrefix. It also happens to set previousImagePrefix to the imageSizePrefix.
  // replaceImagePrefix(previousImagePrefix, imageSizePrefix);
  makeDraggable();

  // Make the .img-container's droppable.
  $(".img-container").droppable({
    accept: ".iit-thumb",
    hoverClass: "iit-ui-state-hover",
    drop: function(event, ui) {
      // ui is the object currently being dropped.
      loadImage(ui.draggable.find("img").attr("src"), this) 
    }
  });

  // Resets the gallery view, removing any images in the drop zones.
  $(document).on("submit", "#view_reset", function(e) {
    e.preventDefault();
    $(".img-container > img").remove();
    $(".img-container > h4").text("Drag image here");
    var elementExists = document.getElementById("img_overlay1"); // This removes the grids, if present.
    if (elementExists) {
      var element1 = document.getElementById("img_overlay1");
      element1.parentNode.removeChild(element1);
      var element2 = document.getElementById("img_overlay2");
      element2.parentNode.removeChild(element2);
    }
    $("#iit_container h4").show();
    image1 = {};
    image2 = {};
    $("#vf_img1").val(null);
    $("#vf_img2").val(null);
    $("#cf_img1").val(null);
    $("#cf_img2").val(null);
  });

  // Handler for the detail section. Note that the section has the id #results.
  $(document).on("click", "#results", function(event) {
    var $item = $(this),
      $target = $(event.target);

    // Close button fades out then vanishes the #results.
    if ($target.is(".ui-icon-close")) {
      //$target.parent().parent().remove();
      $target
        .parent()
        .parent()
        .parent()
        .fadeOut(300, function() {
          $(this).remove();
        });
    }

    return false;
  });

  // Handler for the crop overlay close button.
  $(document).on("click", "#cl_close", function() {
    $("#overlay2").remove();
    $("header").show();
    $(".img-container").show();
  });
  // Handler for the crop overlay help button.
  $(document).on("click", "#cl_help", function() {
    var myWindow = window.open("", "helpWindow", "width=500, height=500, scrollbars=yes, toolbar=yes");
    myWindow.focus();
    $.get("agile/iit/help", "crop", function(data) {
      myWindow.document.write(data);
      myWindow.location.href = "#crop";
      myWindow.document.close();
    });
  });
  function updateCoords(c) {
    // This gets called when a rectangle is selected in the crop tool.
    $("#x").val(c.x); // These elements are part of the form #cropform2 which has the submit button Extract Detail.
    $("#y").val(c.y); // They get the x and y position of the top-left corner and the height and width,
    $("#w").val(c.w); // seemingly accurately and independent of whether you made the rectangle by dragging down-right or up-left.
    $("#h").val(c.h);
  }
  var jcrop_api = [];

  // Initiate the crop form
  $("#cropform").submit(function(e) {
    e.preventDefault();
    var tmp1 = $("#cf_img1").val();
    var tmp2 = $("#cf_img2").val();
    if (tmp1 === "" || tmp2 === "") {
      alert("Two images must be selected.");
      return false;
    } else {
      $("#resizable-gallery-wrapper").hide();
      $("header").hide();
      $(window).scrollTop(0);
      var myOverlay = document.createElement("div");
      myOverlay.id = "overlay2"; // Create a thing called overlay2. We should refactor this to be a more descriptive name.
      $("#iit_container").append(myOverlay);

      $(".img-container").hide(); // Hize the dropzones.

      var img1 = $("#image1").find("img");
      var img2 = $("#image2").find("img");
      $("#overlay2").html(
        extractdetailHtml({
          img1src: img1.attr("src"),
          img2src: img2.attr("src")
        })
      );
      $("#crop_target").Jcrop({ onSelect: updateCoords }, function() {
        jcrop_api.push(this);
      }); // This means that on selecting a rectangle, it runs updateCoords.
      //});

      $(window).resize(function() {
        if (jcrop_api.length > 0) {
          $.each(jcrop_api, function(key, api) {
            api.destroy();
          });
          $("#crop_target").removeAttr("style");
          $(".jcrop-holder").remove();

          $("#crop_target").each(function() {
            $.Jcrop(this, { onSelect: updateCoords });
          });
        }
      });
    }
  });

  var createSection = function(xOffset_ratio, yOffset_ratio, width_ratio, height_ratio, width, src, baseWidth, baseHeight) {
    var sectionId = ++sectionsCreatedThusFar;
    var angle = 0;

    var overlaidSection = {};

    var serializeParameters = function() {
      return {
        xOffset_ratio: xOffset_ratio,
        yOffset_ratio: yOffset_ratio,
        width_ratio: width_ratio,
        height_ratio: height_ratio,
        width: width,
        src: src,
        id: sectionId,
        rotation_deg: angle,
        baseWidth: baseWidth,
        baseHeight: baseHeight
      };
    };

    var infoHandler = function(event) {
      var target = $(event.target);
      section1.mirrored = target
        .parent()
        .find("img")
        .hasClass("flip"); // don't do anything to this yet.
      var rotation = target.parent().css("transform"); // returns a matrix.
      if (rotation !== "none") {
        var matrix_values = rotation
          .split("(")[1]
          .split(")")[0]
          .split(",");
        var a = matrix_values[0];
        var b = matrix_values[1];
        angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
      }
      angle < 0 ? (angle += 360) : angle;

      // Calculate the four corners of the overlaid section.
      var sectionOffset = target
        .parent()
        .parent()
        .offset(); // Absolute position of the section's non-rotated div.
      var sectionHeight = target
        .parent()
        .find("img")
        .height(); // Current height (after any resizing)
      var sectionWidth = target
        .parent()
        .find("img")
        .width(); // Current width (after any resizing)
      var x = sectionOffset.left; // absolute position of the section's img.
      var y = sectionOffset.top;
      var x1 = x + sectionWidth; // absolute position of right side of section.
      var y1 = y + sectionHeight; // absolute position of bottom of section.

      image2.offset = $("#ol_i2 img").offset(); // Calculates the position of image2 relative to document (absolute position).
      image2.apparentHeight_px = $("#ol_i2 img").height();
      image2.apparentWidth_px = $("#ol_i2 img").width();

      overlaidSection.xOffset_ratio = (sectionOffset.left - image2.offset.left) / image2.apparentWidth_px;
      overlaidSection.yOffset_ratio = (sectionOffset.top - image2.offset.top) / image2.apparentHeight_px;
      overlaidSection.width_ratio = sectionWidth / image2.apparentWidth_px;
      overlaidSection.height_ratio = sectionHeight / image2.apparentHeight_px;

      // This math in the if statement says:
      // If the selection you've made is lying completely within image2. Need to verify the order of operations for + vs <=.
      if (
        x >= image2.offset.left &&
        x <= image2.offset.left + image2.apparentWidth_px &&
        y >= image2.offset.top &&
        y <= image2.offset.top + image2.apparentHeight_px &&
        x1 >= image2.offset.left &&
        x1 <= image2.offset.left + image2.apparentWidth_px &&
        y1 >= image2.offset.top &&
        y1 <= image2.offset.top + image2.apparentHeight_px
      ) {
        var values = new Array();
        values.push({ name: "image1", value: JSON.stringify(image1) });
        values.push({ name: "image2", value: JSON.stringify(image2) });
        values.push({
          name: "section1",
          value: JSON.stringify(serializeParameters())
        });
        values.push({
          name: "section2",
          value: JSON.stringify(overlaidSection)
        });
        var myWindow = window.open("", "cmpWindow", "width=1020, height=500, scrollbars=yes, toolbar=yes");
        myWindow.focus();

        $.post("agile/iit/imagecropper", values, function(data) {
          myWindow.document.write(data);
          $(myWindow.document)
            .find("head")
            .append(
              "<link rel='stylesheet' href='/sites/all/modules/agile_iit/css/detail_popup_window.css' type='text/css'>"
            );
          myWindow.document.close();
        });
      } else {
        console.log("outbounds");
      }
      return false;
    };

    var postHandler = function(data) {
      $("#results").append(data);
      $(data).draggable({ containment: "window" });
      $(data).find(".resizable").resizable({ aspectRatio: true, handles: "se" });
      $(data).find(".rotatable").rotatable({ wheelRotate: false });
      // Add event handler on info.
      $(data).find("#info-button-" + sectionId.toString()).on("click", infoHandler);
      var canvas = $(data).find("canvas");
      canvas[0].style.opacity = 0.6;
      canvas[0].style.transformOrigin = "top left";
      var canvasWidth = canvas.width();
      $(data).find(".resizable").on("resize", function() {
        canvas[0].style.transform = "scale(" + (this.offsetWidth / canvasWidth) + ")";
      });
      $(data).find(".flipper").on("click", function() {
        canvas.parent().toggleClass("flip");
      });
    };

    return {
      initializeSection: function() {
        var params = serializeParameters();
        crop(params).then(function (img) {
          var wrapper= document.createElement('div');
          wrapper.innerHTML= croppedimageHtml({});
          var div = wrapper.firstElementChild;
          div.querySelector('.flip-container').appendChild(img);        
          postHandler(div);
        })
      }
    };
  };

  // This runs when you click "Extract Detail" and it throws a little detail guy under the two images.
  $(document).on("submit", "#cropform2", function(e) {
    e.preventDefault();
    if (parseInt($("#w").val())) {
      // Check that a crop window exists.

      var xOffset_ratio = $("#x").val() / $("#crop_target").width();
      var yOffset_ratio = $("#y").val() / $("#crop_target").height();
      var width_ratio = $("#w").val() / $("#crop_target").width();
      var height_ratio = $("#h").val() / $("#crop_target").height();
      var width = $("#w").val();

      var src = $("#cf_img1").val(); // Oddly enough, we dig back down into the original "cropform" to get this value. It's still "underneath" the crop workspace.
      var baseWidth = $("#crop_target").width();
      var baseHeight = $("#crop_target").height();
      var newSection = createSection(xOffset_ratio, yOffset_ratio, width_ratio, height_ratio, width, src, baseWidth, baseHeight);
      newSection.initializeSection();
    } else {
      alert("Please select a crop region then press submit.");
      return false;
    }
  });
})(jQuery);
