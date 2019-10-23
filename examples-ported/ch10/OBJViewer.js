// OBJViewer.js (c) 2012 matsuda and itami
// Vertex shader program
"use strict";
const loc_aPosition = 3;
const loc_aColor = 7;
const loc_aNormal = 8;
let VSHADER_SOURCE = 
`#version 300 es
layout(location=${loc_aPosition}) in vec4 aPosition;
layout(location=${loc_aColor}) in vec4 aColor;
layout(location=${loc_aNormal}) in vec4 aNormal;
uniform mat4 uMvpMatrix;
uniform mat4 uNormalMatrix;
out vec4 vColor;
void main() {
  vec3 lightDirection = vec3(-0.35, 0.35, 0.87);
  gl_Position = uMvpMatrix * aPosition;
  vec3 normal = normalize(vec3(uNormalMatrix * aNormal));
  float nDotL = max(dot(normal, lightDirection), 0.0);
  vColor = vec4(aColor.rgb * nDotL, aColor.a);
}`;

// Fragment shader program
let FSHADER_SOURCE =
`#version 300 es
precision mediump float;
in vec4 vColor;
out vec4 fColor;
void main() {
  fColor = vColor;
}`;

function main() {
  // Retrieve <canvas> element
  let canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of attribute and uniform variables
  let program = gl.program;
  program.loc_uMvpMatrix = gl.getUniformLocation(program, 'uMvpMatrix');
  program.loc_uNormalMatrix = gl.getUniformLocation(program, 'uNormalMatrix');

  if (!program.loc_uMvpMatrix || !program.loc_uNormalMatrix) {
    console.log('Failed to get the locations of uniforms.');
    return;
  }

  // Prepare empty buffer objects for vertex coordinates, colors, and normals
  let model = initVertexBuffers(gl, program);
  if (!model) {
    console.log('Failed to set the vertex information');
    return;
  }

  // ビュー投影行列を計算
  let viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 5000.0);
  viewProjMatrix.lookAt(0.0, 500.0, 200.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

  // Start reading the OBJ file
  readOBJFile('cube.obj', gl, model, 60, true);

  let currentAngle = 0.0; // Current rotation angle [degree]
  let tick = function() {   // Start drawing
    currentAngle = animate(currentAngle); // Update current rotation angle
    draw(gl, gl.program, currentAngle, viewProjMatrix, model);
    requestAnimationFrame(tick, canvas);
  };
  tick();
}

// Create an buffer object and perform an initial configuration
function initVertexBuffers(gl, program) {

  let o = new Object(); // Utilize Object object to return multiple buffer objects

    o.vao = gl.createVertexArray();
    gl.bindVertexArray(o.vao);
  o.vertexBuffer = createEmptyArrayBuffer(gl, loc_aPosition, 3, gl.FLOAT); 
  o.normalBuffer = createEmptyArrayBuffer(gl, loc_aNormal, 3, gl.FLOAT);
  o.colorBuffer = createEmptyArrayBuffer(gl, loc_aColor, 4, gl.FLOAT);
  o.indexBuffer = gl.createBuffer();
  if (!o.vertexBuffer || !o.normalBuffer || !o.colorBuffer || !o.indexBuffer) { return null; }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.indexBuffer);
    gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return o;
}

// Create a buffer object, assign it to attribute variables, and enable the assignment
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
  let buffer =  gl.createBuffer();  // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);  // Enable the assignment

  return buffer;
}

// Read a file
function readOBJFile(fileName, gl, model, scale, reverse) {
  let request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status !== 404) {
      onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
    }
  }
  request.open('GET', fileName, true); // Create a request to acquire the file
  request.send();                      // Send the request
}

let g_objDoc = null;      // The information of OBJ file
let g_drawingInfo = null; // The information for drawing 3D model

// OBJ File has been read
function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {
  let objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
  let result = objDoc.parse(fileString, scale, reverse); // Parse the file
  if (!result) {
    g_objDoc = null; g_drawingInfo = null;
    console.log("OBJ file parsing error.");
    return;
  }
  g_objDoc = objDoc;
}

