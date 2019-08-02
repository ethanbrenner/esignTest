

//signaturePad JS 




var canvas, canvas2d, signaturePad, outputPad, imageCanvas;
    var mouseX,mouseY,mouseDown = 0;
    var touchX,touchY;
    var lastX,lastY = -1;
    var penSize = 3;
    let randomGlobalVariable = 1;
    
    //run at startup
    function init(){
        
        //returns the canvas element from the html page
        canvas = document.getElementById('mysketchpad');
        canvasOut = document.getElementById('outputPane');
        imageCanvas = document.getElementById("outputImage");
        //gets the 2d version of the canvas
        if(canvas.getContext){
            canvas2d = canvas.getContext('2d');
        }

        canvas2d.width = window.innerWidth;
        canvas2d.height = window.innerHeight;
        //reacting to touch/click events
        
        if(canvas2d){
            //mouse events
            canvas.addEventListener('mousedown', mysketchpad_mouseDown, false);
            canvas.addEventListener('mousemove', mysketchpad_mouseMove,false);
            window.addEventListener('mouseup',mysketchpad_mouseUp,false);

            //touch events
            canvas.addEventListener('touchstart',mysketchpad_touchStart,false);
            canvas.addEventListener('touchend', mysketchpad_touchEnd,false);
            canvas.addEventListener('touchmove',mysketchpad_touchMove,false);
            
        }

        signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255,255,255)',
            penColor: 'rgb(0,0,255)',
            minWidth: 2.8,
            maxWidth: 2.8
        });

        outputPad = new SignaturePad(canvasOut);
        //disables the ability to draw on the output canvas
        outputPad.off();
    }

    //draw line instructions
    function drawLine (canvas2d, x, y, size) {
        r=0; g=0; b=255; a=0;
        canvas2d.strokeStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
        canvas2d.lineCap="round";
        
        //if no value for previous x and y(this is the first point) then set lastX,Y to the current location
        if(lastX==-1){
            lastX=x;
            lastY=y;
        }
        //line construction
        canvas2d.beginPath();
        canvas2d.moveTo(lastX,lastY);
        canvas2d.lineTo(x,y);
        
        canvas2d.lineWidth = size;
        canvas2d.stroke();

        canvas2d.closePath();
        
        lastX=x;
        lastY=y;
    }

    //sets mouseDown to 0, no longer triggers line drawing
    function mysketchpad_mouseUp() {
        mouseDown = 0;
        lastX=-1;
        lastY=-1;
    }

    function mysketchpad_mouseDown() {
        mouseDown=1;
        drawLine(canvas2d,mouseX,mouseY,penSize);
    }

    function mysketchpad_mouseMove(e){
        getMousePos(e);
        //if button pressed, continue drawing the line
        if (mouseDown==1){
            drawLine(canvas2d,mouseX,mouseY,penSize)
        }
    }

    //gets position compared to the 0,0 coord of the canvas
    function getMousePos(e){
        if(!e){
            var e = event;
        }
        if(e.offsetX){
            mouseX=e.offsetX;
            mouseY=e.offsetY;
            //console.log("here is x and y", mouseX, mouseY)
        }
        else if (e.layerX){
            mouseX=e.layerX;
            mouseY=e.layerY;
        }
    }

    //drawing with touch
    function mysketchpad_touchStart(){
        getTouchPos();
        drawLine(canvas2d,touchX,touchY,penSize);
        event.preventDefault(); //prevents accidental scrolling while using touch device
    }

    function mysketchpad_touchEnd() {
        lastX=-1;
        lastY=-1;
    }

    function mysketchpad_touchMove(e){
        getTouchPos(e);
        drawLine(canvas2d,touchX,touchY,penSize);
        event.preventDefault();
    }

    function getTouchPos(e){
        if (!e){
            var e=event;
        }
        if(e.touches){
            if(e.touches.length == 1){ //only using one touchpoint on the touch screen
                var touch = e.touches[0];
                touchX=touch.pageX-touch.target.offsetLeft;
                touchY=touch.pageY-touch.target.offsetTop;
                
            }
        }
    }
    
    function empty(){
        if(signaturePad.isEmpty()){
            return(true);
        }
        return(false);
    }

    function submitSignature(){
        //creates array of signature points
                    
        if(signaturePad.isEmpty())
             console.log("SignaturePadEmpty: " + signaturePad.isEmpty());
               
        else {
             console.log("SignaturePadEmpty: " + signaturePad.isEmpty());
            var data = signaturePad.toData();
                sessionStorage.signatureValue = JSON.stringify(data);
            var inputField = document.getElementById("inputField");
                inputField.value = sessionStorage.signatureValue;
            
            
            //end file write

            
            location.href = "/clientForm_Signature";

             //  Legacy, downloads img to client
             /*
             var downloadData = canvas.toDataURL();
             var imgDLHelper = document.getElementById('imgdlhelper');
             imgDLHelper.setAttribute('href',downloadData.replace('image/octet-stream'));
             imgDLHelper.click();
             */
            }   
        }    

    //undo button functionality
    function undo() {
        var data = signaturePad.toData();
        console.log(data);
        if (data) {
            data.pop();
            signaturePad.fromData(data);
            console.log(data);
        }
    }

    //clears signaturePad of marks and resets data arrays
    //added feature to wipe the data from memory if want the pages reset
    function clearCanvas(){
        canvas2d.clearRect(0,0,canvas.width,canvas.height);
        signaturePad.fromData([]);
        sessionStorage.signatureValue = JSON.stringify([]);
    }

    //resets e-sign page (clears both sketchPad and outputPad)
    //POC for displaying signatures in other locations
    function reset(){
        clearCanvas();
        outputPad.fromData([]);
    }

    function applySignature(sigValue,code){
      
       var sigObject = JSON.parse(sigValue);
       console.log("here is the sig object in apply sig");
       console.log(sigObject);
       var image = new Image();
        outputPad.fromData(sigObject);
        image.onload = function(){
            
            imageCanvas.width = image.width;
            imageCanvas.height = image.height;

            console.log("imageCanvas width and height" + imageCanvas.width + " " + imageCanvas.height);
            console.log("image width and height " + image.width + " " + image.height);
            
            var ctx = imageCanvas.getContext('2d');
           
            ctx.drawImage(image,0,0, image.width, image.height, 0,0, imageCanvas.width, imageCanvas.height);
            console.log("drawing complete");
        }
        image.src = outputPad.toDataURL();
        console.log("sending to imageDrawFunction");

        //forcing code for checking purposes, will need to handle this in the future
        console.log("Printing the current date");
        dateHandler(false);
        

    }
    
    function returnData(){               
        return(JSON.parse(sessionStorage.signatureValue))
    }

    function navTelephone(){
        var nav = document.getElementById("navNext");
        nav.submit();
    }
    function navDecline(){
        location.href = "/";
    }
