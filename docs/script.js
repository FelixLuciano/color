new Vue({
  el: 'main',
  
  data: {
    color: [ 15, 15, 15 ],
    myColors: [],
    $frameRequest: null
  },
  

  computed: {
    colorHex () {
      return this.getColorHex(this.color)
    },

    colorStyle () {
      return this.getColorStyle(this.color)
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
      if (tone === 'color') this.animateColor(value)
      else this.$set(this.color, this.getColorKey(tone), Math.min(Math.max(value, 0), 15))
    },

    addColor (tone, amount, base) {
      if (tone === 'light') {
        if (base === undefined) base = this.color
        
        this.addColor('red', amount, base[0])
        this.addColor('green', amount, base[1])
        this.addColor('blue', amount, base[2])
      }
      else {
        if (base === undefined) base = this.color[this.getColorKey(tone)]
        this.setColor(tone, base + amount)
      }
    },


    animateColor (color) {
      cancelAnimationFrame(this.$frameRequest)
      this.transitionColor(color)
    },

    transitionColor (color) {
      const [ red, green, blue ] = this.color.map((v, i) => -Math.sign(v - color[i]))

      this.addColor('red', red)
      this.addColor('green', green)
      this.addColor('blue', blue)

      if (red || green || blue)
        this.$frameRequest = requestAnimationFrame(() => this.transitionColor(color))
    },

    randomize () {
      this.setColor('color', [
        Math.round(Math.random() * 15),
        Math.round(Math.random() * 15),
        Math.round(Math.random() * 15)
      ])
    },

    openColor (color) {
      this.setColor('color', color)

      this.$refs.main.scrollTo({
        left: 0,
        behavior: 'smooth'
      })
    },
    saveColor () {
      this.myColors.push([ ...this.color ])
    },
    removeColor (index) {
      this.$delete(this.myColors, index)
    },

    horzScroll (event) {
      const target = this.$refs.main
      
      const toLeft  = event.deltaY < 0 && target.scrollLeft > 0
      const toRight = event.deltaY > 0 && target.scrollLeft < target.scrollWidth - target.clientWidth

      if (toLeft || toRight) {
        event.preventDefault()
        target.scrollLeft += event.deltaY
      }
    },


    getColorKey (name) {
      return ({ red: 0, green: 1, blue: 2 })[name]
    }
  },


  directives: {
    slider: {
      bind (el, { value:key }, { context:$vue }) {
        const hammertime = new Hammer(el)

        let base = null

        hammertime.get('pan').set({ threshold: 0 });

        hammertime.on('panstart', () => {
          base = key === 'light' ? Object.assign({}, $vue.color) : $vue.color[$vue.getColorKey(key)]
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