// Coordinate transformation matrix
let g_modelMatrix = new Matrix4();
let g_mvpMatrix = new Matrix4();
let g_normalMatrix = new Matrix4();

// 描画関数
function draw(gl, program, angle, viewProjMatrix, model) {
  if (g_objDoc != null && g_objDoc.isMTLComplete()){ // OBJ and all MTLs are available
    g_drawingInfo = onReadComplete(gl, model, g_objDoc);
    g_objDoc = null;
  }
  if (!g_drawingInfo) return;   // モデルを読み込み済みか判定

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear color and depth buffers

  g_modelMatrix.setRotate(angle, 1.0, 0.0, 0.0); // 適当に回転
  g_modelMatrix.rotate(angle, 0.0, 1.0, 0.0);
  g_modelMatrix.rotate(angle, 0.0, 0.0, 1.0);

  // Calculate the normal transformation matrix and pass it to uNormalMatrix
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(program.loc_uNormalMatrix, false, g_normalMatrix.elements);

  // Calculate the model view project matrix and pass it to uMvpMatrix
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(program.loc_uMvpMatrix, false, g_mvpMatrix.elements);

  // Draw
  gl.bindVertexArray(model.vao);
  gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArray(null);
}

// OBJ File has been read compreatly
function onReadComplete(gl, model, objDoc) {
  // Acquire the vertex coordinates and colors from OBJ file
  let drawingInfo = objDoc.getDrawingInfo();

  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
  
  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);


  return drawingInfo;
}

let ANGLE_STEP = 30;   // The increments of rotation angle (degrees)

let last = Date.now(); // Last time that this function was called
function animate(angle) {
  let now = Date.now();   // Calculate the elapsed time
  let elapsed = now - last;
  last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  let newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle % 360;
}

//------------------------------------------------------------------------------
// OBJParser
//------------------------------------------------------------------------------

// OBJDoc object
// Constructor
let OBJDoc = function(fileName) {
  this.fileName = fileName;
  this.mtls = new Array(0);      // Initialize the property for MTL
  this.objects = new Array(0);   // Initialize the property for Object
  this.vertices = new Array(0);  // Initialize the property for Vertex
  this.normals = new Array(0);   // Initialize the property for Normal
}

// Parsing the OBJ file
OBJDoc.prototype.parse = function(fileString, scale, reverse) {
  let lines = fileString.split('\n');  // Break up into lines and store them as array
  lines.push(null); // Append null
  let index = 0;    // Initialize index of line

  let currentObject = null;
  let currentMaterialName = "";
  
  // Parse line by line
  let line;         // A string in the line to be parsed
  let sp = new StringParser();  // Create StringParser
  while ((line = lines[index++]) != null) {
    sp.init(line);                  // init StringParser
	let command = sp.getWord();     // Get command
	if(command == null)	 continue;  // check null command

    switch(command){
    case '#':
      continue;  // Skip comments
    case 'mtllib':     // Read Material chunk
      let path = this.parseMtllib(sp, this.fileName);
      let mtl = new MTLDoc();   // Create MTL instance
      this.mtls.push(mtl);
      let request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (request.readyState == 4) {
          if (request.status != 404) {
            onReadMTLFile(request.responseText, mtl);
          }else{
            mtl.complete = true;
          }
        }
      }
      request.open('GET', path, true);  // Create a request to acquire the file
      request.send();                   // Send the request
      continue; // Go to the next line
    case 'o':
    case 'g':   // Read Object name
      let object = this.parseObjectName(sp);
      this.objects.push(object);
      currentObject = object;
      continue; // Go to the next line
    case 'v':   // Read vertex
      let vertex = this.parseVertex(sp, scale);
      this.vertices.push(vertex); 
      continue; // Go to the next line
    case 'vn':   // Read normal
      let normal = this.parseNormal(sp);
      this.normals.push(normal); 
      continue; // Go to the next line
    case 'usemtl': // Read Material name
      currentMaterialName = this.parseUsemtl(sp);
      continue; // Go to the next line
    case 'f': // Read face
      let face = this.parseFace(sp, currentMaterialName, this.vertices, reverse);
      currentObject.addFace(face);
      continue; // Go to the next line
    }
  }

  return true;
}

