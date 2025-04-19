"use strict";
var canvas;
var gl;

// Set the theta that will be altered to rotate letter




var matrixLocation;
var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black  0
    vec4(1.0, 0.0, 0.0, 1.0),  // red  1
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow  2
    vec4(0.0, 1.0, 0.0, 1.0),  // green  3
    vec4(0.0, 0.0, 1.0, 1.0),  // blue  4
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta  5
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan  6
    vec4(1.0, 1.0, 1.0, 1.0),  // white  7
    vec4(0.6, .39, 0.0, 1.0), // brown  8
    vec4(0.0, .4, 1.0, 1.0) // Night Sky  9
];
// var skyColors = [
//     vec4(0.0, 0.0, 1.0, 1.0),  // blue  4
//     vec4(0.0, .4, 1.0, 1.0) // Night Sky  9

// ];

// Initialize lighting standards
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.9, 0.9, 0.9, 1.0);
var lightDiffuse = vec4(0, 0, 0, 0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 100.0;

var colorsArray = [];

var bufferID;
var cBuffer;
var night = true;
var time = 1;

function colorBuffer(cBuffer, colorIndex, vColor) {
    colorsArray = [vertexColors[colorIndex], vertexColors[colorIndex], vertexColors[colorIndex], vertexColors[colorIndex], vertexColors[colorIndex]];

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

};

function positionBuffer(positionBuffer, vertices, vPosition) {

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);


    // // Associate out shader variables with our data buffer
    // var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

};

//Run this once the page has loaded
window.onload = function init() {
    document.getElementById("Button1").onclick = function () {

        night = !night;
        console.log(`night is now ${night}`);
        update(vColor, innerFrameMatrix, window_vertices, vPosition);
    };
    document.getElementById("timeSlider").onchange = function (event) {
        time = event.target.value;
        update(vColor, vPosition, program, time);
    };
    console.log(time);
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
    var vColor = gl.getAttribLocation(program, "vColor");
    var vPosition = gl.getAttribLocation(program, "vPosition");


    // Calculate the product for lighting
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lightPosition));

    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);


    update(vColor, vPosition, program, time);

}


function render(matrix, n, type) {

    // Set the matrix uniform in the shader
    gl.uniformMatrix4fv(matrixLocation, false, flatten(matrix));
    //draw the two H's
    switch (type) {
        case "line_strip":
            gl.drawArrays(gl.LINE_STRIP, 0, n);
            break;
        case "triangle_fan":
            gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
    }


    // Uniforms for lighting



}

