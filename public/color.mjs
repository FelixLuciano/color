export default class Color {
  constructor(r, g, b) {
    if (r < 0 || r > 1) throw new Error('Red value is out of range')
    if (g < 0 || g > 1) throw new Error('Green value is out of range')
    if (b < 0 || b > 1) throw new Error('Blue value is out of range')

    const vec = [this.red, this.green, this.blue] = [r, g, b]
    const sRGBVec = vec.map((n) => n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)
    const cmax = Math.max(r, g, b)
    const cmin = Math.min(r, g, b)
    const delta = cmax - cmin
    this.hex = '#' + vec.map(value => Math.round(value * 255).toString(16).toUpperCase().padStart(2, '0')).join('')
    this.hue = 60 * (
      delta === 0 ? 0 :
      cmax  === r ? (g - b) / delta + (g < b ? 6 : 0) :
      cmax  === g ? (b - r) / delta + 2 :
      cmax  === b ? (r - g) / delta + 4 :
      null
    )
    this.chroma = cmax === 0 ? 0 : delta / cmax
    this.light = cmax
    this.luminance = 0.2126 * sRGBVec[0] + 0.7152 * sRGBVec[1] + 0.0722 * sRGBVec[2]
  }

  static fromHex(hex) {
    if (!hex.match(/^#([\da-f]{3}){1,2}$/i))
      throw new Error(`${hex} is not a valid hexadecimal color code.`)

    const size = hex.length === 7 ? 2 : 1
    const max = hex.length === 7 ? 255 : 15
    const matches = hex.match(new RegExp(`[\\da-f]{${size}}`, 'gi'))

    if (!matches) throw new Error('Invalid hex code')

    const [r, g, b] = matches.map((match) => parseInt(match, 16) / max)

    return new Color(r, g, b)
  }

  static fromHsv(h, s, v) {
    if (s < 0 || s > 1) throw new Error(`Saturation value {s} is out of range`)
    if (v < 0 || v > 1) throw new Error(`Value {v} is out of range`)

    const c = s * v
    const x = c * (1 - Math.abs(h / 60 % 2 - 1))
    const m = v - c
    let rgb = (
      h >= 360 || h <  60 ? [c, x, 0] :
      h >=  60 && h < 120 ? [x, c, 0] :
      h >= 120 && h < 180 ? [0, c, x] :
      h >= 180 && h < 240 ? [0, x, c] :
      h >= 240 && h < 300 ? [x, 0, c] :
      h >= 300 && h < 360 ? [c, 0, x] :
      null
    ).map(c => c + m)
    const color = new Color(...rgb.map(n => Math.round(n * 255) / 255))

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

    const vec = [this.red, this.green, this.blue]
    const [r, g, b] = matrix.map((row) => {
      return row.reduce((acc, curr, i) => acc + curr * vec[i], 0)
    })

    return new Color(r, g, b)
  }

  getContrast(color) {
    const l1 = this.luminance + 0.05
    const l2 = color.luminance + 0.05

    return l1 > l2 ? l1 / l2 : l2 / l1
  }
}
