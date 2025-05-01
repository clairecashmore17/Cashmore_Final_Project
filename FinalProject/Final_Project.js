"use strict";
var canvas;
var gl;

/********* Initialize Global Variables ***********/
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
var textBuffer;


// Time corresponds to the time of day that we traverse using a slider, but is associated with values 0-1 for lighting.
var time = 1;

var particle_path = 0.1;

/************* End Initialize Variables ***************/


// Method to recolor the shape you are working with
function colorBuffer(cBuffer, colorIndex, vColor) {
    colorsArray = [vertexColors[colorIndex], vertexColors[colorIndex], vertexColors[colorIndex], vertexColors[colorIndex], vertexColors[colorIndex]];

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

};

//Method to send the position of the object to the buffer
function positionBuffer(positionBuffer, vertices, vPosition) {

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);


    // // Associate out shader variables with our data buffer
    // var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

};
// Fill the buffer with texture coordinates for the F.
function setTexcoords(gl, coordinates) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        flatten(coordinates),
        gl.STATIC_DRAW);
}

function textureBuffer(textBuffer,texcoordLocation, vertices, vPosition) {
    // Create a buffer for texcoords.
   
    gl.bindBuffer(gl.ARRAY_BUFFER, textBuffer);
    gl.enableVertexAttribArray(texcoordLocation);

    // We'll supply texcoords as floats.
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Set Texcoords.
    setTexcoords(gl,vertices,vPosition);

}

//Run this once the page has loaded
window.onload = function init() {

    // Time slider to depict what time of day it is.
    document.getElementById("timeSlider").onchange = function (event) {
        time = event.target.value;
        update(vColor, vPosition, program, time, texcoordLocation,positionLocation);
    };

    //Draw canvas
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    //Configure Viewport and clear color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    //var program2 = initShaders(gl, "texture-vertex-shader", "texture-fragment-shader");
    gl.useProgram(program);
    //gl.useProgram(program2);

    var vColor = gl.getAttribLocation(program, "vColor");
    var vPosition = gl.getAttribLocation(program, "vPosition");
    var positionLocation = gl.getAttribLocation(program, "a_position");;
    var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");


    // Calculate the product for lighting
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    // Initial Lighting sent to GPU in form of uniform
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

    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));

    // Asynchronously load an image
    var image = new Image();
    image.src = "ParquetFlooring08_4K_Roughness.png";
    image.addEventListener('load', function () {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    });
    //Update will trigger a render and update any changed values. Passing it the vColor, vPosition, program, and time variables so we can manipulate them.    
    update(vColor, vPosition, program, time, texcoordLocation,positionLocation);

}


// Render method that takes in the matrix we are rendering, the length of the vertices, and the type of gl.DrawArrays to use
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






}