OBJDoc.prototype.parseMtllib = function(sp, fileName) {
  // Get directory path
  let i = fileName.lastIndexOf("/");
  let dirPath = "";
  if(i > 0) dirPath = fileName.substr(0, i+1);

  return dirPath + sp.getWord();   // Get path
}

OBJDoc.prototype.parseObjectName = function(sp) {
  let name = sp.getWord();
  return (new OBJObject(name));
}

OBJDoc.prototype.parseVertex = function(sp, scale) {
  let x = sp.getFloat() * scale;
  let y = sp.getFloat() * scale;
  let z = sp.getFloat() * scale;
  return (new Vertex(x, y, z));
}

OBJDoc.prototype.parseNormal = function(sp) {
  let x = sp.getFloat();
  let y = sp.getFloat();
  let z = sp.getFloat();
  return (new Normal(x, y, z));
}

OBJDoc.prototype.parseUsemtl = function(sp) {
  return sp.getWord();
}

OBJDoc.prototype.parseFace = function(sp, materialName, vertices, reverse) {  
  let face = new Face(materialName);
  // get indices
  for(;;){
    let word = sp.getWord();
    if(word == null) break;
    let subWords = word.split('/');
    if(subWords.length >= 1){
      let vi = parseInt(subWords[0]) - 1;
      face.vIndices.push(vi);
    }
    if(subWords.length >= 3){
      let ni = parseInt(subWords[2]) - 1;
      face.nIndices.push(ni);
    }else{
      face.nIndices.push(-1);
    }
  }

  // calc normal
  let v0 = [
    vertices[face.vIndices[0]].x,
    vertices[face.vIndices[0]].y,
    vertices[face.vIndices[0]].z];
  let v1 = [
    vertices[face.vIndices[1]].x,
    vertices[face.vIndices[1]].y,
    vertices[face.vIndices[1]].z];
  let v2 = [
    vertices[face.vIndices[2]].x,
    vertices[face.vIndices[2]].y,
    vertices[face.vIndices[2]].z];

  // 面の法線を計算してnormalに設定
  let normal = calcNormal(v0, v1, v2);
  // 法線が正しく求められたか調べる
  if (normal == null) {
    if (face.vIndices.length >= 4) { // 面が四角形なら別の3点の組み合わせで法線計算
      let v3 = [
        vertices[face.vIndices[3]].x,
        vertices[face.vIndices[3]].y,
        vertices[face.vIndices[3]].z];
      normal = calcNormal(v1, v2, v3);
    }
    if(normal == null){         // 法線が求められなかったのでY軸方向の法線とする
      normal = [0.0, 1.0, 0.0];
    }
  }
  if(reverse){
    normal[0] = -normal[0];
    normal[1] = -normal[1];
    normal[2] = -normal[2];
  }
  face.normal = new Normal(normal[0], normal[1], normal[2]);

  // Devide to triangles if face contains over 3 points.
  if(face.vIndices.length > 3){
    let n = face.vIndices.length - 2;
    let newVIndices = new Array(n * 3);
    let newNIndices = new Array(n * 3);
    for(let i=0; i<n; i++){
      newVIndices[i * 3 + 0] = face.vIndices[0];
      newVIndices[i * 3 + 1] = face.vIndices[i + 1];
      newVIndices[i * 3 + 2] = face.vIndices[i + 2];
      newNIndices[i * 3 + 0] = face.nIndices[0];
      newNIndices[i * 3 + 1] = face.nIndices[i + 1];
      newNIndices[i * 3 + 2] = face.nIndices[i + 2];
    }
    face.vIndices = newVIndices;
    face.nIndices = newNIndices;
  }
  face.numIndices = face.vIndices.length;

  return face;
}

