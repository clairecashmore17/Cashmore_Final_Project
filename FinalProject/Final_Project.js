"use strict";
var canvas;
var gl;

// Set the theta that will be altered to rotate letter



var fColorLocation;
var matrixLocation;

// delay (or n) is the number of frames we load at
var delay = 10;

//cindex is how we will change the colors
var cindex = 1.0;

var fps = 5;

// r b g values (a will always be 1)
var r, b, g;
//Run this once the page has loaded
window.onload = function init() {

    //Draw canvas
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //Configure Viewport and clear color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //Vertices needed to make H
    var window_vertices = [
        vec2(-.25, .25),
        vec2(.25, .25),
        vec2(.25, -.5),
        vec2(-.25, -.5),
        vec2(-.25, .25),
    ];

    var window_bar_vertices = [

        vec2(-.25,.25),
        vec2(.25,.25)
    ];
    // Set aside uniform to store the matrix
    matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    fColorLocation = gl.getUniformLocation(program, "fColor");
    
    
    /*********************** Create Window ***********************/
    // Degine vertices for window
    var window_vertices = [
        vec2(-.25, .25),
        vec2(.25, .25),
        vec2(.25, -.5),
        vec2(-.25, -.5),
        vec2(-.25, .25),
    ];

    var window_bar_vertices = [

        vec2(-.25,.25),
        vec2(.25,.25)
    ];
    var innerFrameMatrix = mat4();

    innerFrameMatrix = scalem(1,1.55,1);
    innerFrameMatrix = mult(innerFrameMatrix,translate(-.5,.15,0));
    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    var bufferIDInnerMatrix = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIDInnerMatrix);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(window_vertices), gl.STATIC_DRAW);


    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render H1
    render(innerFrameMatrix,window_vertices.length,"line_strip");


     //Create outer frame
    var outerFrameMatrix = mat4();
    // scale the matrix to upper right
    outerFrameMatrix = translate(-.5,.25,0);
    outerFrameMatrix = mult(outerFrameMatrix,scalem(1.25, 1.75,1));

    // Create second buffer for 2nd H
    var bufferOuterFrame = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferOuterFrame);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(window_vertices), gl.STATIC_DRAW);


    //Associate our shade vars again, but for 2nd H?...
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Render H2
    render(outerFrameMatrix,window_vertices.length,"line_strip");


    //Create Window lines
    var windowHorizontal = mat4();

    // translate the matrix 
    windowHorizontal = scalem(1,0, 0);
    windowHorizontal = mult(windowHorizontal,translate(-.5,-.3,0));


    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    var horizontalWindowBufffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, horizontalWindowBufffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(window_bar_vertices), gl.STATIC_DRAW);


    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Render H3
    render(windowHorizontal,window_bar_vertices.length,"line_strip");


    //Create verticalWindowLine
    //var windowVertical = mat4();

    // translate the matrix 
   // windowHorizontal = translate(-.5, 0.5, 0);
    // use mult to then rotate after the translation
    // windowHorizontal = scalem(4,0, 0);
    windowHorizontal =  rotate(90, 0, 0, 1);
    windowHorizontal = mult(windowHorizontal, scalem(2.3,1,1));
    windowHorizontal = mult(windowHorizontal,translate(.02, .25, 0));

    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    var verticalWindowBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticalWindowBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(window_bar_vertices), gl.STATIC_DRAW);


    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Render H4
    render(windowHorizontal,window_bar_vertices.length,"line_strip");


    /***************** END WINDOW CODE*****************/



    /***************** START TABLE CODE*****************/
    var table_vertices = [
        vec2(0, .25),
        vec2(.25, .25),
        vec2(.25, .15),
        vec2(0, .15),
        vec2(0, .25),
    ];

    //Create tabletop
    var tableTopMatrix = mat4();

    // translate the matrix 
    tableTopMatrix = translate(0.5, -.5, 0);
    // use mult to then rotate after the translation
    // windowHorizontal = scalem(4,0, 0);
   // windowHorizontal =  rotate(90, 0, 0, 1);
    tableTopMatrix = mult(tableTopMatrix, scalem(3,1,1));
    tableTopMatrix = mult(tableTopMatrix,translate(-.15, -.25, 0));

    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    var tableBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tableBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(table_vertices), gl.STATIC_DRAW);


    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Render H4
    render(tableTopMatrix,table_vertices.length,"triangle_fan");