// Method to update what is being sent to screen.
function update(vColor, vPosition, program, time, texcoordLocation,positionLocation) {


    // Set lighting based on time
    lightAmbient = vec4(time*2, time*2, time*2, 1.0);
    // Calculate the product for lighting
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    // Uniforms for lighting
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


    /********** Create Window  ****************/

    //Vertices for the original inner frame
    var window_vertices = [
        vec2(-.25, .25),
        vec2(.25, .25),
        vec2(.25, -.5),
        vec2(-.25, -.5),
        vec2(-.25, .25),
    ];



    var texture_vertices = [
        vec2(-.25, .25),
        vec2(.25, .25),
        vec2(.25, -.5),
        vec2(-.25, -.5),
        vec2(-.25, .25),
    ];


    // Set aside uniform to store the matrix
    matrixLocation = gl.getUniformLocation(program, 'modelViewMatrix');
    colorsArray = [vertexColors[0], vertexColors[0], vertexColors[0], vertexColors[0], vertexColors[0]];



    // Set color for the shapes (black)
    cBuffer = gl.createBuffer();
    colorBuffer(cBuffer, 0, vColor);

    // Vertices for the bar that goes across the window frame
    var window_bar_vertices = [

        vec2(-.25, .25),
        vec2(.25, .25)
    ];

    //Create matrix for inner frame
    var innerFrameMatrix = mat4();

    innerFrameMatrix = scalem(1, 1.55, 1);
    innerFrameMatrix = mult(innerFrameMatrix, translate(-.5, .15, 0));
    // Create a buffer object, initialize it, and associate it with the
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Set the color to blue
    colorBuffer(cBuffer, 4, vColor);



    //load into the GPU
    bufferID = gl.createBuffer();
    positionBuffer(bufferID, window_vertices, vPosition);
  //  textBuffer = gl.createBuffer();
   // textureBuffer(textBuffer,texcoordLocation,texture_vertices,vPosition);

  

  
    // Back to black for color buffer
    colorBuffer(cBuffer, 0, vColor);


    //Create outer frame
    var outerFrameMatrix = mat4();
    // scale the matrix and move to upper right
    outerFrameMatrix = translate(-.5, .25, 0);
    outerFrameMatrix = mult(outerFrameMatrix, scalem(1.25, 1.75, 1));
   
    // add outer frame to buffer
    positionBuffer(bufferID, window_vertices, vPosition);
    
    // Render Outer Frame
    render(outerFrameMatrix, window_vertices.length, "triangle_fan");
    

        // Set the color to blue
        colorBuffer(cBuffer, 4, vColor);
    // Render Inner frame
    render(innerFrameMatrix, window_vertices.length, "triangle_fan");

  
    // Back to black for color buffer
    colorBuffer(cBuffer, 0, vColor);

    //Create Window lines
    var windowHorizontal = mat4();

    // translate the matrix 
    windowHorizontal = scalem(1, 0, 0);
    windowHorizontal = mult(windowHorizontal, translate(-.5, -.3, 0));

    // Create a buffer object, initialize it, and associate it with the
    positionBuffer(bufferID, window_bar_vertices, vPosition);


    // Render horizontal line
    render(windowHorizontal, window_bar_vertices.length, "line_strip");


    //Create verticalWindowLine through matrix manipulation
    windowHorizontal = rotate(90, 0, 0, 1);
    windowHorizontal = mult(windowHorizontal, scalem(2.3, 1, 1));
    windowHorizontal = mult(windowHorizontal, translate(.02, .25, 0));




    // Render vertizal lines
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

    // Set color to brown
    colorBuffer(cBuffer, 8, vColor);

    //Create tabletop matrix
    var tableTopMatrix = mat4();

    // translate the matrix  and scale
    tableTopMatrix = translate(0.5, -.5, 0);
    tableTopMatrix = mult(tableTopMatrix, scalem(3, 1, 1));
    tableTopMatrix = mult(tableTopMatrix, translate(-.15, -.25, 0));

    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    positionBuffer(bufferID, table_vertices, vPosition);
    
   

    // Render Table top
    render(tableTopMatrix, table_vertices.length, "triangle_fan");

    // create table left leg
    var tableLegMatrix = mult(tableTopMatrix, rotate(90, 0, 0, 1));
    tableLegMatrix = mult(tableLegMatrix, translate(-.45, -.15, 0));
    tableLegMatrix = mult(tableLegMatrix, scalem(2.5, .35, 1));


    // Render table leg
    render(tableLegMatrix, table_vertices.length, "triangle_fan");

    // create right table leg
    var tableRightLegMatrix = mult(tableLegMatrix, translate(0, -0.35, 0, 1));



    // Render table leg
    render(tableRightLegMatrix, table_vertices.length, "triangle_fan");

    /***************** END TABLE CODE*****************/



     /***************** START LAVA LAMP CODE*****************/

     var lampBaseVertices = [

        vec2(0, 0),
        vec2(.25, .25),
        vec2(.5, 0),
        vec2(0, 0),

    ]

    //Lamp Base Lighting (should be opposite because we want it to glow)
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
   
    //scale
    lampbaseMatrix = mult(lampbaseMatrix, scalem(.5, .75, 1));
   

    // Create a buffer object, initialize it, and associate it with the
    //load into the GPU
    positionBuffer(bufferID, lampBaseVertices, vPosition);



    // Render Lamp Base
    render(lampbaseMatrix, lampBaseVertices.length, "triangle_fan");

    //Create other half of lamp base (same thing but flipped and translated)
    lampbaseMatrix = mult(lampbaseMatrix, rotate(180, 0, 0, 1));
    lampbaseMatrix = mult(lampbaseMatrix, translate(-.5, -.25, 0));
    render(lampbaseMatrix, lampBaseVertices.length, "triangle_fan");

    // Lamp Glass colors (magenta)
    colorBuffer(cBuffer, 5, vColor);

    // Create lampGlass
    // Going to use the square window vertices again for the lamp glass
    var lampGlassMatrix = mat4();

    // translate the matrix 
    lampGlassMatrix = translate(0.37, 0.06, 0);
    
    // scale to look better
    lampGlassMatrix = mult(lampGlassMatrix, scalem(.4, .75, 1));

    positionBuffer(bufferID, window_vertices, vPosition);

    // Render the lava lamp glass
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

    //attempt to move particle around once its gets darker
    if (time < .05){
           
        if(count>3){
            particle_matrix = mult(particle_matrix, translate(0,particle_path,0,1));
            //update(vColor, vPosition, program, time);
        }
        else{
            particle_matrix = mult(particle_matrix, translate(0,-particle_path,0,1));
            //(vColor, vPosition, program, time);
        }
        count++;
        
    }
    

    positionBuffer(bufferID, particle_vertices, vPosition);
    // Render little particle
    render(particle_matrix, particle_vertices.length, "triangle_fan");


    /********* END LAVA LAMP *****************/

    /*********** Stars Start **********/
    
    // star vertices
    var star_vertices = [
        vec2(-.05, 0),
        vec2(0, 0),
        vec2(0, -.05),
        vec2(-.05, -.05),
        vec2(-.05, 0),
    ];
    var star_matrix = mat4();

    star_matrix = translate(-.5,.5,0);
    positionBuffer(bufferID, star_vertices, vPosition);

      // Lamp Glass colors (magenta)
      colorBuffer(cBuffer, 2, vColor);
    if(time < .7){
       
    // Render little particle
    render(star_matrix, star_vertices.length, "triangle_fan");
    } 
    
}
