import * as conversions from '/conversions.mjs'

const vecDot = (vec1, vec2) => vec1.reduce((acc, factor, i) => acc + factor * vec2[i], 0)
const matMul = (vec, mat) => mat.map((row) => vecDot(row, vec))

export default class Color {
  constructor(r, g, b) {
    const [h, s, v] = conversions.srgb_to_okhsv(r * 255, g * 255, b * 255)
  
    this.vec = [this.red, this.green, this.blue] = [r, g, b]
    this.hex = conversions.rgb_to_hex(r, g, b).toUpperCase()
    this.hue = h
    this.chroma = isNaN(s) ? 0 : s
    this.light = isNaN(v) ? 0 : v
    this.luminance = Math.pow(conversions.srgb_to_okhsl(r, g, b)[2], 3)
  }

  static fromHex(hex) {
    const [r, g, b] = conversions.hex_to_rgb(hex).map((n) => n / 255)

    return new Color(r, g, b)
  }

  static fromHsv(h, s, v) {
    const [r, g, b] = conversions.okhsv_to_srgb(h, s, v).map((n) => isNaN(n) ? 0 : n)
    const color = new Color(r, g, b)

    // Keeps original parameters
    color.hue = h
    color.chroma = s
    color.light = v

    return color
  }

  copy() {
    return new Color(this.red, this.green, this.blue)
  }

  transform(matrix) {
    if (matrix.length != 3 || matrix.some(row => row.length != 3)) throw new Error('Invalid matrix size. use 3 by 3')

    const [r, g, b] = matMul(this.vec, matrix)

    return new Color(r, g, b)
  }

  getContrast(color) {
    const l1 = this.luminance + 0.05
    const l2 = color.luminance + 0.05

    return l1 > l2 ? l1 / l2 : l2 / l1
  }
}
