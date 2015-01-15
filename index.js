
var shell = require('gl-now')()
  , pressed = require('mouse-pressed')(shell.canvas)

var TEX_DIM = 64
  , POINTS_COUNT = TEX_DIM * 2
  , POINT_SIZE = 0.03

var speed = 1
  , vertices
  , indexes
  , program
  , gl
  , points = []

function error (msg) {
  console.log(msg)
}

shell.on('gl-init', function() {
  gl = shell.gl

  if (!gl.getExtension('OES_texture_float')) {
    return error('OES_texture_float extension is not supported')
  }

  initShaders()
  initTexture()
  initBuffers()

  for (var i = 0; i < POINTS_COUNT; ++i) {
    add({
      x: Math.random() * shell.canvas.width,
      y: Math.random() * shell.canvas.height
    })
  }

})

shell.on('gl-render', function(t) {
  gl = shell.gl

  update(speed)

  gl.bindBuffer(gl.ARRAY_BUFFER, vertices)
  gl.vertexAttribPointer(program.aPosition, 3, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexes)
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)

  gl.uniform1f(program.uSize, POINT_SIZE)
  gl.uniform2f(program.uScreen, shell.canvas.width, shell.canvas.height)
  gl.uniform1f(program.uDim, TEX_DIM) 

  gl.flush()
})

shell.on('gl-error', function() {
  error('No GL!')
})

function add(pos) {
  var dirX = 2 * Math.random() - 1,
    dirY = 2 * Math.random() - 1,
    len = Math.sqrt(dirX * dirX + dirY * dirY)

    points.push({
      x: pos.x,
      y: pos.y,
      dirX: dirX / len,
      dirY: dirY / len
    })
}

function reflect(m, normalX, normalY) {
  var prefix = -2 * (m.dirX * normalX + m.dirY * normalY)
  m.dirX = prefix * normalX + m.dirX
  m.dirY = prefix * normalY + m.dirY
}

function update (t) {

  var canvas = shell.canvas

  for (var i = 0; i < points.length; ++i) {
    var point = points[i]

    if(point.x > canvas.width) {
      reflect(point, -1, 0)
      point.x = canvas.width - 1
    }else if(point.x < 0) {
      reflect(point, 1, 0)
      point.x = 1
    }else if(point.y > canvas.height) {
      reflect(point, 0, -1)
      point.y = canvas.height - 1
    }else if(point.y < 0) {
      reflect(point, 0, 1)
      point.y = 1
    }

    point.x += point.dirX * speed * t
    point.y -= point.dirY * speed * t
  }

  points[0].x = shell.mouse[0]
  points[0].y = shell.canvas.height - shell.mouse[1]

  updatePositionTexture()
}

function initShaders () {

  var fragmentShader = makeShader('shader-fs')
  var vertexShader = makeShader('shader-vs')

  program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    error('Could not initialise shaders')
  }

  gl.useProgram(program)

  program.aPosition = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(program.aPosition)

  program.uPositionTex = gl.getUniformLocation(program, 'uPositionTex')
  program.uSize = gl.getUniformLocation(program, 'uSize')
  program.uColor = gl.getUniformLocation(program, 'uColor')
  program.uScreen = gl.getUniformLocation(program, 'uScreen')
  program.uDim = gl.getUniformLocation(program, 'uDim')
}

function initTexture() {
  var texture = gl.createTexture()

  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.uniform1i(program.uPositionTex, texture)
}

function updatePositionTexture() {
  var index
  var texData = new Float32Array(TEX_DIM * 4)

  for (var i = 0; i < points.length; ++i) {
    if (i % 2 == 0) {
      index = parseInt(i / 2) * 4
    } else {
      index = parseInt(i / 2) * 4 + 2
    }

    texData[index + 0] = points[i].x
    texData[index + 1] = points[i].y
  }

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    TEX_DIM,
    1,
    0,
    gl.RGBA,
    gl.FLOAT,
    texData
  )
}

function initBuffers () {
  vertices = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices)
  data = new Float32Array([
    0.0, 1.0, 0.0,
    1.0, 1.0, 0.0,
    1.0, 0.0, 0.0,
    0.0, 0.0, 0.0
  ])
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

  indexes = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexes)
  data = new Uint16Array([0, 1, 2, 0, 2, 3])
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW)
}

function makeShader (domId) {
  var tag = document.getElementById(domId)
  ,  shaderSrc = tag.firstChild.textContent
  ,  shader

  if (tag.type == 'x-shader/x-fragment') {
    shader = gl.createShader(gl.FRAGMENT_SHADER)
  } else if (tag.type == 'x-shader/x-vertex') {
    shader = gl.createShader(gl.VERTEX_SHADER)
  } else {
    return null
  }

  gl.shaderSource(shader, shaderSrc)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    error(gl.getShaderInfoLog(shader))
  }

  return shader
}
