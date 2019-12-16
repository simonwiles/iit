/* global loadImage */

(function() {

  var dropZones = document.getElementsByClassName("img-container");

  [].forEach.call(dropZones, function(dropZone) {
    dropZone.addEventListener("dragover", function(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });

    dropZone.addEventListener("drop", function(dropEvent) {
      dropEvent.stopPropagation();
      dropEvent.preventDefault();
      var files = dropEvent.dataTransfer.files;

      for (var i=0, file; file=files[i]; i++) {
        if (file.type.match(/image.*/)) {
          var reader = new FileReader();
          reader.onload = function(readerOnloadEvent) {
            loadImage(readerOnloadEvent.target.result, dropZone);
          }
          reader.readAsDataURL(file);
        }
      }
    });
  });
})();
