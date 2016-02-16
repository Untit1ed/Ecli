class DaVinci {
   constructor() {
      var SVG = '<svg width="380" height="380" xmlns="http://www.w3.org/2000/svg">\
			<g>\
				<circle id="svg_1" r="185" cy="190" cx="190" stroke-linecap="null" stroke-linejoin="null" stroke-width="5" stroke="#000000" fill="#000000" fill-opacity="0"/>\
				<ellipse ry="95" rx="70" id="svg_4" cy="170" cx="250" stroke-linecap="null" stroke-linejoin="null" stroke-width="2" stroke="#000000" fill="#000000"/>\
				<ellipse ry="30" rx="41" id="svg_5" cy="220" cx="100" stroke-linecap="null" stroke-linejoin="null" stroke-width="2" stroke="#000000" fill="#000000"/>\
			</g>\
		</svg>';

      this.svg = new Blob([SVG], {
         type: "image/svg+xml;charset=utf-8"
      });
   }

   getImage(flip, isDC) {
      var canvas = document.createElement('canvas');
      canvas.width = 19;
      canvas.height = 19;

      var context = canvas.getContext('2d');

      if (isDC) context.globalAlpha = 0.5;

      if (flip) {
         context.translate(canvas.width, 0);
         context.scale(-1, 1);
      }

      var DOMURL = window.URL || window.webkitURL || window;
      var img = new Image();

      var promise = new Promise((resolve, reject) => {
         img.onload = function () {
            context.scale(0.05, 0.05);
            context.drawImage(img, 0, 0);
            var imageData = context.getImageData(0, 0, 19, 19);

            resolve(imageData);
         };

         img.onerror = function (e) {
            reject(`DaVinci Error: {e}`);
         }
      });

      var url = DOMURL.createObjectURL(this.svg);
      img.src = url;

      return promise;
   }
}

window.Ecli = window.Ecli || {}, window.Ecli.DaVinci = new DaVinci();
