import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'


class Color {
    constructor(r = 1, g = 1, b = 1) {
        this.state = {
            rgb: [r, g, b],
            hex: null,
            hue: null,
            saturation: null,
            brightness: null,
        }
        this.transition = null

        this.updateHsbAndHexFromRgb()
    }

    get vector() {
        return this.state.rgb
    }
    set vector(values) {
        const dR = (values[0] - this.state.rgb[0]) / 10
        const dG = (values[1] - this.state.rgb[1]) / 10
        const dB = (values[2] - this.state.rgb[2]) / 10
        const round = (num) => Math.round((num + Number.EPSILON) * 1_000) / 1_000

        const transition = (i) => {
            this.state.rgb[0] = round(this.state.rgb[0] + dR)
            this.state.rgb[1] = round(this.state.rgb[1] + dG)
            this.state.rgb[2] = round(this.state.rgb[2] + dB)

            if (i < 9)
                this.transition = requestAnimationFrame(() => transition(i + 1))
            else
                this.state.rgb = values

            this.updateHsbAndHexFromRgb()
        }

        cancelAnimationFrame(this.transition)
        transition(0)
    }

    get red() {
        return this.state.rgb[0]
    }
    set red(value) {
        this.state.rgb[0] = parseFloat(value)

        this.updateHsbAndHexFromRgb()
    }

    get green() {
        return this.state.rgb[1]
    }
    set green(value) {
        this.state.rgb[1] = parseFloat(value)

        this.updateHsbAndHexFromRgb()
    }

    get blue() {
        return this.state.rgb[2]
    }
    set blue(value) {
        this.state.rgb[2] = parseFloat(value)

        this.updateHsbAndHexFromRgb()
    }

    get hex() {
        return this.state.hex
    }
    set hex(hex) {
        this.state = Color.fromHex(hex).state
    }

    get hue() {
        return this.state.hue
    }
    set hue(value) {
        this.setHSb(parseInt(value), this.state.saturation, this.state.brightness)
    }

    get saturation() {
        return this.state.saturation
    }
    set saturation(value) {
        this.setHSb(this.state.hue, parseFloat(value), this.state.brightness)
    }

    get brightness() {
        return this.state.brightness
    }
    set brightness(value) {
        this.setHSb(this.state.hue, this.state.saturation, parseFloat(value))
    }

    updateHsbAndHexFromRgb() {
        const [r, g, b] = this.vector
        const cmax = Math.max(r, g, b)
        const cmin = Math.min(r, g, b)
        const delta = (cmax - cmin)

        let h
        if (delta == 0) h = 0
        else if (cmax == r) h = ((g - b) / delta) % 6
        else if (cmax == g) h = (b - r) / delta + 2
        else h = (r - g) / delta + 4

        if (h < 0) h += 6
        if (h == 0 && this.state.hue > 0) h = 6

        this.state.hue = h * 60
        this.state.brightness = (cmax + cmin) / 2
        this.state.saturation = delta == 0 ? 0 : delta / (1 - Math.abs(2 * this.state.brightness - 1))
        this.state.hex = '#' + this.vector.map(value => parseInt(value * 15).toString(16).toUpperCase()).join('')
    }

    setHSb(h, s, l) {
        this.state = Color.fromHsb(h, s, l).state
    }

    static fromHex(hex) {
        if (!hex.match(/^#([\da-f]{3}){1,2}$/i)) {
            throw new Error(`${hex} is not a valid hexadecimal color code. Please enter a valid code in the format #RRGGBB or #RGB.`)
        }

        const size = hex.length === 7 ? 2 : 1
        const matches = hex.match(new RegExp(`[\\da-f]{${size}}`, 'gi'))
        const base = hex.length === 7 ? 256 : 15
        const [r, g, b] = matches.map((match) => parseInt(match, 16) / base)

        return new Color(r, g, b)
    }

    static fromHsb(h, s, b) {
        const c = s * (1 - Math.abs(2 * b - 1))
        const x = c * (1 - Math.abs(h / 60 % 2 - 1))
        const m = b - (c / 2)

        let rgb
        if (h < 60 || h >= 360) rgb = [c, x, 0]
        else if (h < 120) rgb = [x, c, 0]
        else if (h < 180) rgb = [0, c, x]
        else if (h < 240) rgb = [0, x, c]
        else if (h < 300) rgb = [x, 0, c]
        else if (h < 360) rgb = [c, 0, x]
        rgb = rgb.map(c => Math.round((c + m) * 16, 0) / 16)
        const color = new Color(...rgb)

        color.state.hue = h
        color.state.saturation = s
        color.state.brightness = b

        return color
    }
}


function picker() {
    function getRandomColor() {
        return new Color(Math.random(), Math.random(), Math.random())
    }

    return {
        hex: '#FFF',
        color: new Color(),
        randomColor: null,
        $storage: this.$persist([]).as('com.lucianofelix.tri.storage'),

        get hex() {
            return this.hex
        },
        set hex(value) {
            this.hex = value.toUpperCase()

            try {
                this.color.hex = value
            }
            catch (error) {
                console.warn(error)
            }
        },
        get red() {
            return new Color(this.color.red, 0, 0)
        },
        get green() {
            return new Color(0, this.color.green, 0)
        },
        get blue() {
            return new Color(0, 0, this.color.blue)
        },
        get hue() {
            return Color.fromHsb(this.color.hue, 1, .5)
        },
        get saturation() {
            return Color.fromHsb(this.color.hue, this.color.saturation, .5)
        },
        get brightness() {
            return Color.fromHsb(0, 0, this.color.brightness)
        },
        get complementary() {
            return Color.fromHsb(Math.round((this.color.hue + 180 + 30) % 360), this.color.saturation, this.color.brightness)
        },
        get complementary2() {
            return Color.fromHsb(Math.round((this.color.hue + 180 - 30) % 360), this.color.saturation, this.color.brightness)
        },
        get storage() {
            return this.$storage.map(item => Color.fromHex(item))
        },

        selectColor(color) {
            this.color.vector = color.vector

            this.$refs.color.scrollIntoView({
                block: 'nearest'
            })
        },
        selectRandomColor() {
            this.selectColor(this.randomColor)

            this.randomColor = getRandomColor()
        },
        store(color) {
            if(!this.$storage.includes(color.hex))
                this.$storage.unshift(color.hex)
        },

        init() {
            this.randomColor = getRandomColor()
        },
    }
}


Alpine.plugin(persist)
Alpine.data('picker', picker)
Alpine.start()
