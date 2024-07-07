import Alpine from 'alpinejs'

import Color from '/color.mjs'
import swatches from '/swatches/swatches.mjs'


export function picker() {
  const BLACK = new Color(0, 0, 0)
  const WHITE = new Color(1, 1, 1)

  return {
    swatches,
    createColor: Color,
    color: new Color(1, 1, 1),

    hexInput: '#FFFFFF',
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

    get green() {
      return this.color.green
    },
    set green(value) {
      this.setColor(new Color(this.red, value, this.blue))
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

    get hue() {
      return this.color.hue
    },
    set hue(value) {
      this.color = Color.fromHsv(value, this.chroma, this.light)
      this.hexInput = this.color.hex
    },
    get hueDisplay() {
      return Color.fromHsv(this.hue, .8, .8)
    },

    get chroma() {
      return this.color.chroma
    },
    set chroma(value) {
      this.color = Color.fromHsv(this.hue, value, this.light)
      this.hexInput = this.color.hex
    },
    get chromaDisplay() {
      return Color.fromHsv(this.hue, this.chroma * .8, this.chroma * .5 + .3)
    },

    get light() {
      return this.color.light
    },
    set light(value) {
      this.color = Color.fromHsv(this.hue, this.chroma, value)
      this.hexInput = this.color.hex
    },

    get complementary1() {
      const hue = (this.color.hue + 180 + 43) % 360

      return Color.fromHsv(hue, this.color.chroma, this.color.light)
    },
    get complementary2() {
      const hue = (this.color.hue + 180 - 43) % 360

      return Color.fromHsv(hue, this.color.chroma, this.color.light)
    },

    randomColor: null,
    setRandomColor() {
      this.setColor(this.randomColor)

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

    background: Color.fromHex('#333333'),
    foreground: Color.fromHex('#cccccc'),
    setBackgroundColor() {
      this.background = this.color.copy()
    },
    setForegroundColor() {
      this.foreground = this.color
    },
    swapBackgroundForegroud() {
      [this.background, this.foreground] = [this.foreground, this.background]
    },
    enhanceContrast() {
      let target = 3
      let step = 0.01

      if (this.contrast >= target) target = 4.5
      if (this.contrast >= target) target = 7
      if (this.background.getContrast(WHITE) < this.background.getContrast(BLACK)) step = -0.01

      for (let light = this.foreground.light; this.contrast < target && light >= 0.0 && light <= 1.0; light += step) {
        this.foreground = Color.fromHsv(this.foreground.hue, this.foreground.chroma, light)
      }
      for (let chroma = this.foreground.chroma; this.contrast < target && chroma >= 0.0 && chroma <= 1.0; chroma -= step) {
        this.foreground = Color.fromHsv(this.foreground.hue, chroma, this.foreground.light)
      }
    },

    get contrast() {
      return this.background.getContrast(this.foreground)
    },
    get contrastDisplay() {
      const max = Math.round((Math.max(this.background.luminance, this.foreground.luminance) + 0.05) * 100)
      const min = Math.round((Math.min(this.background.luminance, this.foreground.luminance) + 0.05) * 100)

      return `${max}:${min}`
    },
    get contrastGrade() {
      if (this.contrast >= 7) return 'AAA'
      else if (this.contrast >= 4.5) return 'AA'
      else if (this.contrast >= 3) return 'A'
      else return 'FAIL'
    },
    get contrastGradeDisplay() {
      if (this.contrast >= 7) return Color.fromHex('#22DD22')
      else if (this.contrast >= 4.5) return Color.fromHex('#DDDD22')
      else if (this.contrast >= 3) return Color.fromHex('#DD7722')
      else return Color.fromHex('#DD2222')
    },

    darkAmount: 6,
    darkHue: 0.0,
    darkChroma: 1.0,
    darkLevel: 0.8,
    get darkFade() {
      let hue = this.hue + this.darkHue
      const saturation = this.darkChroma < 0 ? this.chroma * (this.darkChroma + 1) : this.chroma + (1 - this.chroma) * this.darkChroma
      const value = this.light * (1 - this.darkLevel)

      // if (hue < 0) {
      //   hue += 360
      // }

      return Color.fromHsv(hue, saturation, value)
    },
    get darkHueDisplay() {
      return Color.fromHsv(this.darkFade.hue, .8, .8)
    },
    get darkChromaDisplay() {
      return Color.fromHsv(this.darkFade.hue, this.darkFade.chroma * .8, this.darkFade.chroma * .5 + .3)
    },
    lightAmount: 6,
    lightHue: 0.0,
    lightChroma: -0.8,
    lightLevel: 1.0,
    get lightFade() {
      let hue = this.hue + this.lightHue
      // let hue = (this.hue + this.lightHue) % 361
      const saturation = this.lightChroma < 0 ? this.chroma * (this.lightChroma + 1) : this.chroma + (1 - this.chroma) * this.lightChroma
      const value = this.light + (1 - this.light) * this.lightLevel

      // if (hue < 0) {
      //   hue += 360
      // }

      return Color.fromHsv(hue, saturation, value)
    },
    get lightHueDisplay() {
      return Color.fromHsv(this.lightFade.hue, .8, .8)
    },
    get lightChromaDisplay() {
      return Color.fromHsv(this.lightFade.hue, this.lightFade.chroma * .8, this.lightFade.chroma * .5 + .3)
    },
    get fades() {
      const fades = []

      function interpolate(c1, c2) {
        let dHue = c2.hue - c1.hue
        const dChroma = c2.chroma - c1.chroma
        const dLight = c2.light - c1.light

        return function (x) {
          const hue = (x * dHue + c1.hue) % 361
          const chroma = x * dChroma + c1.chroma
          const light = x * dLight + c1.light

          return Color.fromHsv(hue, chroma, light)
        }
      }

      const interpolateDark = interpolate(this.color, this.darkFade)
      const interpolateLight = interpolate(this.lightFade, this.color)

      for (let i = this.darkAmount; i > 0; i--) {
        fades.push(interpolateDark(i / this.darkAmount))
      }

      fades.push(this.color)

      for (let i = this.lightAmount; i > 0; i--) {
        fades.push(interpolateLight((i - 1) / this.lightAmount))
      }

      return fades
    },

    getDisplayBind(name) {
      return {
        ':class': `getDisplayClass(${name})`,
        ':style': `getDisplayStyle(${name})`,
      }
    },
    getDisplayClass(color) {
      const inverse = color.getContrast(WHITE) < color.getContrast(BLACK)

      return {
        'text-surface-dim': !inverse,
        'text-surface-inverse': inverse,
      }
    },
    getDisplayStyle(color) {
      return {
        'background-color': color.hex
      }
    },
    image: null,
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

        try {
          this.image = await createImageBitmap(blob)
        }
        catch {
          ui('#snackbar-error-file')
        }
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
      if (image === undefined || image_type === null) {
        ui('#snackbar-error-clipboard')
        throw new Error('There are no images on the clipboard')
      }

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
    },
    setColorFromCanvas(canvas, {offsetX, offsetY}) {
      const ctx = canvas.getContext('2d')
      const [r, g, b] = ctx.getImageData(offsetX, offsetY, 1, 1).data
      const color = new Color(r/255, g/255, b/255)

      this.setColor(color)
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

    init() {
      this.color.hue = 300
      this.randomColor = getRandomColor()
      this.foreground = this.color
    },
  }

  function getRandomColor() {
    return new Color(Math.random(), Math.random(), Math.random())
  }
}

Alpine.data('picker', picker)
Alpine.start()
