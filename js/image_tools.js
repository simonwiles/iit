/* exported crop */

/**
 * @param {string} url - The source image
 * @param {number} aspectRatio - The aspect ratio
 * @return {Promise<HTMLCanvasElement>} A Promise that resolves with the resulting image as a canvas element
 */
function crop(url, params) {
  // we return a Promise that gets resolved with our canvas element
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      var cropMarginWidth = 50,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext("2d"),
        cropCoords = {
          topLeft: {
            x: cropMarginWidth,
            y: cropMarginWidth
          },
          bottomRight: {
            x: img.width - cropMarginWidth,
            y: img.height - cropMarginWidth
          }
        };

      canvas.width = img.width - 2 * cropMarginWidth;
      canvas.height = img.height - 2 * cropMarginWidth;
    
      ctx.drawImage(
        img,
        cropCoords.topLeft.x,
        cropCoords.topLeft.y,
        cropCoords.bottomRight.x,
        cropCoords.bottomRight.y,
        0,
        0,
        img.width,
        img.height
      );

      resolve(canvas);
    };

    // start loading our image
    img.src = url;
  });
}