//apply for the telephone form

function applySignature2(spouseSigValue,code){
    //isInside();
  var spouseSigObject = JSON.parse(spouseSigValue);
  var tempCanvas = document.getElementById('outputPane');
    var tempOutputPad = new SignaturePad(tempCanvas);
    tempOutputPad.off();

    var canvasImage = document.getElementById("spouseOutputImage");
    
    //var temp = returnData();
    //console.log(temp);
   
   var image = new Image();
    tempOutputPad.fromData(spouseSigObject);
    image.onload = function(){
        
        canvasImage.width = image.width;
        canvasImage.height = image.height;

        console.log("canvasimage width and height" + canvasImage.width + " " + canvasImage.height);
        console.log("image width and height " + image.width + " " + image.height);
        
        var ctx = canvasImage.getContext('2d');
       
        ctx.drawImage(image,0,0, image.width, image.height, 0,0, canvasImage.width, canvasImage.height);
        console.log("drawing complete");
    }
    image.src = tempOutputPad.toDataURL();
    console.log("sending to imageDrawFunction");

    console.log("Printing the current date to spouse form")
    dateHandler(true);
}

function applySignature3(sigValue) {
    
    var tempCanvas = document.getElementById('outputPane');
    var tempOutputPad = new SignaturePad(tempCanvas);
    tempOutputPad.off();

    var canvasImage = document.getElementById("outputImage");
    var sigObject = JSON.parse(sigValue);
   
   var image = new Image();
    tempOutputPad.fromData(sigObject);
    image.onload = function(){
        
        canvasImage.width = image.width;
        canvasImage.height = image.height;

        console.log("imageCanvas width and height" + canvasImage.width + " " + canvasImage.height);
        console.log("image width and height " + image.width + " " + image.height);
        
        var ctx = canvas.getContext('2d');
       
        ctx.drawImage(image,0,0, image.width, image.height, 0,0, canvasImage.width, canvasImage.height);
        console.log("drawing complete");
    }
    image.src = tempOutputPad.toDataURL();
    console.log("sending to imageDrawFunction");

    //forcing code value for now, need to fix with variable in the future
    console.log("Printing the current date");
    dateHandler(false);
}


//datehandler takes a code which spot to apply the date to
//use the boolean for picking the spouse or client here
function dateHandler(code){
    var dateCanvas;
    var dateString = createDate();
    if(code == true){
       dateCanvas = document.getElementById("spouseDate");
    }
    else
    {
        dateCanvas = document.getElementById("clientDate");
    }

    var ctx = dateCanvas.getContext('2d');
    ctx.font= '20px Roboto, comic sans';
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(dateString,dateCanvas.width/2,dateCanvas.height/1.1);

}

function createDate(){
    var dateString = new Date();
    return((dateString.getMonth()+1)+"/"+dateString.getDate()+"/"+dateString.getFullYear());
}

function zoomIn(){
    var Page = document.getElementById('body');
    var zoom = parseInt(Page.style.zoom) + 10 +'%'
    Page.style.zoom = zoom;
    return false;
}

function zoomOut(){
    var Page = document.getElementById('body');
    var zoom = parseInt(Page.style.zoom) - 10 +'%'
    Page.style.zoom = zoom;
    return false;
}

/*
this should be an old version of applysig2
function applySignature2(spouseSigValue,code){
    //isInside();
  // var data = JSON.parse(sessionStorage.signatureValue);
  var tempCanvas = document.getElementById('outputPane');
    var tempOutputPad = new SignaturePad(tempCanvas);
    tempOutputPad.off();

    var canvasImage = document.getElementById("spouseOutputImage");
    //var temp = returnData();
    //console.log(temp);
   
   var image = new Image();
    tempOutputPad.fromData(spouseSigValue);
    image.onload = function(){
        
        canvasImage.width = image.width;
        canvasImage.height = image.height;

        console.log("imageCanvas width and height" + canvasImage.width + " " + canvasImage.height);
        console.log("image width and height " + image.width + " " + image.height);
        
        var ctx = canvas.getContext('2d');
       
        ctx.drawImage(image,0,0, image.width, image.height, 0,0, canvasImage.width, canvasImage.height);
        console.log("drawing complete");
    }
    image.src = tempOutputPad.toDataURL();
    console.log("sending to imageDrawFunction");

    console.log("Printing the current date to spouse form")
    dateHandler(true);
}
*/