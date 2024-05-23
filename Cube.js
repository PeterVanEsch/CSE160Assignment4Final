class Cube{
    static TOTAL = new Float32Array([
        0,0,0,  1,0,    0,0, -1,  
        1,1,0, 0,1,     0,0, -1,
        1,0,0, 0,0,    0,0, -1,

        0,0,0,   1,0,       0,0, -1,
        0,1,0, 1,1,         0,0, -1,
        1,1,0, 0,1,           0,0, -1,


        //back
        0.0, 0.0, 1.0,     1,0,    0,0, 1,
        1.0,1.0, 1.0, 0,1,         0,0, 1,
        1.0, 0.0, 1.0, 0,0,          0,0, 1,

        0.0, 0.0, 1.0,  1,0,     0,0, 1,
        1.0,1.0, 1.0,  0,1,       0,0, 1,
        0.0, 1.0, 1.0,  1,1,      0,0, 1,


        //top 
        0.0, 1.0, 0.0,  1,1,   0,1, 0,
        0.0,1.0, 1.0, 1,0,       0,1, 0,
        1.0, 1.0, 1.0, 0,0,   0,1, 0,

        0.0, 1.0, 0.0,  1,1,      0,1, 0,
        1.0,1.0, 1.0,  0,0,      0,1, 0,
        1.0, 1.0, 0.0, 0,1,      0,1, 0,


        //bottom
        0.0, 0.0, 0.0, 1,1,   0,-1, 0, 
        0.0,0.0, 1.0,  1,0,   0,-1, 0, 
        1.0, 0.0, 1.0, 0,0,   0,-1, 0, 

        0.0, 0.0, 0.0,  1,1,    0,-1, 0, 
        1.0,0.0, 1.0,  0,0,     0,-1, 0, 
        1.0, 0.0, 0.0, 0,1,     0,-1, 0, 


        //left
        0.0, 0.0, 0.0,  1,0,    -1, 0,0,  
        0.0,0.0, 1.0,  0,0,      -1, 0,0,
        0.0, 1.0, 1.0,  0,1,     -1, 0,0,

        0.0, 1.0, 1.0,  0,1,    -1, 0,0,
        0.0,1.0, 0.0,  1,1,      -1, 0,0,
        0.0, 0.0, 0.0,  1,0,     -1, 0,0,


        //right
        1.0, 0.0, 0.0,  1,0,        1, 0,0,
        1.0,0.0, 1.0,  0,0,        1, 0,0,
         1.0, 1.0, 1.0,  0,1,      1, 0,0,


        1.0, 1.0, 1.0, 0,1,      1, 0,0,
         1.0,1.0, 0.0,  1,1,     1, 0,0,
         1.0, 0.0, 0.0,  1,0,    1, 0,0,







    ]);
    constructor(r,g,b,_){
        
        this.type = 'cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [r, g, b, _];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
        this.cubeVerts32 = /*new Float32Array( */ [

            //done 
        0,0,0,   1,1,0, 1,0,0,    
        0,0,0,   0,1,0, 1,1,0,    

            //done 
        0.0, 0.0, 1.0,  1.0,1.0, 1.0,  1.0, 0.0, 1.0, 
        0.0, 0.0, 1.0,  1.0,1.0, 1.0,  0.0, 1.0, 1.0,
        
       
            //done
        0.0, 1.0, 0.0,  0.0,1.0, 1.0,  1.0, 1.0, 1.0,
        0.0, 1.0, 0.0,  1.0,1.0, 1.0,  1.0, 1.0, 0.0,


        //done
        0.0, 0.0, 0.0,  0.0,0.0, 1.0,  1.0, 0.0, 1.0, 
        0.0, 0.0, 0.0,  1.0,0.0, 1.0,  1.0, 0.0, 0.0,

        //done
        0.0, 0.0, 0.0,  0.0,0.0, 1.0,  0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,  0.0,1.0, 0.0,  0.0, 0.0, 0.0,

        
         
       //dpme 
        1.0, 0.0, 0.0,  1.0,0.0, 1.0,  1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,  1.0,1.0, 0.0,  1.0, 0.0, 0.0
        
        
        
        

        ];
        this.cubeUVs32 = /*new Float32Array( */[
        //done
        1,0,      0,1,  0,0,
        1,0,      1,1,  0,1,
        
        //done
        1,0,  0,1, 0,0, 
        1,0,  0,1, 1,1,

            // done
            1,1,  1,0, 0,0,
        1,1,  0,0,  0,1,

        // done
        1,1,  1,0, 0,0,
        1,1,  0,0,  0,1,

        //done right
        1,0,  0,0, 0,1,
        0,1,  1,1,  1,0,

            //done left
        1,0,      0,0,  0,1,
        0,1,      1,1,  1,0

    

         ] ;
         
    }
    render(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);


        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        // new draw function
        drawTriangles3DUV ([0,0,0,   1,1,0, 1,0,0,   ], [0,0,      1,1,  1,0]);
        drawTriangles3DUV ([0,0,0,   0,1,0, 1,1,0,   ], [0,0,      0,1,  1,1]);
        
        //gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangles3DUV([0.0, 0.0, 0.0,  0.0,0.0, 1.0,  0.0, 1.0, 1.0 ] , [0,0,      0,1,  1,1]);
        drawTriangles3DUV([0.0, 0.0, 0.0,  0.0,1.0, 1.0,  0.0, 1.0, 0.0 ], [0,0,      1,1,  1,0]  );

       // gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);
        drawTriangles3DUV([0.0, 1.0, 0.0,  0.0,1.0, 1.0,  1.0, 1.0, 1.0 ], [0,0,      0,1,  1,1] );
        drawTriangles3DUV([0.0, 1.0, 0.0,  1.0,1.0, 1.0,  1.0, 1.0, 0.0 ] , [0,0,      1,1,  1,0] );
        //gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);
        drawTriangles3DUV([1.0, 0.0, 0.0,  1.0,0.0, 1.0,  1.0, 1.0, 1.0 ] , [0,0,      0,1,  1,1]);
        drawTriangles3DUV([1.0, 0.0, 0.0,  1.0,1.0, 1.0,  1.0, 1.0, 0.0 ],[0,0,      1,1,  1,0]  );
        //gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);
        drawTriangles3DUV([0.0, 0.0, 1.0,  1.0,1.0, 1.0,  1.0, 0.0, 1.0 ] , [0,0,      1,1,  1,0]);
        drawTriangles3DUV([0.0, 0.0, 1.0,  0.0,1.0, 1.0,  1.0, 1.0, 1.0 ] , [0,0,      0,1,  1,1]);
        //gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
        drawTriangles3DUV([0.0, 0.0, 0.0,  0.0,0.0, 1.0,  1.0, 0.0, 1.0 ], [0,0,      1,1,  1,0] );
        drawTriangles3DUV([0.0, 0.0, 0.0,  1.0,0.0, 1.0,  1.0, 0.0, 0.0 ], [0,0,      0,1,  1,1] );
    }

    renderFaster(){
        //drawTriangles3DUV(this.cubeVerts32, this.cubeUVs32);
        
        
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);


        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        drawTriangles3DUV(this.cubeVerts32, this.cubeUVs32);
        /*
        
        if (g_vertexBuffer == null || g_uvBuffer == null){
            initTriangles3D();
        }
        
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        

        gl.bufferData(gl.ARRAY_BUFFER, this.cubeUVs32, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
        */
        
       
        
    }

    renderFasterInterleaved(){
        //var xy = this.position;
        var rgba = this.color;
        var n = Cube.TOTAL.length / 8;
        
        //var size = this.size;

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);


        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);


        //gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        //if (g_vertexBuffer == null ){//|| g_uvBuffer == null){
        gl.bufferData(gl.ARRAY_BUFFER, Cube.TOTAL, gl.DYNAMIC_DRAW);
        //}
        

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
        gl.enableVertexAttribArray(a_Position);
        

        //gl.bufferData(gl.ARRAY_BUFFER, Cube.TOTAL, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
        gl.enableVertexAttribArray(a_UV);


        //gl.bufferData(gl.ARRAY_BUFFER, Cube.TOTAL, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 5);
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, n);
        
    }
}