// create table leg
var tableLegMatrix = mult(tableTopMatrix,rotate(90,0,0,1));
tableLegMatrix = mult(tableLegMatrix,translate(-.45,-.15,0));
tableLegMatrix = mult(tableLegMatrix, scalem(2.5,.35,1));
var tableLegBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, tableLegBuffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(table_vertices), gl.STATIC_DRAW);



// Associate out shader variables with our data buffer
var vPosition = gl.getAttribLocation(program, "vPosition");
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vPosition);

// Render table leg
render(tableLegMatrix,table_vertices.length,"triangle_fan");
    
/***************** END TABLE CODE*****************/



    /***************** START LAVA LAMP CODE*****************/

    var lampBaseVertices = [

        vec2(0 ,0),
        vec2(.25, .25),
        vec2(.5, 0),
        vec2(0, 0),
        
    ]

 //Create tabletop
 var lampbaseMatrix = mat4();

 // translate the matrix 
  lampbaseMatrix = translate(0.25, -.5, 0);
 // use mult to then rotate after the translation
 
 lampbaseMatrix = mult(lampbaseMatrix, scalem(.5,.75,1));
// lampbaseMatrix = mult(lampbaseMatrix,translate(-.15, -.25, 0));

 // Create a buffer object, initialize it, and associate it with the
 //load into the GPU
 var lampBaseBuffer = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, lampBaseBuffer);
 gl.bufferData(gl.ARRAY_BUFFER, flatten(lampBaseVertices), gl.STATIC_DRAW);


 // Associate out shader variables with our data buffer
 var vPosition = gl.getAttribLocation(program, "vPosition");
 gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
 gl.enableVertexAttribArray(vPosition);

 // Render H4
 render(lampbaseMatrix,lampBaseVertices.length,"triangle_fan");

 lampbaseMatrix = mult(lampbaseMatrix,rotate(180,0,0,1));
 lampbaseMatrix = mult(lampbaseMatrix,translate(-.5,-.25,0));
 render(lampbaseMatrix,lampBaseVertices.length,"triangle_fan");


 // Create lampGlass

 var lampGlassMatrix = mat4();

 // translate the matrix 
 lampGlassMatrix = translate(0.37, 0.06, 0);
 // use mult to then rotate after the translation
 
 lampGlassMatrix = mult(lampGlassMatrix, scalem(.4,.75,1));
// lampbaseMatrix = mult(lampGlassMatrix,translate(-.72, -.25, 0));

 // Create a buffer object, initialize it, and associate it with the
 //load into the GPU
 var lampGlassBuffer = gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER, lampGlassBuffer);
 gl.bufferData(gl.ARRAY_BUFFER, flatten(window_vertices), gl.STATIC_DRAW);


 // Associate out shader variables with our data buffer
 var vPosition = gl.getAttribLocation(program, "vPosition");
 gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
 gl.enableVertexAttribArray(vPosition);

 // Render H4
 render(lampGlassMatrix,window_vertices.length,"line_strip");

}


function render(matrix, n,type) {

    //increase theta to rotate shape
    r = 1.0;
    b = 0.5;
    g = 0.5;





    // send uniform value to vertex shader
    // console.log(theta);

    //send uniform value to fragment shader
    gl.uniform4f(fColorLocation, r, b, g, 1.0);

    // Set the matrix uniform in the shader
    gl.uniformMatrix4fv(matrixLocation, false, flatten(matrix));
    //draw the two H's
    switch(type){
        case "line_strip":
            gl.drawArrays(gl.LINE_STRIP, 0, n);
            break;
        case "triangle_fan":
            gl.drawArrays(gl.TRIANGLE_FAN,0,n)
    }
    //gl.drawArrays(gl.LINE_STRIP, 0, n);





    // Not looping, drawing render multiple times
    // requestAnimationFrame(render);



}