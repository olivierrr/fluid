
var gl_utils = require('webgl-utils')
  , mat4 = require('gl-mat4')

var gl

var W = window.innerWidth
  , H = window.innerHeight

/**
 *
 */
function initGL (canvas) {

  var fs = [
    'void main(void) {',
    '}'
  ].join('')

  var vs = [
    'uniform mat4 uMVMatrix;',
    'uniform mat4 uPMatrix;',
    'void main(void) {',
    '}'
  ].join('')

  gl = gl_utils(canvas, fs, vs)

  if(!gl) {
    console.log('no gl.')
    return
  }

  gl.width = canvas.width = W
  gl.height = canvas.height = H
  gl.viewport(0, 0, W, H)
  gl.clearColor(0.1, 0.3, 0.7, 1.0)

  // perspective uniform
  gl.program.pMatrixUniform = gl.getUniformLocation(gl.program, "uPMatrix")
  var pMatrix = mat4.create()
  mat4.perspective(pMatrix, 45.0, W/H, 0.1, 90.0)

  // model uniform
  gl.program.mvMatrixUniform = gl.getUniformLocation(gl.program, "uMVMatrix")
  var mvMatrix = mat4.create()

  ;(function update() {

    gl.uniformMatrix4fv(gl.program.pMatrixUniform, false, pMatrix)
    gl.uniformMatrix4fv(gl.program.mvMatrixUniform, false, mvMatrix)

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.flush()

    window.requestAnimationFrame(update)
  })()

}

/**
 * @return {node#canvas}
 */
function appendCanvas () {

  document.body.style.overflow = 'hidden'
  document.body.style.margin = 0
  document.body.style.padding = 0

  var canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  return canvas

}

initGL(appendCanvas())

