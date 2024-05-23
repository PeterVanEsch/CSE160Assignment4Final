
class Triangle{
    constructor(){
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }
    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // Pass the color of a point to u_FragColor
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1f(u_size, size);
        // Draw
        var d = this.size / 200.0;
        //drawTriangles( [xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
        drawTriangles([xy[0] , xy[1], xy[0] + d, xy[1], (xy[0] + xy[0] + d) / 2 , xy[1] + d]);
    }
}


function drawTriangles(vertices) {

    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //if (a_Position < 0) {
      //console.log('Failed to get the storage location of a_Position');
      //return -1;
    //}
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }
  
  



  //faster new function 
   var g_vertexBuffer = null;
   var g_uvBuffer = null;

   function initTriangles3D(){
    g_vertexBuffer = gl.createBuffer();
    if (!g_vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    

    g_uvBuffer = gl.createBuffer();
    if (!g_uvBuffer) {
     console.log('Failed to create the uv buffer object');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
    

   }

   function initTriangles3DInterleaved(){
    g_vertexBuffer = gl.createBuffer();
    if (!g_vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
    

   }


   function drawTriangles3D(vertices) {
    console.log("bruh")
    var n = 3; // The number of vertices
  
    // Create a buffer object
    
    if (g_vertexBuffer == null) {
      initTriangles3D();
    }
  
    // Bind the buffer object to target
    //gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //if (a_Position < 0) {
      //console.log('Failed to get the storage location of a_Position');
      //return -1;
    //}
    // Assign the buffer object to a_Position variable
    //gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    //gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }


  // new function 
  // -------------------------------------------------------
  function drawTriangles3DUV(vertices, uv) {

    var n =  vertices.length / 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //if (a_Position < 0) {
      //console.log('Failed to get the storage location of a_Position');
      //return -1;
    //}
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);


    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
      console.log('Failed to create the uv buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);
  
    //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //if (a_Position < 0) {
      //console.log('Failed to get the storage location of a_Position');
      //return -1;
    //}
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_UV);




  
    gl.drawArrays(gl.TRIANGLES, 0, n);
    //g_vertexBuffer = null;
    //g_uvBuffer = null;
  }

//----------------------------------------------------------------------------------------------
function drawTriangles3DUVNormal(vertices, uv, normals) {

  var n =  vertices.length / 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  //if (a_Position < 0) {
    //console.log('Failed to get the storage location of a_Position');
    //return -1;
  //}
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);


  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('Failed to create the uv buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

  //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  //if (a_Position < 0) {
    //console.log('Failed to get the storage location of a_Position');
    //return -1;
  //}
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_UV);


  var normalBuffer = gl.createBuffer();
  if (!normalBuffer) {
    console.log('Failed to create the normal buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);
  g_vertexBuffer = null;





  gl.drawArrays(gl.TRIANGLES, 0, n);
  //g_vertexBuffer = null;
  //g_uvBuffer = null;
}
  


  function drawColorTriangles(vertices, color) {
    console.log("here");
    var n = 3; // The number of vertices
    var rgba = color;

    // Create a buffer object
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3])
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //if (a_Position < 0) {
      //console.log('Failed to get the storage location of a_Position');
      //return -1;
    //}
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }