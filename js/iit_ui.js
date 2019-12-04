/* global crop */

var sectionsCreatedThusFar = 0;
var image1 = {}; // Image dragged into the left-hand position
var image2 = {}; // Image dragged into the right-hand position

(function($) {

  var extractdetailHtml = tmpl("extractdetail_tmpl");
  var croppedimageHtml = tmpl("croppedimage_tmpl");

  var section1 = {}; // [Croptool] section defined on the left-hand image
  var section2 = {}; // [Croptool] section overlaid on the right-hand image.

  var imageSize, imageSizePrefix, screenRatio, previousImagePrefix;

  var vf400img1Height, vf400img2Height; // Do we ever use these?

  // QUESTION what is the deal with these previous image prefixes?
  previousImagePrefix = "800px"; // We never actually use this value anywhere, it gets overridden the first time that replaceImagePrefix gets called.
  var cl_windowWidth = $(window).width();
  imageSize = Math.floor(cl_windowWidth / 2);
  imageSizePrefix = calculateImagePrefix(imageSize);

  // If we keep this, we should refactor it. But maybe there's a better way than jumping down in 200px increments.
  function calculateImagePrefix(number) {
    var result;
    if (number >= 800) {
      result = "800px";
    } else if (number >= 700) {
      result = "800px";
    } else if (number >= 600) {
      result = "800px";
    } else if (number >= 500) {
      result = "600px";
    } else if (number >= 400) {
      result = "600px";
    } else if (number >= 300) {
      result = "400px";
    } else if (number >= 200) {
      result = "400px";
    } else {
      result = "200px";
    }
    return result;
  }

  // This function runs through all the .ui-thumb's on the page and finds the child img,
  // and extracts the attribute 'data-lrg-url' and POSTs to agile/iit/imagederivative passing
  // a size ('next') and a path. This is the thing that takes forever and you can't move images
  // while it's happening (issue #1).
  // On initial run it passes in 800px as prev and floor(half window width)+px as next.
  // Note that it never uses the value of prev. It initializes the image styles based on next.
  // The entire existence of prev in this function is a relic of old code.
  function replaceImagePrefix(prev, next) {
    var imgs = $(".ui-thumb img");
    var count = imgs.length;
    imgs.each(function() {
      // var src = $(this).attr('data-lrg-url'); // note the difference between data-lrg-url and data-lrg_url.
      // In my example, data-lrg-url is "public://Mona_Lisa_(copy,_Hermitage).jpg" and
      // data-lrg_url is "http://localhost:8181/sites/default/files/styles/iit-200/public/Mona_Lisa_%28copy%2C_Hermitage%29.jpg?itok=rDQt89Lv"
      // var that = this;
      // $.post("agile/iit/imagederivative", {size: next, path: src}, function (data) { // Get the url of the derivative of size 'next'.
      //     $(that).attr('data-lrg_url', data); // Set it to data-lrg_url (does this mean we have a zoom ratio of 1?)
      //     //$.get(data); // Are we calling 'get' to initialize the derivatives? It takes a while. are we maybe better to initialize them as needed?
      // });
      if (!--count) makeDraggable();
    });
    previousImagePrefix = next;
    // Make the .ui-thumb stuff draggable. Good. Bizzarely, the helper seems to pop up ~150px BELOW the cursor.  This is kinda confusing.
  }
  function makeDraggable() {
    $(".ui-thumb")
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
    $(".img-container > h4").text("Drag image here");
  }

  // This initializes all the image derivatives using imageSizePrefix. It also happens to set previousImagePrefix to the imageSizePrefix.
  replaceImagePrefix(previousImagePrefix, imageSizePrefix);

  // Make the .img-container's droppable.
  $(".img-container").droppable({
    accept: ".ui-thumb",
    hoverClass: "iit-ui-state-hover",
    drop: function(event, ui) {
      // ui is the object currently being dropped.

      var src_orig = ui.draggable.find("img").attr("src"); // Get the url of the original image. FIXME - encode into view.
      var src = ui.draggable.find("img").attr("data-lrg_url"); // get the url of the "big" image (which at the moment is also the half-the-viewport image), e.g. http://localhost:8181/sites/default/files/styles/iit-200/public/Mona_Lisa_%28copy%2C_Hermitage%29.jpg?itok=rDQt89Lv
      var nid = ui.draggable.find("img").attr("nid"); // get the nid!
      var vfsrc = src.replace(imageSizePrefix, "800px"); // Not sure why we need vfsrc. note that vf means view form, which means it's maybe populating values to be used in the comparison viewer. Also not sure if this line of code is useful as src now includes iit-x00 instead of x00px.
      var vf400src = src.replace(imageSizePrefix, "400px"); // Question: likewise.
      $(this)
        .find("img")
        .remove(); // Remove an existing image; lets you drop overtop of something already there. Good.

      var title = ui.draggable.find("img").attr("alt"); // Obtain the title for this droppable section. Kinda nice, but not super necessary. Should we maybe or not get it from pid?

      // Rosie you're actually using these, don't delete until you refactor to get them from the node.
      var height = ui.draggable.find("img").attr("data-height"); // obtain the raw real-life-dimensions from the drop-ee
      var width = ui.draggable.find("img").attr("data-width");

      // Delete this crap.
      var dimensions = ui.draggable.find("img").attr("data-dimensions"); // obtain the pretty real-life-dimensions from the drop-ee (not needed yet)
      var date = ui.draggable.find("img").attr("data-date"); // obtain the date created from the drop-ee. Definitely not needed here.
      var support = ui.draggable.find("img").attr("data-support"); // obtain some other random information about the painting. Not needed here either.

      $(this)
        .find("h4")
        .html(title); // Set the title of this droppable section (as described above)
      // Create an html of a new image node. Isn't there a better javscript way to do this? [yes, see below] And we can refactor out most of these attributes.
      var newImage =
        "<a href='" +
        src +
        "'><img onerror='imgError()'  alt='" +
        title +
        "' src='" +
        src +
        "' data-nid='" +
        nid +
        "' data-dimensions='" +
        dimensions +
        "' data-height='" +
        height +
        "' data-width='" +
        width +
        "' data-date='" +
        date +
        "' data-support='" +
        support +
        "'> </a>";
      var newImageElm = $(newImage).appendTo(this);

      if (this.id === "image1") {
        // Set some local variables in javascript. When are we going to use these?
        image1.src = src;
        image1.src_orig = src_orig;
        image1.realHeight_cm = $(this)
          .find("img")
          .attr("data-height");
        image1.realWidth_cm = $(this)
          .find("img")
          .attr("data-width");
        image1.nid = nid;

        /* DO WE NEED THE VIEW STUFF? */
        $("#vf_img1").val(vfsrc); // code note: val() gets/sets the value of a form element. This sets the value in the "viewform" out of data-lrg_url (after failing to change the pixel size from x00px to 800px)
        $("#cf_img1").val(src); // ditto for the crop viewer form, only this time we maybe intended use the image fitted to half the screen width size. We use this image as the source for the extracted detail. Maybe we want a higher res source?
        var vf400img1 = new Image(); // This is how to make a new Image html thing in javascript.
        vf400img1.src = vf400src;
        vf400img1Height = vf400img1.height; // ??
        vf400img1Width = vf400img1.width; // ??
        delete vf400img1; // This seems to do absolutely nothing because we never set/found the height/width of this before deleting it.
        $.get(vfsrc) // Send a get request to the "large" version for the view form.
          .done(function() {
            var newvfsrc = vfsrc.split("/"); // if it returns, yay! assign a new variable that we never use out of the path parts.
          })
          .fail(function() {
            // if it fails, make a new array out of the first six path parts and remove "thumb" from anything. Assign this to the viewform.
            var newvfsrc = vfsrc.split("/", 6);
            newvfsrc = newvfsrc.join("/");
            newvfsrc = newvfsrc.replace("/thumb", "");
            $("#vf_img1").val(newvfsrc);
          });

        /* TO HERE */
      } // If you dragged into the second image drop zone
      else {
        image2.src = src;
        image2.src_orig = src_orig;
        image2.realHeight_cm = $(this)
          .find("img")
          .attr("data-height");
        image2.realWidth_cm = $(this)
          .find("img")
          .attr("data-width");
        image2.nid = nid;

        /* CHECK THE VF STUFF */
        $("#vf_img2").val(vfsrc); // Set the src of image 2 in the view form. (should have been the 800 version but isn't)
        $("#cf_img2").val(src); // Set the src of image 2 in the crop form.
        var vf400img2 = new Image(); // WTF
        vf400img2.src = vf400src;
        vf400img2Height = vf400img2.height;
        delete vf400img2;
        $.get(vfsrc) // WTF see above.
          .done(function() {
            var newvfsrc = vfsrc.split("/");
          })
          .fail(function() {
            var newvfsrc = vfsrc.split("/", 6);
            newvfsrc = newvfsrc.join("/");
            newvfsrc = newvfsrc.replace("/thumb", "");
            $("#vf_img2").val(newvfsrc);
          });
      }
    }
  });

  // Resets the gallery view, removing any images in the drop zones.
  $(document).on("submit", "#view_reset", function(e) {
    e.preventDefault();
    $(".img-container > a").empty();
    $(".img-container > h4").text("Drag image here");
    var elementExists = document.getElementById("img_overlay1"); // This removes the grids, if present.
    if (elementExists) {
      var element1 = document.getElementById("img_overlay1");
      element1.parentNode.removeChild(element1);
      var element2 = document.getElementById("img_overlay2");
      element2.parentNode.removeChild(element2);
    }
    image1 = {};
    image2 = {};
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
    } else if ($target.is(".ui-icon-arrowstop-1-e")) {
      // flip arrow handler
      var myid2 = $target
        .parent()
        .find("img")
        .attr("id"); // needed because the id is arbitrary and we can have multiple details.
      $("#" + myid2).toggleClass("flip");
    }

    return false;
  });

  // Handler for the crop overlay close button.
  $(document).on("click", "#cl_close", function() {
    $("#overlay2").remove();
    $("#resizable-gallery-wrapper").show();
    $("#page-title").show();
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
      $("#page-title").hide();
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

  var createSection = function(xOffset_ratio, yOffset_ratio, width_ratio, height_ratio, width, src) {
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
        rotation_deg: angle
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
      $(".draggable").draggable({ containment: "window" });
      $(".resizable").resizable({ aspectRatio: true, handles: "se" });
      $(".rotatable").rotatable({ wheelRotate: false });
      // Add event handler on info.
      $("#info-button-" + sectionId.toString()).on("click", infoHandler);
      // Scroll down to see the new div
      $("html, body").animate({ scrollTop: $(document).height() });
    };

    return {
      initializeSection: function() {
        var params = serializeParameters()
        crop(params.src, 1).then(function (img) {
          var wrapper= document.createElement('div');
          wrapper.innerHTML= croppedimageHtml({});
          var div = wrapper.firstElementChild;
          div.querySelector('#cropped').appendChild(img);        
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

      var newSection = createSection(xOffset_ratio, yOffset_ratio, width_ratio, height_ratio, width, src);
      newSection.initializeSection();
    } else {
      alert("Please select a crop region then press submit.");
      return false;
    }
  });
})(jQuery);
