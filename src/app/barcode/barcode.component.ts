import { Component, OnInit } from '@angular/core';
declare var Quagga: any;

@Component({
  selector: 'app-barcode',
  templateUrl: './barcode.component.html',
  styleUrls: ['./barcode.component.css']
})

export class BarcodeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    initCameraSelection();
  }

  startScanner() : void {

    let settings = {
      decoder: { readers: ["code_128_reader", "code_39_reader"] },
      frequency: 10,
      locate: true,
      inputStream: { 
        type: 'LiveStream', 
        target: document.querySelector('#video-player'),
        //constraints: { facingMode : "environment", height: { min: 480 }, width: { min: 640 }, aspectRatio : { min: 1 , max: 100 } }
      },
      
      locator: { patchSize: "medium", halfSample: true },
      numOfWorkers: 2
    };

    Quagga.init(settings, function(err) {
      
      if (err) {
          console.log(err);
          return;
      }
      
      Quagga.start();

    });

    Quagga.onProcessed(function(result) {
      var drawingCtx = Quagga.canvas.ctx.overlay,
          drawingCanvas = Quagga.canvas.dom.overlay;

      if (result) {
          if (result.boxes) {
              drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
              result.boxes.filter(function (box) {
                  return box !== result.box;
              }).forEach(function (box) {
                  Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
              });
          }

          if (result.box) {
              Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
          }

          if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
          }
      }
    });

    
  }

  stopScanner() : void {
    Quagga.stop();
  }

}

function initCameraSelection() {
  var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();

  return Quagga.CameraAccess.enumerateVideoDevices()
  .then(function(devices) {
      function pruneText(text) {
          return text.length > 30 ? text.substr(0, 30) : text;
      }
      var $deviceSelection = document.getElementById("deviceSelection");
      while ($deviceSelection.firstChild) {
          $deviceSelection.removeChild($deviceSelection.firstChild);
      }
      devices.forEach(function(device) {
          var $option = document.createElement("option");
          $option.value = device.deviceId || device.id;
          $option.appendChild(document.createTextNode(pruneText(device.label || device.deviceId || device.id)));
          $option.selected = streamLabel === device.label;
          $deviceSelection.appendChild($option);
      });
  });
}

