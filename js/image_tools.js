/* exported crop */

function crop(params) {
  // we return a Promise that gets resolved with our canvas element
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas'),
          ctx = canvas.getContext("2d");

          canvas.width = (params.baseWidth * params.width_ratio);
      canvas.height = (params.baseHeight * params.height_ratio);
      
      canvas.style.opacity = 0.6;
    
      ctx.drawImage(
        img,
        // s
        params.xOffset_ratio * img.width, // top-left x coord relative to original image
        params.yOffset_ratio * img.height, // top-left y coord relative to original image
        params.width_ratio * img.width, // width relative to original image
        params.height_ratio * img.height, // height relative to original image
        // d
        0, // target x
        0, // target y
        params.width_ratio * params.baseWidth,  // output width (original width)
        params.height_ratio * params.baseHeight  // output height (original height)
      );

      resolve(canvas);
    };

    // start loading our image
    img.src = params.src;
  });
}
