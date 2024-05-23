//global variables
let gl;
let canvas;
let a_Position;
let a_Normal; 
let u_FragColor;
let u_size;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let a_UV;
let u_lightPos;
let u_GlobalRotateMatrix;
let u_cameraPos;
let u_lightOn;
let u_spotlightOn;
let u_ColorPicker;

let u_spotLightPos;
let u_spotLightDir;
let u_cutOffAngle;
let safe = false ;
const FSIZE =  4;

// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float; 
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_VertPos;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    //uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        //gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        gl_Position = u_ProjectionMatrix * u_ViewMatrix  * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1)));
        //v_Normal = a_Normal;
        v_VertPos = u_ModelMatrix * a_Position;
    }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_ColorPicker;
  uniform vec3 u_cameraPos;
  uniform vec3 u_spotLightPos;
  uniform vec3 u_spotLightDir;
  uniform float u_cutOffAngle;
  uniform bool u_lightOn;
  uniform bool u_spotlightOn;


  varying vec4 v_VertPos;
  void main() {

    if ( u_whichTexture == -3){
        gl_FragColor = vec4((v_Normal + 1.0) /2.0 , 1.0);
      }

  else if ( u_whichTexture == -2){
    gl_FragColor = u_FragColor;
  }
  else if( u_whichTexture == -1){ 
    gl_FragColor = vec4(v_UV, 1.0,  1.0);
  }
  else if ( u_whichTexture == 0){
  gl_FragColor = texture2D(u_Sampler0, v_UV);
  } 
  else if ( u_whichTexture == 1){
    gl_FragColor = texture2D(u_Sampler1, v_UV);
    } 

    else if ( u_whichTexture == 2){
        gl_FragColor = texture2D(u_Sampler2, v_UV);
    }
    else if ( u_whichTexture == 3){
        gl_FragColor = texture2D(u_Sampler3, v_UV);
    }
    else if ( u_whichTexture == 4){
        gl_FragColor = texture2D(u_Sampler4, v_UV);
    }
  else{
    gl_FragColor = vec4(1, 0.2, 0.2, 1);
  }

  vec3 lightVector =  u_lightPos - vec3(v_VertPos);
  float r = length(lightVector);
  vec3 L = normalize(lightVector);
  vec3 N = normalize(v_Normal);
  float NDotL = max(dot(N, L), 0.0);

  vec3 R = reflect(-L,N);
  vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

  
  float specular = pow( max(dot(E, R), 0.0), 10.0);
  
  vec3 diffuse = vec3( 1.0, 1.0, 0.9) * vec3(u_ColorPicker) * NDotL * 0.7;
  vec3 ambient = vec3(gl_FragColor) * 0.3;



  //spot light calculations
  vec3 spotLightVector = u_spotLightPos - vec3(v_VertPos);
  vec3 SL = normalize(spotLightVector);
  float NDotSL = max(dot(N, SL), 0.0);
  vec3 SR = reflect(-SL, N);

  float spotSpecular = pow(max(dot(E, SR), 0.0), 10.0);
  vec3 spotDiffuse = vec3(u_ColorPicker) * NDotSL * 0.7;

  vec3 spotlightDirection = normalize(u_spotLightDir);
  float spotEffect = dot(SL, -spotlightDirection);

  float cutoff = cos(radians(u_cutOffAngle));

  if (spotEffect > cutoff) {
    float spotlightFactor = pow(spotEffect, 5.0); // Exponent can control the sharpness of the spotlight
    spotDiffuse *= spotlightFactor;
    spotSpecular *= spotlightFactor;
    } 
    else {
    // If outside the spotlight, reduce spotlight influence
    spotDiffuse *= 0.1;
    spotSpecular *= 0.1;
    }
  

  if (u_lightOn && !u_spotlightOn){
    gl_FragColor =  vec4( specular + diffuse + ambient, 1.0);
  }
  else if ( !u_lightOn && u_spotlightOn){
    vec3 finalColor = ambient  + spotDiffuse + spotSpecular;
    gl_FragColor = vec4(finalColor, 1.0);
  }

  else if ( u_lightOn && u_spotlightOn){
    gl_FragColor =  vec4( specular + diffuse + ambient + spotDiffuse + spotSpecular , 1.0);
  }
  }`
;

function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl" , {preserveDrawingBuffer: true});
    //gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (! u_ModelMatrix){
        console.log("Failed to get the storage location of u_ModelMatrix");
        return;
    }

    

    //u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    //if (! u_GlobalRotateMatrix){
     //   console.log("Failed to get the storage location of u_GlobalRotateMatrix");
       // return;
    //}

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix){
        console.log("Failed to get the storage location of u_NormalMatrix");
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix){
        console.log("Failed to get the storage location of u_ViewMatrix");
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix){
        console.log("Failed to get the storage location of u_ProjectionMatrix");
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0){
        console.log("Failed to get the storage location of u_Sampler0");
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1){
        console.log("Failed to get the storage location of u_Sampler1");
        return;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2){
        console.log("Failed to get the storage location of u_Sampler2");
        return;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3){
        console.log("Failed to get the storage location of u_Sampler3");
        return;
    }
    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (!u_Sampler4){
        console.log("Failed to get the storage location of u_Sampler4");
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture){
        console.log("Failed to get the storage location of u_whichTexture");
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos){
        console.log("Failed to get the storage location of u_lightPos");
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos){
        console.log("Failed to get the storage location of u_cameraPos");
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn){
        console.log("Failed to get the storage location of u_lightOn");
        return;
    }

    u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
    if (!u_spotlightOn){
        console.log("Failed to get the storage location of u_spotlightOn");
        return;
    }

    u_ColorPicker = gl.getUniformLocation(gl.program, 'u_ColorPicker');
    if (!u_ColorPicker){
        console.log("Failed to get the storage location of u_ColorPicker");
        return;
    }

    u_spotLightPos = gl.getUniformLocation(gl.program, 'u_spotLightPos');
    if (!u_spotLightPos){
        console.log("Failed to get the storage location of u_spotLightPos");
        return;
    }

    u_spotLightDir = gl.getUniformLocation(gl.program, 'u_spotLightDir');
    if (!u_spotLightDir){
        console.log("Failed to get the storage location of u_spotLightDir");
        return;
    }

    u_cutOffAngle = gl.getUniformLocation(gl.program, 'u_cutOffAngle');
    if (!u_cutOffAngle){
        console.log("Failed to get the storage location of u_cutOffAngle");
        return;
    }

    

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, identityM.elements);


}

//constants
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_lightOn = false;
let g_spotlightOn = false;
let g_spotlightPos = [10.0, 0.0, 10.0];
let g_globalAngle = 0;
let g_globalAngleY = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_finalAngle = 0;
let g_yellowAnimation = false;
let g_eyeYdim = 1;
let h = 14;
let camera;
let g_normal = false
let g_lightPos = [0,1,-2]
let g_lightAnimation = false;
function addActionsForAllHtmlUI(){

    document.getElementById('spotlightOn').onclick = function() {g_spotlightOn = true ;  camera.eye.elements[0] = 10;
        camera.eye.elements[1] = 10;
        camera.eye.elements[2] = 10;

        camera.at.elements[0] = 11;
        camera.at.elements[1] = 10;
        camera.at.elements[2] = 11;};
    document.getElementById('spotlightOff').onclick = function() {g_spotlightOn = false;  camera.eye.elements[0] = -4;
        camera.eye.elements[1] = 0;
        camera.eye.elements[2] = 0;

        camera.at.elements[0] = -3;
        camera.at.elements[1] = 0;
        camera.at.elements[2] = 0;};

    

    document.getElementById('redSlider').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;  });
    document.getElementById('greenSlider').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlider').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100; });




    document.getElementById('animationLightOn').onclick = function() {g_lightAnimation = true;};
    document.getElementById('animationLightOff').onclick = function() {g_lightAnimation = false;};

    document.getElementById("lightX").addEventListener('mousemove', function(ev) {if ( ev.buttons == 1) {g_lightPos[0] = this.value/ 10; renderAllShapes();}});
    document.getElementById("lightY").addEventListener('mousemove', function(ev) {if ( ev.buttons == 1) {g_lightPos[1] = this.value/ 10; renderAllShapes();}});
    document.getElementById("lightZ").addEventListener('mousemove', function(ev) {if ( ev.buttons == 1) {g_lightPos[2] = this.value/ 10; renderAllShapes();}});


    document.getElementById("spotlightY").addEventListener('mousemove', function(ev) {if ( ev.buttons == 1) {g_spotlightPos[1] = this.value; renderAllShapes();}});
    document.getElementById("spotlightX").addEventListener('mousemove', function(ev) {if ( ev.buttons == 1) {g_spotlightPos[0] = this.value; renderAllShapes();}});
    document.getElementById("spotlightZ").addEventListener('mousemove', function(ev) {if ( ev.buttons == 1) {g_spotlightPos[2] = this.value; renderAllShapes();}});

    document.getElementById('animationYellowOn').onclick = function() {g_yellowAnimation = true;};
    document.getElementById('animationYellowOff').onclick = function() {g_yellowAnimation = false;};

    document.getElementById('lightOn').onclick = function() {g_lightOn = true;};
    document.getElementById('lightOff').onclick = function() {g_lightOn = false;};

    document.getElementById('normalOn').onclick = function() {g_normal = true;};
    document.getElementById('normalOff').onclick = function() {g_normal = false;};

    
    document.getElementById('yellowSlider').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes();});
    document.getElementById('magentaSlider').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes();});
    document.getElementById('finalSlider').addEventListener('mousemove', function() {g_finalAngle = this.value; renderAllShapes();});
}


function initTextures(gl, n){


    // var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler0');
    // if( !u_Sampler){
    //     console.log('Failed to get storage location of u_sampler');
    // }

    var image = new Image();
    var image2 = new Image();
    var image3 = new Image();
    var image4 = new Image(); 
    var imageLava = new Image(); 
    
    if (!image || !image2  || !image3 || !image4 || !imageLava){
        console.log("Failed to create image object");
    }

    image.onload = function() {sendTextureToGLSL(image, image2, image3, image4, imageLava);};
    image.src = 'sky.jpg';

    //image2.onload = function() {sendTextureToGLSL(image2);};
    image2.src = 'grass1.jpg';
    image3.src = 'stone.jpg';
    image4.src = 'wood.jpg';
    imageLava.src = 'lava.jpg';
    
    return true;

}



function sendTextureToGLSL(image, image1, image2, image3, image4){

    var texture = gl.createTexture();
    var texture1 = gl.createTexture();
    var texture2 = gl.createTexture();
    var texture3 = gl.createTexture();
    var texture4 = gl.createTexture();

    if (!texture || !texture1 || !texture2 || !texture3  || !texture4 ){
        console.log("Failed to create texture object");
            return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);


    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    gl.uniform1i(u_Sampler0, 0);
    

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(u_Sampler1, 1); // Bind texture unit 1 to sampler


    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(u_Sampler2, 2); // Bind texture unit 1 to sampler

    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image3);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(u_Sampler3, 3); // Bind texture unit 1 to sampler

    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, texture4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image4);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(u_Sampler4, 4); // Bind texture unit 1 to sampler
   
    console.log('Finsihed loading texture');

}

var lastx = 0;
var lasty = 0;
var isDragging = false;
var globalRotMat = new Matrix4();
function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForAllHtmlUI();
    initTriangles3DInterleaved();
    //Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function(ev) {
        // Check if the left mouse button is clicked and the shift key is pressed
        if (ev.button === 0 && ev.shiftKey) {
            clicked(ev);
        }
        //else if (ev.button === 0) {
        //dragged(ev);
        
            isDragging = true;
            lastx = ev.clientX;
            lasty = ev.clientY;
        

    };

    canvas.onmouseup  = function(ev) {
        isDragging  = false;
    }
    
    
    canvas.onmousemove = function(ev) {
        // Check if the left mouse button is clicked, the shift key is pressed,
        // and no other buttons are pressed
        if (ev.buttons === 1 && ev.shiftKey && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
            clicked(ev);
        }

        //else if (ev.buttons === 1) {
          //  dragged(ev);
            //dragged(ev)
        //}
        if ( !isDragging){
            return;
        }
        var x = ev.clientX;
        var y = ev.clientY;
        var factor = 100/ canvas.height;

        var dx = x - lastx;
        var dy= y - lasty;

        
        
        if (dx < 0){
            camera.panLeft();
        }
        else if ( dx > 0){
            camera.panRight();
        }

        if ( dy > 0){
            camera.at.elements[1]  -= 0.04;
        }

        else if ( dy < 0){
            camera.at.elements[1]  += 0.04;
        }



        //globalRotMat.rotate(angle2, 1,0,0);
        //globalRotMat.rotate(angle1, 0,1,0);
        //camera.panLeft();
        //gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

        lastx = x;
        lasty = y;



    };

    /*
    canvas.onmousedown = function(ev) {
        // Check if the left mouse button is clicked and the shift key is pressed
        if (ev.button === 0 && ev.shiftKey) {
            clicked(ev);
        }
        else if (ev.button === 0) {
            // Set up event listener for mousemove only when mouse is pressed down
            canvas.onmousemove = function(ev) {
                // Call dragged function
                dragged(ev);
            };
        }
    };
    
    canvas.onmouseup = function(ev) {
        // Remove the mousemove event listener when mouse button is released
        canvas.onmousemove = null;
    };
    
    // Prevent default browser behavior for mousemove event
    canvas.onmousemove = function(ev) {
        ev.preventDefault();
    };
    */
   camera  = new Camera();
   document.onkeydown = keydown;

    // Specify the color for clearing <canvas>
    initTextures();

    gl.clearColor(0.45, 0.65, 0.98, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime; 

function sendTexttoHTML(text, HtmlID){
    var elm = document.getElementById(HtmlID);
    if (!elm){
        console.log("failed to get id for html");
    }
    elm.innerHTML = text;
}

function tick(){
    
    var begintimer = performance.now();
    g_seconds = performance.now()/1000 - g_startTime;
    updateAnimationAngles();
    renderAllShapes();
    requestAnimationFrame(tick);
    var elapsed = performance.now() - begintimer
    sendTexttoHTML( "ms: " + Math.floor(elapsed)+ "fps: " + Math.floor(10000 / elapsed) / 10, "output")

    //console.log( safe);
    if ( !safe ){
        h -= 0.0027;
        if ( h < 0.4){
            //document.getElementById("wining").innerHTML = "Oh no you lost";
            h = 13;
        }
        

    }
    if ( safe){
        //document.getElementById("wining").innerHTML = "Congragts youve won!!";
    }
}
let g_BoxRotateAngle = 0.0;
let currentEyeSize = 1.0;
let animationInProgress = false;
let isEyeShrunk = false; // Track whether the eye is currently shrunk

// Animation loop function
function animateEye() {
    // Adjust the target eye size based on the current state
    let targetEyeSize;
    if (isEyeShrunk) {
        targetEyeSize = 0.15;
    } else {
        targetEyeSize = 1.0;
    }
    

    if (currentEyeSize < targetEyeSize) {
        currentEyeSize += 0.1; // Adjust the step size as needed
    } else if (currentEyeSize > targetEyeSize) {
        currentEyeSize -= 0.1; // Adjust the step size as needed
    } else {
        // Stop the animation when the target size is reached
        animationInProgress = false;
        return;
    }
    
    // Update the eye size
    g_eyeYdim = currentEyeSize;
    if (currentEyeSize < 0.17){
        isEyeShrunk = false;
    }

    // Request the next frame
    requestAnimationFrame(animateEye);
}



//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];
function convertCordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x,y]);

}
function updateAnimationAngles(){
    if (g_yellowAnimation){
        g_yellowAngle = (15 * Math.sin(g_seconds));
    }

    g_BoxRotateAngle =  (85 * Math.sin(g_seconds));
    if (g_lightAnimation){
        g_lightPos[0] = Math.cos(g_seconds);
    }
    //g_lightPos[1] = Math.cos(g_seconds);
    ////g_lightPos[2] = Math.cos(g_seconds);
}

var g_eye = new Vector3([0,0,3]);
var g_at = new Vector3 ([0,0,-100]);
var g_up = new Vector3 ([0,1,0]);



var r;
var theta
var zoneNum = 2;

function keydown(ev){
    if (ev.keyCode == 68){
        camera.rightFunc();
    }
    else if (ev.keyCode == 65){
        //g_eye.elements[0] -= 0.2;
        camera.leftFunc();
    }
    else if (ev.keyCode == 87 ){
        camera.forward();
    }
    else if (ev.keyCode == 83){
        camera.backwards();
    }

    else if (ev.keyCode == 81){
        camera.panLeft();
    }
    else if (ev.keyCode == 69){
        camera.panRight();
    }
    else if (ev.keyCode == 90){ // z
        camera.addBlock();
    }
    else if (ev.keyCode == 88){ // x
        camera.deleteBlock();
    }

    else if (ev.keyCode == 80){
        zoneNum = 3;
    }
    else if (ev.keyCode == 79){
        zoneNum = 2;
    }


    renderAllShapes();
}




var g_map = [
    [
        [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],

],[

    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],
],
[
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],
],
[
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],

], [
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,1,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
        [1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1],
]

];

function drawMap(){
    
    for ( z= 0; z < 5; z++ ){
        for (x= 0; x < 32; x++ ){
            for  (y= 0; y < 32; y++ ){
            
                
                if (g_map[z][x][y] == 1 ){
                
                    var zone = new Cube();
                    if (g_normal){
                        //zone.normalMatrix.setInverseOf(zone.matrix).transpose();
                        zone.textureNum = -3;
                    }
                    else{
                    zone.textureNum = zoneNum;
                     }
                    zone.color = [1.0, 1.0, 1.0, 1.0];
                    zone.matrix.translate(x, z - 0.74 , y );
                    //zone.normalMatrix.setInverseOf(zone.matrix).transpose();
                    zone.renderFasterInterleaved();
                }
            
        }
    }
}
}


function renderAllShapes(){
   
    //console.log(g_selectedColor[0], g_selectedColor[1], g_selectedColor[2]);
    // if ( g_spotlightOn){
    //     camera.eye.elements[0] = 10;
    //     camera.eye.elements[1] = 10;
    //     camera.eye.elements[2] = 10;

    //     camera.at.elements[0] = 11;
    //     camera.at.elements[1] = 10;
    //     camera.at.elements[2] = 11;

    // }

    var projMat=new Matrix4()
    projMat.setPerspective(30, canvas.width/canvas.height, 0.1, 100)
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat=new Matrix4()
    viewMat.setLookAt(camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],    camera.at.elements[0], camera.at.elements[1], camera.at.elements[2],     camera.up.elements[0], camera.up.elements[1], camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    //globalRotMat.rotate(g_globalAngle, 0,1,0).rotate(g_globalAngleY, 1,0,0);
    //gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]  );
    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform3f(u_ColorPicker, g_selectedColor[0], g_selectedColor[1], g_selectedColor[2]);

    //spot light
    gl.uniform3f(u_spotLightPos, 10.0, 7.0, 10.0);
    gl.uniform3f(u_spotLightDir, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
    gl.uniform1f(u_cutOffAngle, 10.0);
    gl.uniform1i(u_spotlightOn, g_spotlightOn);

  



    var light = new Cube();
    light.color = [2,2,0,1];
    //light.matrix.translate(34, 0.5, 32);
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-0.1, -0.1, -0.1);
    light.textureNum = -2;
    light.renderFasterInterleaved();
    
    drawMap();
    var ground = new Cube();
    ground.color = [1.0 , 0.0, 0.0, 1.0];
    if (g_normal){
        ground.textureNum = -3;
    }
    else{
    ground.textureNum = 1;
     }
    ground.matrix.translate(0, -0.75, 0.0);
    ground.matrix.scale(90,0,90);
    ground.matrix.translate(-0.3, 0, -0.3);
    ground.renderFasterInterleaved();

    var sphere = new Sphere();
    sphere.generateVertices();
    if (g_normal){
        sphere.textureNum = -3;
    }
    else{
    sphere.textureNum = zoneNum;
     }
    sphere.matrix.translate(0, 0.7, 0);
    sphere.render();


    var ohno = new Cube();
    ohno.color = [1.0 , 0.0, 0.0, 1.0];
    if (g_normal){
        ohno.textureNum = -3;
    }
    else{
    ohno.textureNum = 4;
     }
    ohno.matrix.translate(0, -0.75, 0.0);
    ohno.matrix.scale(90,1,90);
    ohno.matrix.translate(-0.3, h, -0.3);
    ohno.renderFasterInterleaved();


    var sky = new Cube();
    sky.color = [1.0, 0.0, 0.0, 1.0 ];
     if (g_normal){
        sky.textureNum = -3;
    }
    else{
    sky.textureNum = 0;
     }
    sky.matrix.scale(-79,-79,-79);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.renderFasterInterleaved();

    var test = new Cube(0.98,0.68, 0.45,1);

    if (g_normal){
        test.textureNum = -3;
        
    }
    else{
        test.textureNum = -2;
     }

    test.matrix.scale(0.4, 0.4, 0.4);
    
    test.matrix.translate(-2, -0.75, 4);
    test.matrix.rotate(g_BoxRotateAngle,0,1,0);
    
    
    test.normalMatrix.setInverseOf(test.matrix).transpose();
    test.renderFasterInterleaved();


    // arm 1
    var body = new Cube(0.98,0.68, 0.45,1);

    if (g_normal){
        body.textureNum = -3;
        
    }
    else{
        body.textureNum = -2;
     }

    
    //body.color = [1.0, 0.0, 0.0, 1.0];
    body.matrix.translate(-.25, -0.75, 0.0);
    body.matrix.rotate(0,1,0,0);
    
    body.matrix.scale(0.4, 0.4, 0.4);
    body.normalMatrix.setInverseOf(body.matrix).transpose();
    body.renderFasterInterleaved();

    //body.textureNum = -2;
     // arm 1 ------------------------------------------------------------------------------------
    var leftArm = new Cube(0.98,0.68, 0.45,1);
    //leftArm.color = [1,1,0,1];
    leftArm.matrix.rotate(-90, 0,1,0);
    leftArm.matrix.rotate(90, 1,0,0);

    leftArm.matrix.rotate(-g_yellowAngle,1,0,0);
    var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.17, 0.5, 0.17);
    leftArm.matrix.translate(0.2, 0.15, 3.3);
    if (g_normal){
        leftArm.textureNum = -3;
    }
    else{
        leftArm.textureNum = -2;
     }
    leftArm.normalMatrix.setInverseOf(leftArm.matrix).transpose();
    leftArm.renderFasterInterleaved();

    
    var box = new Cube(0.98,0.68, 0.45,1);
    //box.color = [1,0,1,1];
    box.matrix = yellowCoordinatesMat;
    box.matrix.rotate(-45, 1 ,0,0);
    box.matrix.rotate(-g_magentaAngle, 0,1,0);
    box.matrix.scale(0.14, 0.23, 0.14);
    box.matrix.translate(0.38, -0.65, 5.6);
    if (g_normal){
        box.textureNum = -3;
    }
    else{
        box.textureNum = -2;
     }
    box.normalMatrix.setInverseOf(box.matrix).transpose();
    box.renderFasterInterleaved();

    
    var top = new Cube(1,1,1,1);
    //top.color = [0,1,1,1];
    top.matrix = yellowCoordinatesMat;
    box.matrix.rotate(-90, 0 ,1,0);
    top.matrix.rotate(-g_finalAngle, 0,0,1);
    top.matrix.scale(0.7, 0.7, 0.7);
    top.matrix.translate(0.3, 1.4, -1.2);
    if (g_normal){
        top.textureNum = -3;
    }
    else{
        top.textureNum = -2;
     }
    top.normalMatrix.setInverseOf(top.matrix).transpose();
    top.renderFasterInterleaved();

    // arm 2---------------------------------------------------------
    var leftArm2 = new Cube(0.98,0.68, 0.45,1);
    //leftArm2.color = [1,1,0,1];
    leftArm2.matrix.rotate(-90, 0,1,0);
    leftArm2.matrix.rotate(90, 1,0,0);

    leftArm2.matrix.rotate(-g_yellowAngle,1,0,0);
    var yellowCoordinatesMat2 = new Matrix4(leftArm2.matrix);
    leftArm2.matrix.scale(0.17, 0.5, 0.17);
    leftArm2.matrix.translate(1.35, 0.15, 3.3);
    if (g_normal){
        leftArm2.textureNum = -3;
    }
    else{
        leftArm2.textureNum = -2;
     }
    leftArm2.normalMatrix.setInverseOf(leftArm2.matrix).transpose();
    leftArm2.renderFasterInterleaved();

    
    var box2 = new Cube(0.98,0.68, 0.45,1);
    //box2.color = [1,0,1,1];
    box2.matrix = yellowCoordinatesMat2;
    box2.matrix.rotate(-45, 1 ,0,0);
    box2.matrix.rotate(-g_magentaAngle, 0,1,0);
    box2.matrix.scale(0.14, 0.23, 0.14);
    box2.matrix.translate(1.78, -0.65, 5.6);
    if (g_normal){
        box2.textureNum = -3;
    }
    else{
        box2.textureNum = -2;
     }
    box2.normalMatrix.setInverseOf(box2.matrix).transpose();
    box2.renderFasterInterleaved();

    
    var top2 = new Cube(1,1,1,1);
    //top2.color = [0,1,1,1];
    top2.matrix = yellowCoordinatesMat2;
    box2.matrix.rotate(-90, 0 ,1,0);
    top2.matrix.rotate(-g_finalAngle, 0,0,1);
    top2.matrix.scale(0.7, 0.7, 0.7);
    top2.matrix.translate(0.3, 1.4, -1.2);
    if (g_normal){
        top2.textureNum = -3;
    }
    else{
        top2.textureNum = -2;
     }
    top2.normalMatrix.setInverseOf(top2.matrix).transpose();
    top2.renderFasterInterleaved();
    

    // arm 3 ----------------------------------------------------------------------------------------------
    var leftArm3 = new Cube(0.98,0.68, 0.45,1);
    //leftArm3.color = [1,1,0,1];
    leftArm3.matrix.rotate(-90, 1,0,0);
    leftArm3.matrix.rotate(90, 0,1,0);
    leftArm3.matrix.rotate(g_yellowAngle,0,0,1); 
    var yellowCoordinatesMat3 = new Matrix4(leftArm3.matrix);
    leftArm3.matrix.scale(0.17, 0.5, 0.17);
    leftArm3.matrix.translate(3.3, -0.35, -1.3);
    
    if (g_normal){
        leftArm3.textureNum = -3;
    }
    else{
        leftArm3.textureNum = -2;
     }
    leftArm3.normalMatrix.setInverseOf(leftArm3.matrix).transpose();
    leftArm3.renderFasterInterleaved();

    var box3 = new Cube(0.98,0.68, 0.45,1);
    //box3.color = [1,0,1,1];
    box3.matrix = yellowCoordinatesMat3;
    box3.matrix.rotate(-45, 0 ,0,1);
    box3.matrix.rotate(-g_magentaAngle, 0,1,0);
    box3.matrix.scale(0.14, 0.23, 0.14);
    box3.matrix.translate(0.98, 2.9, -1.5);
    if (g_normal){
        box3.textureNum = -3;
    }
    else{
        box3.textureNum = -2;
     }
    box3.normalMatrix.setInverseOf(box3.matrix).transpose();
    box3.renderFasterInterleaved();

    var top3 = new Cube(1,1,1,1);
    //top3.color = [0,1,1,1];
    top3.matrix = yellowCoordinatesMat3;
    box3.matrix.rotate(-90, 0 ,0,1);
    top3.matrix.rotate(-g_finalAngle, 0,0,1);
    top3.matrix.scale(0.7, 0.7, 0.7);
    top3.matrix.translate(-2.4, 0.1, 0.16);
    if (g_normal){
        top3.textureNum = -3;
    }
    else{
        top3.textureNum = -2;
     }
    top3.normalMatrix.setInverseOf(top3.matrix).transpose();
    top3.renderFasterInterleaved();


    // arm 4----------------------------------------------------------------------------------------------
    var leftArm4 = new Cube(0.98,0.68, 0.45,1);
    //leftArm3.color = [1,1,0,1];
    leftArm4.matrix.rotate(-90, 1,0,0);
    leftArm4.matrix.rotate(90, 0,1,0);
    leftArm4.matrix.rotate(g_yellowAngle,0,0,1); 
    var yellowCoordinatesMat4 = new Matrix4(leftArm4.matrix);
    leftArm4.matrix.scale(0.17, 0.5, 0.17);
    leftArm4.matrix.translate(3.3, -0.35, -0.20);
    if (g_normal){
        leftArm4.textureNum = -3;
    }
    else{
        leftArm4.textureNum = -2;
     }
    leftArm4.normalMatrix.setInverseOf(leftArm4.matrix).transpose();
    leftArm4.renderFasterInterleaved();

    var box4 = new Cube(0.98,0.68, 0.45,1);
    //box3.color = [1,0,1,1];
    box4.matrix = yellowCoordinatesMat4;
    box4.matrix.rotate(-45, 0 ,0,1);
    box4.matrix.rotate(-g_magentaAngle, 0,1,0);
    box4.matrix.scale(0.14, 0.23, 0.14);
    box4.matrix.translate(0.98, 2.9, -0.2);
    if (g_normal){
        box4.textureNum = -3;
    }
    else{
        box4.textureNum = -2;
     }
    box4.normalMatrix.setInverseOf(box4.matrix).transpose();
    box4.renderFasterInterleaved();

    var top4 = new Cube(1,1,1,1);
    //top3.color = [0,1,1,1];
    top4.matrix = yellowCoordinatesMat4;
    box4.matrix.rotate(-90, 0 ,0,1);
    top4.matrix.rotate(-g_finalAngle, 0,0,1);
    top4.matrix.scale(0.7, 0.7, 0.7);
    top4.matrix.translate(-2.4, 0.4, 0.16);
    if (g_normal){
        top4.textureNum = -3;
    }
    else{
        top4.textureNum = -2;
     }
    top4.normalMatrix.setInverseOf(top4.matrix).transpose();
    top4.renderFasterInterleaved();


    // arm five ----------------------------------------------------------------------------------------------
    var leftArm5 = new Cube(0.98,0.68, 0.45,1);
    //leftArm3.color = [1,1,0,1];
    leftArm5.matrix.rotate(90, 1,0,0);
    leftArm5.matrix.rotate(90, 0,1,0);
    leftArm5.matrix.rotate(-g_yellowAngle,0,0,1); 
    var yellowCoordinatesMat5 = new Matrix4(leftArm5.matrix);
    leftArm5.matrix.scale(0.17, 0.5, 0.17);
    leftArm5.matrix.translate(-4.1, 0.45, -1.4);
    
    
    
    if (g_normal){
        leftArm5.textureNum = -3;
    }
    else{
        leftArm5.textureNum = -2;
     }
    leftArm5.normalMatrix.setInverseOf(leftArm5.matrix).transpose();
    leftArm5.renderFasterInterleaved();

    var box5 = new Cube(0.98,0.68, 0.45,1);
    //box3.color = [1,0,1,1];
    box5.matrix = yellowCoordinatesMat5;
    box5.matrix.rotate(45, 0 ,0,1);
    box5.matrix.rotate(-g_magentaAngle, 0,1,0);
    box5.matrix.scale(0.14, 0.23, 0.14);
    box5.matrix.translate(0.2, 4.0, -1.6);
    if (g_normal){
        box5.textureNum = -3;
    }
    else{
        box5.textureNum = -2;
     }
    box5.normalMatrix.setInverseOf(box5.matrix).transpose();
    box5.renderFasterInterleaved();

    var top5 = new Cube(1,1,1,1);
    //top3.color = [0,1,1,1];
    top5.matrix = yellowCoordinatesMat5;
    box5.matrix.rotate(-90, 0 ,0,1);
    top5.matrix.rotate(-g_finalAngle, 0,0,1);
    top5.matrix.scale(0.7, 0.7, 0.7);
    top5.matrix.translate(-2.4, 0.1, 0.16);
    if (g_normal){
        top5.textureNum = -3;
    }
    else{
        top5.textureNum = -2;
     }
    top5.normalMatrix.setInverseOf(top5.matrix).transpose();
    top5.renderFasterInterleaved();



    var leftArm6 = new Cube(0.98,0.68, 0.45,1);
    //leftArm3.color = [1,1,0,1];
    leftArm6.matrix.rotate(90, 1,0,0);
    leftArm6.matrix.rotate(90, 0,1,0);
    leftArm6.matrix.rotate(-g_yellowAngle,0,0,1); 
    var yellowCoordinatesMat6 = new Matrix4(leftArm6.matrix);
    leftArm6.matrix.scale(0.17, 0.5, 0.17);
    leftArm6.matrix.translate(-4.1, 0.45, -0.3);
    if (g_normal){
        leftArm6.textureNum = -3;
    }
    else{
        leftArm6.textureNum = -2;
     }
    leftArm6.normalMatrix.setInverseOf(leftArm6.matrix).transpose();
    leftArm6.renderFasterInterleaved();

    var box6 = new Cube(0.98,0.68, 0.45,1);
    //box3.color = [1,0,1,1];
    box6.matrix = yellowCoordinatesMat6;
    box6.matrix.rotate(45, 0 ,0,1);
    box6.matrix.rotate(-g_magentaAngle, 0,1,0);
    box6.matrix.scale(0.14, 0.23, 0.14);
    box6.matrix.translate(0.2, 4.0, -0.4);
    if (g_normal){
        box6.textureNum = -3;
    }
    else{
        box6.textureNum = -2;
     }
    box6.normalMatrix.setInverseOf(box6.matrix).transpose();
    box6.renderFasterInterleaved();
    
    var top6 = new Cube(1,1,1,1);
    //top3.color = [0,1,1,1];
    top6.matrix = yellowCoordinatesMat6;
    box6.matrix.rotate(-90, 0 ,0,1);
    top6.matrix.rotate(-g_finalAngle, 0,0,1);
    top6.matrix.scale(0.7, 0.7, 0.7);
    top6.matrix.translate(-2.4, -0.1, 0.16);
    if (g_normal){
        top6.textureNum = -3;
    }
    else{
        top6.textureNum = -2;
     }
    top6.normalMatrix.setInverseOf(top6.matrix).transpose();
    top6.renderFasterInterleaved();

    // arm7----------------------------------------------------------------------------------------------
    var leftArm7 = new Cube(0.98,0.68, 0.45,1);
    //leftArm.color = [1,1,0,1];
    leftArm7.matrix.rotate(-90, 0,1,0);
    leftArm7.matrix.rotate(-90, 1,0,0);

    leftArm7.matrix.rotate(g_yellowAngle,1,0,0);
    var yellowCoordinatesMat7 = new Matrix4(leftArm7.matrix);
    leftArm7.matrix.scale(0.17, 0.5, 0.17);
    leftArm7.matrix.translate(0.05, -0.05, -4.3);
    if (g_normal){
        leftArm7.textureNum = -3;
    }
    else{
        leftArm7.textureNum = -2;
     }
    leftArm7.normalMatrix.setInverseOf(leftArm7.matrix).transpose();
    leftArm7.renderFasterInterleaved();
    
    var box7 = new Cube(0.98,0.68, 0.45,1);
    //box.color = [1,0,1,1];
    box7.matrix = yellowCoordinatesMat7;
    box7.matrix.rotate(45, 1 ,0,0);
    box7.matrix.rotate(g_magentaAngle, 1,0,0);
    box7.matrix.scale(0.14, 0.23, 0.14);
    box7.matrix.translate(0.26, -0.8, -6);
    if (g_normal){
        box7.textureNum = -3;
    }
    else{
        box7.textureNum = -2;
     }
    box7.normalMatrix.setInverseOf(box7.matrix).transpose();
    box7.renderFasterInterleaved();

    var top7 = new Cube(1,1,1,1);
    //top.color = [0,1,1,1];
    top7.matrix = yellowCoordinatesMat7;
    box7.matrix.rotate(-90, 0 ,1,0);
    top7.matrix.rotate(g_finalAngle, 0,0,1);
    top7.matrix.scale(0.7, 0.7, 0.7);
    top7.matrix.translate(0.3, 1.4, -1.2);
    if (g_normal){
        top7.textureNum = -3;
    }
    else{
        top7.textureNum = -2;
     }
    top7.normalMatrix.setInverseOf(top7.matrix).transpose();
    top7.renderFasterInterleaved();



    //arm 8 -----------------------------------------------------------------------------------------
    var leftArm8 = new Cube(0.98,0.68, 0.45,1);
    //leftArm.color = [1,1,0,1];
    leftArm8.matrix.rotate(-90, 0,1,0);
    leftArm8.matrix.rotate(-90, 1,0,0);

    leftArm8.matrix.rotate(g_yellowAngle,1,0,0);
    var yellowCoordinatesMat8 = new Matrix4(leftArm8.matrix);
    leftArm8.matrix.scale(0.17, 0.5, 0.17);
    leftArm8.matrix.translate(1.2, -0.05, -4.3);
    if (g_normal){
        leftArm8.textureNum = -3;
    }
    else{
        leftArm8.textureNum = -2;
     }
    leftArm8.normalMatrix.setInverseOf(leftArm8.matrix).transpose();
    leftArm8.renderFasterInterleaved();


    var box8 = new Cube(0.98,0.68, 0.45,1);
    //box.color = [1,0,1,1];
    box8.matrix = yellowCoordinatesMat8;
    box8.matrix.rotate(45, 1 ,0,0);
    box8.matrix.rotate(g_magentaAngle, 1,0,0);
    box8.matrix.scale(0.14, 0.23, 0.14);
    box8.matrix.translate(1.66, -0.8, -6);
    if (g_normal){
        box8.textureNum = -3;
    }
    else{
        box8.textureNum = -2;
     }
    box8.normalMatrix.setInverseOf(box8.matrix).transpose();
    box8.renderFasterInterleaved();


    var top8 = new Cube(1,1,1,1);
    //top.color = [0,1,1,1];
    top8.matrix = yellowCoordinatesMat8;
    box8.matrix.rotate(-90, 0 ,1,0);
    top8.matrix.rotate(g_finalAngle, 0,0,1);
    top8.matrix.scale(0.7, 0.7, 0.7);
    top8.matrix.translate(0.3, 1.4, -1.2);
    if (g_normal){
        top8.textureNum = -3;
    }
    else{
        top8.textureNum = -2;
     }
    top8.normalMatrix.setInverseOf(top8.matrix).transpose();
    top8.renderFasterInterleaved();
    // cone hat -------------------------------------------------
    //var tester = new Cone();
    //tester.matrix.rotate(-90,1,0,0);

    //tester.render();


    // eyes 
    var eye = new Cube(0.2,0.2,0.2,1);
    eye.matrix.scale(0.08, 0.08, 0.08);
    //body.color = [1.0, 0.0, 0.0, 1.0];
    eye.matrix.translate(0.1, -6.2, -0.8);
    eye.matrix.scale(0.99, g_eyeYdim, 0.95);
    eye.render();

    // eyes 
    var eye2 = new Cube(0.2,0.2,0.2,1);
    eye2.matrix.scale(0.08, 0.08, 0.08);
    //body.color = [1.0, 0.0, 0.0, 1.0];
    eye2.matrix.translate(-2.2, -6.2, -0.8);
    eye2.matrix.scale(0.99, g_eyeYdim, 0.95);
    eye2.render();


    
    
    
    
}

function clicked(ev) {
    // Start the animation if it's not already in progress
    if (!animationInProgress) {
        animationInProgress = true;
        isEyeShrunk = !isEyeShrunk; // Toggle between eye states
        animateEye();
    }
}


function dragged(ev){
    let [x,y] = convertCordinatesEventToGL(ev);
    g_globalAngle =  x * 360;
    g_globalAngleY =  y * 360;
}
