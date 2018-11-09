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
    
  }

  barcode : string = '';
 
  startScanner() : void {
    startVideo();
  }

  stopScanner() : void {
    stopVideo();
  }

}

var video = null;

function startVideo() {

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('UserMedia not supported')
    return;
  }


  let settings = {
    decoder: { readers: ["code_128_reader", "code_39_reader"] },
    locate: true,
    inputStream: { 
      name: 'Live', 
      type: 'LiveStream', 
      target: document.querySelector('#video-player')
    },
    
    locator: { patchSize: "medium" },
  };


  Quagga.init(settings, function(err) {
  
    if (err) {
        console.log(err);
        return
    }

    Quagga.start();


  });


    Quagga.onDetected(function(result) {

      console.log(result.codeResult.code);
      if(this.barcode != result.codeResult.code) {
        var ul = document.getElementById('barcode-result');
        var li = document.createElement("li");
        li.innerText = result.codeResult.code;
        ul.appendChild(li);
        //document.getElementById('barcode-result').innerText = 'Code: ' +  result.codeResult.code;
      }
      
      this.barcode = result.codeResult.code;
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
                Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 4});
            });
        }

        if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 4});
        }

        if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 6});
        }
      }

    }); 


    var constraints = { 
      audio: false,
      video: { facingMode: "environment" }
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function(stream) {
        video = document.getElementById('video-player') as HTMLVideoElement;
        video.srcObject = stream;
      })
      .catch(function(err){
        alert(err);
        console.log(err)
    })
  


  

      
      
/*
      Quagga.onDetected(function(result) {

        console.log(result.codeResult.code);
        if(this.barcode != result.codeResult.code) {
          var ul = document.getElementById('barcode-result');
          var li = document.createElement("li");
          li.innerText = result.codeResult.code;
          ul.appendChild(li);
          //document.getElementById('barcode-result').innerText = 'Code: ' +  result.codeResult.code;
        }
        
        this.barcode = result.codeResult.code;
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
                  Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 4});
              });
          }
  
          if (result.box) {
              Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 4});
          }
  
          if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 6});
          }
        }
  
      }); 

    })
    .catch(function(err){
      alert(err);
      console.log(err)
    })*/
   
}

function stopVideo() {
  
  try {
    Quagga.stop();
  }
  catch(e) {
    alert(e)
  }

  if(video.srcObject) {
    let tracks = video.srcObject.getTracks();
    
    if(tracks && tracks[0]) {
      let track = tracks[0];
      track.stop();
    }
  }

  video.srcObject = null;
  var canvas = document.getElementById('scanner-canvas') as HTMLCanvasElement;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById('barcode-result').innerText = '';
}