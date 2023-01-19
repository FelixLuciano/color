import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'


class Color {
  constructor(r = 1, g = 1, b = 1) {
    if (r < 0 || r > 1) throw new Error('Red value is out of range')
    if (g < 0 || g > 1) throw new Error('Green value is out of range')
    if (b < 0 || b > 1) throw new Error('Blue value is out of range')

    const vec = [this.red, this.green, this.blue] = [r, g, b]
    const cmax = Math.max(r, g, b)
    const cmin = Math.min(r, g, b)
    const delta = cmax - cmin
    this.hex = '#' + vec.map(value => Math.round(value * 15).toString(16).toUpperCase()).join('')
    this.hue = 60 * (
      delta === 0 ? 0 :
      cmax === r ? (g - b) / delta + (g < b ? 6 : 0) :
      cmax === g ? (b - r) / delta + 2 :
      cmax === b ? (r - g) / delta + 4 :
      null
    )
    this.chroma = cmax === 0 ? 0 : delta / cmax
    this.light = cmax
    this.transition = null
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
      h >= 360 || h < 60 ? [c, x, 0] :
      h >= 60 && h < 120 ? [x, c, 0] :
      h >= 120 && h < 180 ? [0, c, x] :
      h >= 180 && h < 240 ? [0, x, c] :
      h >= 240 && h < 300 ? [x, 0, c] :
      h >= 300 && h < 360 ? [c, 0, x] :
      null
    ).map(c => c + m)
    const color = new Color(...rgb)

    // Keeps original parameters
    color.hue = h
    color.chroma = s
    color.light = v

    return color
  }
}


function picker() {
  function getRandomColor() {
    return new Color(Math.random(), Math.random(), Math.random())
  }

  return {
    hexInput: '#FFF',
    color: new Color(),
    randomColor: null,
    $storage: this.$persist([]).as('com.lucianofelix.tri.storage'),

    get hex() {
      return this.hexInput
    },
    set hex(value) {
      if (!value.match(/^#[\da-f]{0,6}$/i))
        return

      this.hexInput = value.toUpperCase()

      try {
        this.color = Color.fromHex(value)
        this.hexInput = this.color.hex
      }
      catch (error) {
        console.warn(error)
      }
    },
    get red() {
      return this.color.red
    },
    set red(value) {
      const oldHue = this.hue

      this.setColor(new Color(value, this.green, this.blue))

      // keeps continuity when cycling from blue back to red
      if (this.hue == 0 && oldHue > 240) this.color.hue = 360
    },
    get redDisplay() {
      return new Color(this.red, 0, 0)
    },
    get green() {
      return this.color.green
    },
    set green(value) {
      this.setColor(new Color(this.red, value, this.blue))
    },
    get greenDisplay() {
      return new Color(0, this.green, 0)
    },

    get blue() {
      return this.color.blue
    },
    set blue(value) {
      const oldHue = this.hue

      this.setColor(new Color(this.red, this.green, value))

      // keeps continuity when cycling from blue back to red
      if (this.color.hue == 0 && oldHue > 240) this.color.hue = 360
    },
    get blueDisplay() {
      return new Color(0, 0, this.blue)
    },

    get hue() {
      return this.color.hue
    },
    set hue(value) {
      this.color = Color.fromHsv(value, this.chroma, this.light)
      this.hexInput = this.color.hex
    },
    get hueDisplay() {
      return Color.fromHsv(this.hue, 1, 1)
    },

    get chroma() {
      return this.color.chroma
    },
    set chroma(value) {
      this.color = Color.fromHsv(this.hue, value, this.light)
      this.hexInput = this.color.hex
    },
    get chromaDisplay() {
      return Color.fromHsv(this.hue, this.chroma, .5 + this.chroma / 2)
    },

    get light() {
      return this.color.light
    },
    set light(value) {
      this.color = Color.fromHsv(this.hue, this.chroma, value)
      this.hexInput = this.color.hex
    },
    get lightDisplay() {
      return Color.fromHsv(0, 0, this.light)
    },

    get complementary() {
      const hue = (this.color.hue + 180 + 43) % 360

      return Color.fromHsv(hue, this.color.chroma, this.color.light)
    },
    get complementary2() {
      const hue = (this.color.hue + 180 - 43) % 360

      return Color.fromHsv(hue, this.color.chroma, this.color.light)
    },
    get storage() {
      return this.$storage.map(item => Color.fromHex(item))
    },

    setColor(color) {
      const oldHue = this.hue
      const oldChroma = this.chroma

      this.color = color
      this.hexInput = this.color.hex

      // keeps continuity when set to 0
      if (this.light === 0) {
        this.hue = oldHue
        this.chroma = oldChroma
      }
    },
    selectColor(color) {
      if (!(color instanceof Color))
        throw new Error(`Object is not a instance of Color`)

      const dR = (color.red - this.color.red) / 16
      const dG = (color.green - this.color.green) / 16
      const dB = (color.blue - this.color.blue) / 16
      const round = (num) => Math.round((num + Number.EPSILON) * 1_000) / 1_000
      const transition = (step = 16) => {
        if (step > 0) {
          const r = round(color.red - dR * step)
          const g = round(color.green - dG * step)
          const b = round(color.blue - dB * step)

          this.setColor(new Color(r, g, b))
          this.transition = requestAnimationFrame(() => transition(step - 1))
        }
        else
          this.color = color
      }

      this.$refs.color.scrollIntoView({ block: 'nearest' })
      cancelAnimationFrame(this.transition)
      transition()
    },
    selectRandomColor() {
      this.selectColor(this.randomColor)

      this.randomColor = getRandomColor()
    },

    store(color) {
      if (!this.$storage.includes(color.hex))
        this.$storage.unshift(color.hex)
    },

    init() {
      this.color.hue = 60
      this.randomColor = getRandomColor()
    },
  }
}


Alpine.plugin(persist)
Alpine.data('picker', picker)
Alpine.start()

document.querySelector('#logo').addEventListener('click', event => event.preventDefault())