function update(vColor, vPosition, program, time) {
    lightAmbient = vec4(time, time, time, 1.0);
    // Calculate the product for lighting
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lightPosition));

    gl.uniform1f(gl.getUniformLocation(program,
        "shininess"), materialShininess);

    console.log(time);
    //Vertices needed to make H
    var window_vertices = [
        vec2(-.25, .25),
        vec2(.25, .25),
        vec2(.25, -.5),
        vec2(-.25, -.5),
        vec2(-.25, .25),
    ];

    var window_bar_vertices = [

        vec2(-.25, .25),
        vec2(.25, .25)
    ];





    // Set aside uniform to store the matrix
    matrixLocation = gl.getUniformLocation(program, 'modelViewMatrix');
    colorsArray = [vertexColors[0], vertexColors[0], vertexColors[0], vertexColors[0], vertexColors[0]];

    // Set first Color Buffer
    cBuffer = gl.createBuffer();
    colorBuffer(cBuffer, 0, vColor);

    /*********************** Create Window ***********************/
    // // Degine vertices for window


    var window_bar_vertices = [

        vec2(-.25, .25),
        vec2(.25, .25)
    ];
    var innerFrameMatrix = mat4();

    innerFrameMatrix = scalem(1, 1.55, 1);
    innerFrameMatrix = mult(innerFrameMatrix, translate(-.5, .15, 0));
    // Create a buffer object, initialize it, and associate it with the
    gl.clearColor(1.0, 1.0, 1.0, 1.0);



    //Sky Color
    if (night) {
        colorBuffer(cBuffer, 9, vColor);
    }
    else {
        colorBuffer(cBuffer, 4, vColor);
    }


    //load into the GPU
    bufferID = gl.createBuffer();
    positionBuffer(bufferID, window_vertices, vPosition);


    // Render Inner frame
    render(innerFrameMatrix, window_vertices.length, "triangle_fan");

    colorBuffer(cBuffer, 5, vColor);

    colorBuffer(cBuffer, 0, vColor);




    //Create outer frame
    var outerFrameMatrix = mat4();
    // scale the matrix to upper right
    outerFrameMatrix = translate(-.5, .25, 0);
    outerFrameMatrix = mult(outerFrameMatrix, scalem(1.25, 1.75, 1));

    // add outer frame to buffer
    positionBuffer(bufferID, window_vertices, vPosition);


    // Render Outer Frame
    render(outerFrameMatrix, window_vertices.length, "line_strip");


    //Create Window lines
    var windowHorizontal = mat4();

    // translate the matrix 
    windowHorizontal = scalem(1, 0, 0);
    windowHorizontal = mult(windowHorizontal, translate(-.5, -.3, 0));

    // Create a buffer object, initialize it, and associate it with the
    positionBuffer(bufferID, window_bar_vertices, vPosition);


    // Render H3
    render(windowHorizontal, window_bar_vertices.length, "line_strip");


    //Create verticalWindowLine
    windowHorizontal = rotate(90, 0, 0, 1);
    windowHorizontal = mult(windowHorizontal, scalem(2.3, 1, 1));
    windowHorizontal = mult(windowHorizontal, translate(.02, .25, 0));

    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    // positionBuffer(bufferID,window_bar_vertices,vPosition);


    // Render H4
    render(windowHorizontal, window_bar_vertices.length, "line_strip");


    /***************** END WINDOW CODE*****************/



    /***************** START TABLE CODE*****************/
    var table_vertices = [
        vec2(0, .25),
        vec2(.25, .25),
        vec2(.25, .15),
        vec2(0, .15),
        vec2(0, .25),
    ];

    colorBuffer(cBuffer, 8, vColor);

    //Create tabletop
    var tableTopMatrix = mat4();

    // translate the matrix 
    tableTopMatrix = translate(0.5, -.5, 0);
    // use mult to then rotate after the translation
    // windowHorizontal = scalem(4,0, 0);
    // windowHorizontal =  rotate(90, 0, 0, 1);
    tableTopMatrix = mult(tableTopMatrix, scalem(3, 1, 1));
    tableTopMatrix = mult(tableTopMatrix, translate(-.15, -.25, 0));

    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    positionBuffer(bufferID, table_vertices, vPosition);

    // Render Table
    render(tableTopMatrix, table_vertices.length, "triangle_fan");

    // create table leg
    var tableLegMatrix = mult(tableTopMatrix, rotate(90, 0, 0, 1));
    tableLegMatrix = mult(tableLegMatrix, translate(-.45, -.15, 0));
    tableLegMatrix = mult(tableLegMatrix, scalem(2.5, .35, 1));


    // Render table leg
    render(tableLegMatrix, table_vertices.length, "triangle_fan");

    /***************** END TABLE CODE*****************/



    /***************** START LAVA LAMP CODE*****************/

    var lampBaseVertices = [

        vec2(0, 0),
        vec2(.25, .25),
        vec2(.5, 0),
        vec2(0, 0),

    ]
    //Lamp Base Color
    lightAmbient = vec4(1 - time, 1 - time, 1 - time, 1.0);
    // Calculate the product for lighting
    var ambientProduct = mult(lightAmbient, materialAmbient);


    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    colorBuffer(cBuffer, 0, vColor);


    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    //Create lamp Base
    var lampbaseMatrix = mat4();

    // translate the matrix 
    lampbaseMatrix = translate(0.25, -.5, 0);
    // use mult to then rotate after the translation

    lampbaseMatrix = mult(lampbaseMatrix, scalem(.5, .75, 1));
    // lampbaseMatrix = mult(lampbaseMatrix,translate(-.15, -.25, 0));

    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    positionBuffer(bufferID, lampBaseVertices, vPosition);



    // Render Lamp Base
    render(lampbaseMatrix, lampBaseVertices.length, "triangle_fan");

    lampbaseMatrix = mult(lampbaseMatrix, rotate(180, 0, 0, 1));
    lampbaseMatrix = mult(lampbaseMatrix, translate(-.5, -.25, 0));
    render(lampbaseMatrix, lampBaseVertices.length, "triangle_fan");

    // Lamp Glass colors
    colorBuffer(cBuffer, 5, vColor);

    // Create lampGlass

    var lampGlassMatrix = mat4();

    // translate the matrix 
    lampGlassMatrix = translate(0.37, 0.06, 0);
    // use mult to then rotate after the translation

    lampGlassMatrix = mult(lampGlassMatrix, scalem(.4, .75, 1));

    positionBuffer(bufferID, window_vertices, vPosition);

    // Render H4
    render(lampGlassMatrix, window_vertices.length, "line_strip");


    // FLOATING PARTICLE
    var particle_vertices = [
        vec2(-.05, 0),
        vec2(0, 0),
        vec2(0, -.05),
        vec2(-.05, -.05),
        vec2(-.05, 0),
    ];
    var particle_matrix = mat4();

    particle_matrix = mult(particle_matrix, lampGlassMatrix);

    positionBuffer(bufferID, particle_vertices, vPosition);
    // Render Inner frame
    render(particle_matrix, particle_vertices.length, "triangle_fan");
}
