class Sphere{
    
    constructor(r,g,b,_){
        
        this.type = 'sphere';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [r, g, b, _];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -1;
        this.vertices = null;
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
    generateVertices(){
        var d = Math.PI/ 10;
        var dd = Math.PI/ 10;
        for ( var t = 0; t< Math.PI; t += d ){
            for( var r = 0; r < 2 * Math.PI; r += d){
                var p1 = [Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t) ];
                var p2 = [Math.sin(t + dd) * Math.cos(r), Math.sin(t + dd) * Math.sin(r), Math.cos(t + dd) ];
                var p3 = [Math.sin(t) * Math.cos(r + dd), Math.sin(t) * Math.sin(r + dd), Math.cos(t) ];
                var p4 = [Math.sin(t + dd) * Math.cos(r + dd), Math.sin(t + dd) * Math.sin(r + dd), Math.cos(t + dd) ];


                var v = [];
                v = v.concat(p1); v = v.concat([0,0]);  v = v.concat(p1);
                v = v.concat(p2); v = v.concat([0,0]); v = v.concat(p2);
                v = v.concat(p4); v = v.concat([0,0]); v = v.concat(p4);
                
                v = v.concat(p1); v = v.concat([0,0]); v = v.concat(p1);
                v = v.concat(p4); v = v.concat([0,0]); v = v.concat(p4);
                v = v.concat(p3); v = v.concat([0,0]); v = v.concat(p3);

            }
        }
        this.vertices = new Float32Array(v);
        //console.log(this.vertices)
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


        var d = Math.PI/ 10;
        var dd = Math.PI/ 10;
        for ( var t = 0; t< Math.PI; t += d ){
            for( var r = 0; r < 2 * Math.PI; r += d){
                var p1 = [Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t) ];
                var p2 = [Math.sin(t + dd) * Math.cos(r), Math.sin(t + dd) * Math.sin(r), Math.cos(t + dd) ];
                var p3 = [Math.sin(t) * Math.cos(r + dd), Math.sin(t) * Math.sin(r + dd), Math.cos(t) ];
                var p4 = [Math.sin(t + dd) * Math.cos(r + dd), Math.sin(t + dd) * Math.sin(r + dd), Math.cos(t + dd) ];


                var v = [];
                var uv = []
                v = v.concat(p1); uv = uv.concat([0,0]);
                v = v.concat(p2); uv = uv.concat([0,0]);
                v = v.concat(p4); uv = uv.concat([0,0]);
                
                gl.uniform4f(u_FragColor, 1, 1, 1, 1);
                //drawTriangles3DUVNormal(v,uv,v);


                //var v = [];
                //var uv = []
                v = v.concat(p1); uv = uv.concat([0,0]);
                v = v.concat(p4); uv = uv.concat([0,0]);
                v = v.concat(p3); uv = uv.concat([0,0]);

                gl.uniform4f(u_FragColor, 1, 1, 1, 1);
                drawTriangles3DUVNormal(v,uv,v);


            }
        }
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
        var n = this.vertices.length * (1/8);
        //var size = this.size;

        // Pass the position of a point to a_Position variable
        //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);


        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        //gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        //if (g_vertexBuffer == null ){//|| g_uvBuffer == null){
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        //}
        

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
        gl.enableVertexAttribArray(a_Position);
        

        //gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
        gl.enableVertexAttribArray(a_UV);


        //gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 5);
        gl.enableVertexAttribArray(a_Normal);

        gl.drawArrays(gl.TRIANGLES, 0, n);
        
    }
}