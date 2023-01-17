import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'


class Color {
    constructor(r = 1, g = 1, b = 1) {
        this.state = {
            rgb: [r, g, b],
            hex: null,
            hue: null,
            chroma: null,
            light: null,
        }
        this.transition = null

        this.updateHsvAndHexFromRgb()
    }

    get vector() {
        return this.state.rgb
    }
    set vector(values) {
        if (values.length != 3)
            throw new Error(`Cannot set vector to ${values} as it does not have 3 values`)

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

            this.updateHsvAndHexFromRgb()
        }

        cancelAnimationFrame(this.transition)
        transition(0)
    }

    get red() {
        return this.state.rgb[0]
    }
    set red(value) {
        this.state.rgb[0] = parseFloat(value)

        this.updateHsvAndHexFromRgb()
    }

    get green() {
        return this.state.rgb[1]
    }
    set green(value) {
        this.state.rgb[1] = parseFloat(value)

        this.updateHsvAndHexFromRgb()
    }

    get blue() {
        return this.state.rgb[2]
    }
    set blue(value) {
        this.state.rgb[2] = parseFloat(value)

        this.updateHsvAndHexFromRgb()
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
        this.setHSv(parseInt(value), this.state.chroma, this.state.light)
    }

    get chroma() {
        return this.state.chroma
    }
    set chroma(value) {
        this.setHSv(this.state.hue, parseFloat(value), this.state.light)
    }

    get light() {
        return this.state.light
    }
    set light(value) {
        this.setHSv(this.state.hue, this.state.chroma, parseFloat(value))
    }

    updateHsvAndHexFromRgb() {
        const [r, g, b] = this.vector
        const cmax = Math.max(r, g, b)
        const cmin = Math.min(r, g, b)
        const delta = (cmax - cmin)

        let h
        if (delta === 0) h = this.state.hue / 60
        else if (cmax === r) h = (g - b) / delta + (g < b ? 6 : 0)
        else if (cmax === g) h = (b - r) / delta + 2
        else if (cmax === b) h = (r - g) / delta + 4

        if (h == 0 && this.state.hue > 240) h = 6

        this.state.hue = h * 60
        this.state.chroma = cmax == 0 ? 0 : delta / cmax
        this.state.light = cmax
        this.state.hex = '#' + this.vector.map(value => parseInt(value * 15).toString(16).toUpperCase()).join('')
    }

    setHSv(h, s, l) {
        this.state = Color.fromHsv(h, s, l).state
    }

    static fromHex(hex) {
        const size = hex.length === 7 ? 2 : 1
        const matches = hex.match(new RegExp(`[\\da-f]{${size}}`, 'gi'))
        const base = hex.length === 7 ? 256 : 15

        if (!matches || matches.length !== 3) throw new Error('Invalid hex code')

        const [r, g, b] = matches.map((match) => parseInt(match, 16) / base)

        return new Color(r, g, b)
    }

    static fromHsv(h, s, b) {
        // Check for invalid values of chroma and light
        if (s < 0 || s > 1) throw new Error("Invalid chroma")
        if (b < 0 || b > 1) throw new Error("Invalid light")

        // Calculate the chroma, hue shift, and the secondary color
        const c = s * b
        const h_ = h / 60
        const x = c * (1- Math.abs(h_ % 2 - 1))
        const m = b - c

        // Calculate the RGB values for the color
        let rgb = (
            h_ >= 6 || h_ < 1 ? [c, x, 0] :
            h_ >= 1 && h_ < 2 ? [x, c, 0] :
            h_ >= 2 && h_ < 3 ? [0, c, x] :
            h_ >= 3 && h_ < 4 ? [0, x, c] :
            h_ >= 4 && h_ < 5 ? [x, 0, c] :
            h_ >= 5 && h_ < 6 ? [c, 0, x] : undefined
        ).map(c => c + m)

        // Create the color object and set the HSv values
        const color = new Color(...rgb)
        color.state.hue = h
        color.state.chroma = s
        color.state.light = b

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
            return Color.fromHsv(this.color.hue, 1, 1)
        },
        get chroma() {
            return Color.fromHsv(this.color.hue, this.color.chroma, .5 + this.color.chroma / 2)
        },
        get light() {
            return Color.fromHsv(0, 0, this.color.light)
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
