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

    // Set aside uniform to store the matrix
    matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    fColorLocation = gl.getUniformLocation(program, "fColor");
    //Create identity matrix H1
    var matrix1 = mat4();

    // translate the matrix to upper right
   // matrix1 = translate(-.5, -0.5, 0);
    // use mult to then rotate after the translation
    //matrix1 = mult(matrix1, rotate(-45, 0, 0, 1));
    // console.log(matrix);

    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    var bufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(window_vertices), gl.STATIC_DRAW);


    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render H1
    render(matrix1);


     //Create identity matrix H2
    var matrix2 = mat4();
    // translate the matrix to upper right
    matrix2 = translate(.5, 0.5, 0);
    // use mult to then rotate after the translation
    matrix2 = mult(matrix2, rotate(-45, 0, 0, 1));

    // Create second buffer for 2nd H
    var bufferID2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID2);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(h1_vertices), gl.STATIC_DRAW);


    //Associate our shade vars again, but for 2nd H?...
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);




    // Render H2
    render(matrix2);



    //Create identity matrix H3
    var matrix3 = mat4();

    // translate the matrix 
    matrix3 = translate(.5, -0.5, 0);
    // use mult to then rotate after the translation
    matrix3 = mult(matrix3, rotate(45, 0, 0, 1));


    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    var bufferID3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID3);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(h1_vertices), gl.STATIC_DRAW);


    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Render H3
    render(matrix3);


    //Create identity matrix H4
    var matrix4 = mat4();

    // translate the matrix 
    matrix4 = translate(-.5, 0.5, 0);
    // use mult to then rotate after the translation
    matrix4 = mult(matrix4, rotate(45, 0, 0, 1));


    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    var bufferID4 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID4);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(h1_vertices), gl.STATIC_DRAW);


    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Render H4
    render(matrix4);
}


function render(matrix) {

    //increase theta to rotate shape
    r = 1.0;
    b = 0.0;
    g = 1.0;





    // send uniform value to vertex shader
    // console.log(theta);

    //send uniform value to fragment shader
    gl.uniform4f(fColorLocation, r, b, g, 1.0);

    // Set the matrix uniform in the shader
    gl.uniformMatrix4fv(matrixLocation, false, flatten(matrix));
    //draw the two H's
    gl.drawArrays(gl.LINE_STRIP, 0, 5);





    // Not looping, drawing render multiple times
    // requestAnimationFrame(render);



}