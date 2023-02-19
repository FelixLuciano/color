import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'


function picker() {
  const BLACK = new Color(0, 0, 0)
  const WHITE = new Color(1, 1, 1)

  return {
    color: new Color(1, 1, 1),

    hexInput: '#FFF',
    inputTimeout: null,
    get hex() {
      return this.hexInput
    },
    set hex(value) {
      if (!value.match(/^#[\da-f]{0,6}$/i))
        return

      this.hexInput = value.toUpperCase()

      clearTimeout(this.inputTimeout)
      this.inputTimeout = setTimeout(() => {
        try {
          this.color = Color.fromHex(value)
          this.hexInput = this.color.hex
        }
        catch (error) {
          console.warn(error)
        }
      }, 512)
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
    get greenDisplayBind() {
      return this.getDisplayBind('greenDisplay')
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

    randomColor: null,
    selectRandomColor() {
      this.selectColor(this.randomColor)

      this.randomColor = getRandomColor()
    },

    get deuteranopia() {
      return this.color.transform([
        [0.625, 0.375, 0.000],
        [0.700, 0.300, 0.000],
        [0.000, 0.300, 0.700],
      ])
    },
    get protanopia() {
      return this.color.transform([
        [0.567, 0.433, 0.000],
        [0.558, 0.442, 0.000],
        [0.000, 0.242, 0.758],
      ])
    },
    get tritanopia() {
      return this.color.transform([
        [0.950, 0.050, 0.000],
        [0.000, 0.433, 0.567],
        [0.000, 0.475, 0.525],
      ])
    },
    get achromatomaly() {
      return this.color.transform([
        [0.618, 0.320, 0.062],
        [0.163, 0.775, 0.062],
        [0.163, 0.320, 0.516],
      ])
    },
    get achromatopsia() {
      return this.color.transform([
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
      ])
    },
    
    background: Color.fromHex('#CCC'),
    foreground: Color.fromHex('#333'),
    setBackgroundColor() {
      this.background = this.color.copy()
    },
    setForegroundColor() {
      this.foreground = this.color.copy()
    },
    swapBackgroundForegroud() {
      [this.background, this.foreground] = [this.foreground, this.background]
    },

    get contrast() {
      return this.background.getContrast(this.foreground)
    },
    get contrastGrade() {
      const contrast = parseFloat(this.contrast.toFixed(2))

      if (contrast >= 7) return `${contrast} (AAA)`
      else if (contrast >= 4.5) return `${contrast} (AA)`
      else if (contrast >= 3) return `${contrast} (A)`
      else return `${contrast} (!)`
    },
    get contrastGradeDisplay() {
      if (this.contrast >= 7) return Color.fromHex('#2D2')
      else if (this.contrast >= 4.5) return Color.fromHex('#DD2')
      else if (this.contrast >= 3) return Color.fromHex('#D72')
      else return Color.fromHex('#D22')
    },

    getDisplayBind(name) {
      return {
        ':class': `getDisplayClass(${name})`,
        ':style': `getDisplayStyle(${name})`,
      }
    },
    getDisplayClass(color) {
      return {
        'color--dark': color.getContrast(WHITE) > color.getContrast(BLACK),
        'color--darken': color.light < .25,
      }
    },
    getDisplayStyle(color) {
      return {
        '--color': color.hex
      }
    },
    image: null,
    imagePointer: WHITE,
    get imageAverage() {
      if (this.image === null) {
        return WHITE
      }

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      canvas.width = this.image.width
      canvas.height = this.image.height
      context.drawImage(this.image, 0, 0, canvas.width, canvas.height)

      const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
      const area = canvas.width * canvas.height
      let r = 0
      let g = 0
      let b = 0
  
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i+1]
        b += data[i+2]
      }

      r = ~~(r / area) / 255
      g = ~~(g / area) / 255
      b = ~~(b / area) / 255

      return new Color(r, g, b)
    },
    async getImageFromFIle() {
      const input = document.createElement('input')

      input.type = 'file'
      input.accept = 'image/*'

      input.addEventListener('change', async (event) => {
        const blob = event.target.files[0]
        
        if (!blob.type.startsWith('image/'))
          throw new Error('Invalid file format')

        this.image = await createImageBitmap(blob)
      })
      
      input.click()
    },
    async getImageFromClipboard() {
      const clipboardData = await navigator.clipboard.read()
      let image_type = null
      const image = clipboardData.find(item =>
        item.types.some(type => {
          if(type.startsWith( 'image/')) {
            image_type = type
            return true
          }
        })
      )
      if (image === undefined || image_type === null)
        throw new Error('There are no images on the clipboard')

      const imageBlob = await image.getType(image_type)

      this.image = await createImageBitmap(imageBlob)
    },
    async displayImage(canvas) {
      const ctx = canvas.getContext('2d')
      const ratio = this.image.height / this.image.width
      const width = canvas.offsetWidth
      const height = width * ratio
      const x = (canvas.offsetWidth - width) / 2
      const y = 0

      canvas.width = canvas.offsetWidth
      canvas.height = height
      ctx.imageSmoothingEnabled = false

      ctx.drawImage(this.image, x, y, width, height)
      canvas.scrollIntoView({ block: 'nearest' })
    },
    selectCanvasColor(canvas, {pageX, pageY}) {
      const ctx = canvas.getContext('2d')
      const x = pageX - canvas.offsetLeft
      const y = pageY - canvas.offsetTop
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
      const color = new Color(r/255, g/255, b/255)

      this.imagePointer = color
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

      if (this.color.hex === color.hex)
        return

      this.$refs.colorInput.readOnly = true

      const dR = (color.red - this.color.red) / 16
      const dG = (color.green - this.color.green) / 16
      const dB = (color.blue - this.color.blue) / 16
      const round = (num) => Math.round((num + Number.EPSILON) * 1_024) / 1_024
      const transition = (step = 16) => {
        if (step > 0) {
          const r = round(color.red - dR * step)
          const g = round(color.green - dG * step)
          const b = round(color.blue - dB * step)

          this.setColor(new Color(r, g, b))
          this.transition = requestAnimationFrame(() => transition(step - 1))
        }
        else {
          this.setColor(color)
          this.$refs.colorInput.focus()

          this.$refs.colorInput.readOnly = false
        }
      }

      this.$refs.colorInput.scrollIntoView({ block: 'nearest' })
      cancelAnimationFrame(this.transition)
      transition()
    },

    $storage: this.$persist([]).as('com.lucianofelix.tri.storage'),
    confirmDelete: false,
    get storage() {
      return this.$storage.map(item => Color.fromHex(item))
    },
    store(color) {
      if (!this.$storage.includes(color.hex))
        this.$storage.unshift(color.hex)
    },
    deleteColor(color) {
      if (!this.confirmDelete) {
        this.confirmDelete = true

        setTimeout(() => this.confirmDelete = false, 2048)
      }
      else {
        const index = this.$storage.indexOf(color.hex)

        this.confirmDelete = false
        this.$storage.splice(index, 1)
      }
    },


    init() {
      this.color.hue = 60
      this.randomColor = getRandomColor()
    },
  }

  function getRandomColor() {
    return new Color(Math.random(), Math.random(), Math.random())
  }
}


class Color {
  constructor(r, g, b) {
    if (r < 0 || r > 1) throw new Error('Red value is out of range')
    if (g < 0 || g > 1) throw new Error('Green value is out of range')
    if (b < 0 || b > 1) throw new Error('Blue value is out of range')

    const vec = [this.red, this.green, this.blue] = [r, g, b]
    const sRGBVec = vec.map((n) => n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)
    const cmax = Math.max(r, g, b)
    const cmin = Math.min(r, g, b)
    const delta = cmax - cmin
    this.hex = '#' + vec.map(value => Math.round(value * 15).toString(16).toUpperCase()).join('')
    this.hue = 60 * (
      delta === 0 ? 0 :
      cmax  === r ? (g - b) / delta + (g < b ? 6 : 0) :
      cmax  === g ? (b - r) / delta + 2 :
      cmax  === b ? (r - g) / delta + 4 :
      null
    )
    this.chroma = cmax === 0 ? 0 : delta / cmax
    this.light = cmax
    this.transition = null
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
    const color = new Color(...rgb.map(n => Math.round(n * 15) / 15))

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


Alpine.plugin(persist)
Alpine.data('picker', picker)
Alpine.start()
