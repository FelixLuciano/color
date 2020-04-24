new Vue({
  el: 'main',
  
  data: {
    color: {
      red: 15,
      green: 15,
      blue: 15
    },
    myColors: []
  },
  

  computed: {
    colorHex () {
      return this.getColorHex([this.color.red, this.color.green, this.color.blue])
    },

    colorStyle () {
      return this.getColorStyle([this.color.red, this.color.green, this.color.blue])
    }
  },


  watch: {
    myColors (val) {
      window.localStorage.setItem('myColors', val.join('|') )
    }
  },


  created () {
    const myColors = window.localStorage.getItem('myColors')
    
    if (myColors)
      this.myColors = myColors.split(/\|/g).map(a => a.split(/\,/g).map(a => parseInt(a)))

    else window.localStorage.setItem('myColors', this.myColors)
  },
  

  methods: {
    getColorStyle (color) {
      const reduce = color.reduce((a, b) => a + b)
      const isDark = reduce < 18
      const isDarken =  reduce < 9

      return {
        '--color': this.getColorHex(color).mix,
        color: isDark ? '#FFF' : '#000',
        borderColor: isDarken ? '#444' : 'transparent'
      }
    },

    getColorHex (color) {
      const [ r, g, b ] = color.map(c => c.toString(16).toUpperCase())
      
      return {
        red: `#${r}00`,
        green: `#0${g}0`,
        blue: `#00${b}`,
        mix: `#${r}${g}${b}`
      }
    },

    setColor (tone, value) {
      if (tone === 'light') {
        this.setColor('red', value)
        this.setColor('green', value)
        this.setColor('blue', value)
      }
      else if (tone === 'color') this.color = value
      else this.color[tone] = Math.min(Math.max(value, 0), 15)
    },

    addColor (tone, amount, base) {
      if (tone === 'light') {
        if (base === undefined) base = this.color
        
        this.addColor('red', amount, base.red)
        this.addColor('green', amount, base.green)
        this.addColor('blue', amount, base.blue)
      }
      else {
        if (base === undefined) base = this.color[tone]

        this.setColor(tone, base + amount)
      }
    },

    randomize () {
      (function randomize (count = 0) {
        this.setColor('color', {
          red: Math.round(Math.random() * 15),
          green: Math.round(Math.random() * 15),
          blue: Math.round(Math.random() * 15)
        })

        if (count < 8 && requestAnimationFrame)
          requestAnimationFrame(() => randomize.call(this, count + 1))
      }).call(this)
    },

    openColor ([ red, green, blue ]) {
      this.setColor('color', { red, green, blue })

      this.$refs.main.scrollTo({
        left: 0,
        behavior: 'smooth'
      })
    },
    saveColor () {
      this.myColors.push([this.color.red, this.color.green, this.color.blue])
    },
    removeColor (index) {
      this.$delete(this.myColors, index)
    }
  },


  directives: {
    slider: {
      bind (el, { value:key }, { context:$vue }) {
        const hammertime = new Hammer(el)

        let base = null

        hammertime.get('pan').set({ threshold: 0 });

        hammertime.on('panstart', () => {
          base = key === 'light' ? Object.assign({}, $vue.color) : $vue.color[key]
        })

        hammertime.on('pan', (event) => {
          event.preventDefault()
          
          const val = -Math.round(event.deltaY / 20)

          $vue.addColor(key, val, base)
        })

        el.addEventListener('touchstart', event => event.preventDefault())
      }
    },

    press: {
      bind (el, binding, vnode) {
        const hammertime = new Hammer(el)

        hammertime.on('pressup', (event) => {
          const handlers = (vnode.data && vnode.data.on) || (vnode.componentOptions && vnode.componentOptions.listeners)

          if (handlers && handlers['press'])
            handlers['press'].fns(event)
        })
      }
    }
  }
})