// Analyze the material file
function onReadMTLFile(fileString, mtl) {
  let lines = fileString.split('\n');  // Break up into lines and store them as array
  lines.push(null);           // Append null
  let index = 0;              // Initialize index of line

  // Parse line by line
  let line;      // A string in the line to be parsed
  let name = ""; // Material name
  let sp = new StringParser();  // Create StringParser
  while ((line = lines[index++]) != null) {
    sp.init(line);                  // init StringParser
    let command = sp.getWord();     // Get command
    if(command == null)	 continue;  // check null command

    switch(command){
    case '#':
      continue;    // Skip comments
    case 'newmtl': // Read Material chunk
      name = mtl.parseNewmtl(sp);    // Get name
      continue; // Go to the next line
    case 'Kd':   // Read normal
      if(name == "") continue; // Go to the next line because of Error
      let material = mtl.parseRGB(sp, name);
      mtl.materials.push(material);
      name = "";
      continue; // Go to the next line
    }
  }
  mtl.complete = true;
}

// Check Materials
OBJDoc.prototype.isMTLComplete = function() {
  if(this.mtls.length == 0) return true;
  for(let i = 0; i < this.mtls.length; i++){
    if(!this.mtls[i].complete) return false;
  }
  return true;
}

// Find color by material name
OBJDoc.prototype.findColor = function(name){
  for(let i = 0; i < this.mtls.length; i++){
    for(let j = 0; j < this.mtls[i].materials.length; j++){
      if(this.mtls[i].materials[j].name == name){
        return(this.mtls[i].materials[j].color)
      }
    }
  }
  return(new Color(0.8, 0.8, 0.8, 1));
}

//------------------------------------------------------------------------------
// Retrieve the information for drawing 3D model
OBJDoc.prototype.getDrawingInfo = function() {
  // Create an arrays for vertex coordinates, normals, colors, and indices
  let numIndices = 0;
  for(let i = 0; i < this.objects.length; i++){
    numIndices += this.objects[i].numIndices;
  }
  let numVertices = numIndices;
  let vertices = new Float32Array(numVertices * 3);
  let normals = new Float32Array(numVertices * 3);
  let colors = new Float32Array(numVertices * 4);
  let indices = new Uint16Array(numIndices);

  // Set vertex, normal and color
  let index_indices = 0;
  for(let i = 0; i < this.objects.length; i++){
    let object = this.objects[i];
    for(let j = 0; j < object.faces.length; j++){
      let face = object.faces[j];
      let color = this.findColor(face.materialName);
      let faceNormal = face.normal;
      for(let k = 0; k < face.vIndices.length; k++){
        // Set index
        indices[index_indices] = index_indices;
        // Copy vertex
        let vIdx = face.vIndices[k];
        let vertex = this.vertices[vIdx];
        vertices[index_indices * 3 + 0] = vertex.x;
        vertices[index_indices * 3 + 1] = vertex.y;
        vertices[index_indices * 3 + 2] = vertex.z;
        // Copy color
        colors[index_indices * 4 + 0] = color.r;
        colors[index_indices * 4 + 1] = color.g;
        colors[index_indices * 4 + 2] = color.b;
        colors[index_indices * 4 + 3] = color.a;
        // Copy normal
        let nIdx = face.nIndices[k];
        if(nIdx >= 0){
          let normal = this.normals[nIdx];
          normals[index_indices * 3 + 0] = normal.x;
          normals[index_indices * 3 + 1] = normal.y;
          normals[index_indices * 3 + 2] = normal.z;
        }else{
          normals[index_indices * 3 + 0] = faceNormal.x;
          normals[index_indices * 3 + 1] = faceNormal.y;
          normals[index_indices * 3 + 2] = faceNormal.z;
        }
        index_indices ++;
      }
    }
  }

  return new DrawingInfo(vertices, normals, colors, indices);
}

//------------------------------------------------------------------------------
// MTLDoc Object
//------------------------------------------------------------------------------
let MTLDoc = function() {
  this.complete = false; // MTL is configured correctly
  this.materials = new Array(0);
}

MTLDoc.prototype.parseNewmtl = function(sp) {
  return sp.getWord();         // Get name
}

