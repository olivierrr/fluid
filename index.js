
var gl_utils = require('webgl-utils')

var gl

/**
 *
 */
function initGL (canvas) {

  var fs = [
    'void main(void) {',
    '}'
  ].join('')

  var vs = [
    'void main(void) {',
    '}'
  ].join('')

  gl = gl_utils(canvas, fs, vs)

  if(!gl) {
    console.log('no gl.')
    return
  }

  var W = canvas.width = window.innerWidth
  var H = canvas.height = window.innerHeight

  gl.viewport(0, 0, W, H)
  gl.width = W
  gl.height = H
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

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