MTLDoc.prototype.parseRGB = function(sp, name) {
  let r = sp.getFloat();
  let g = sp.getFloat();
  let b = sp.getFloat();
  return (new Material(name, r, g, b, 1));
}

//------------------------------------------------------------------------------
// Material Object
//------------------------------------------------------------------------------
let Material = function(name, r, g, b, a) {
  this.name = name;
  this.color = new Color(r, g, b, a);
}

//------------------------------------------------------------------------------
// Vertex Object
//------------------------------------------------------------------------------
let Vertex = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

//------------------------------------------------------------------------------
// Normal Object
//------------------------------------------------------------------------------
let Normal = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

//------------------------------------------------------------------------------
// Color Object
//------------------------------------------------------------------------------
let Color = function(r, g, b, a) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
}

//------------------------------------------------------------------------------
// OBJObject Object
//------------------------------------------------------------------------------
let OBJObject = function(name) {
  this.name = name;
  this.faces = new Array(0);
  this.numIndices = 0;
}

OBJObject.prototype.addFace = function(face) {
  this.faces.push(face);
  this.numIndices += face.numIndices;
}

//------------------------------------------------------------------------------
// Face Object
//------------------------------------------------------------------------------
let Face = function(materialName) {
  this.materialName = materialName;
  if(materialName == null)  this.materialName = "";
  this.vIndices = new Array(0);
  this.nIndices = new Array(0);
}

//------------------------------------------------------------------------------
// DrawInfo Object
//------------------------------------------------------------------------------
let DrawingInfo = function(vertices, normals, colors, indices) {
  this.vertices = vertices;
  this.normals = normals;
  this.colors = colors;
  this.indices = indices;
}

//------------------------------------------------------------------------------
// Constructor
let StringParser = function(str) {
  this.str;   // Store the string specified by the argument
  this.index; // Position in the string to be processed
  this.init(str);
}
// Initialize StringParser object
StringParser.prototype.init = function(str){
  this.str = str;
  this.index = 0;
}

// Skip delimiters
StringParser.prototype.skipDelimiters = function()  {
    let i, len;
  for(i = this.index, len = this.str.length; i < len; i++){
    let c = this.str.charAt(i);
    // Skip TAB, Space, '(', ')
    if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"') continue;
    break;
  }
  this.index = i;
}

// Skip to the next word
StringParser.prototype.skipToNextWord = function() {
  this.skipDelimiters();
  let n = getWordLength(this.str, this.index);
  this.index += (n + 1);
}

// Get word
StringParser.prototype.getWord = function() {
  this.skipDelimiters();
  let n = getWordLength(this.str, this.index);
  if (n == 0) return null;
  let word = this.str.substr(this.index, n);
  this.index += (n + 1);

  return word;
}

// Get integer
StringParser.prototype.getInt = function() {
  return parseInt(this.getWord());
}

// Get floating number
StringParser.prototype.getFloat = function() {
  return parseFloat(this.getWord());
}

// Get the length of word
function getWordLength(str, start) {
  let n = 0, i, len;
  for(i = start, len = str.length; i < len; i++){
    let c = str.charAt(i);
    if (c == '\t'|| c == ' ' || c == '(' || c == ')' || c == '"') 
	break;
  }
  return i - start;
}

//------------------------------------------------------------------------------
// Common function
//------------------------------------------------------------------------------
function calcNormal(p0, p1, p2) {
  // v0: a vector from p1 to p0, v1; a vector from p1 to p2
  let v0 = new Float32Array(3);
  let v1 = new Float32Array(3);
  for (let i = 0; i < 3; i++){
    v0[i] = p0[i] - p1[i];
    v1[i] = p2[i] - p1[i];
  }

  // The cross product of v0 and v1
  let c = new Float32Array(3);
  c[0] = v0[1] * v1[2] - v0[2] * v1[1];
  c[1] = v0[2] * v1[0] - v0[0] * v1[2];
  c[2] = v0[0] * v1[1] - v0[1] * v1[0];

  // Normalize the result
  let v = new Vector3(c);
  v.normalize();
  return v.elements;
}
