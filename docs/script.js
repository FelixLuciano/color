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
    },

    emptySlots () {
      const { length } = this.myColors

      return Math.max(5, 23 - 6 * Math.floor(length / 6)) - length % 6
    }
  },


  watch: {
    myColors (val) {
      window.localStorage.setItem('myColors', val.join('|'))
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
      const r = this.numToHex(color[0])
      const g = this.numToHex(color[1])
      const b = this.numToHex(color[2])
      
      return {
        red: `#${r}00`,
        green: `#0${g}0`,
        blue: `#00${b}`,
        mix: `#${r}${g}${b}`
      }
    },

    randomize () {
      (function randomize (count = 0) {
        this.color = {
          red: this.rand(0, 15),
          green: this.rand(0, 15),
          blue: this.rand(0, 15)
        }

        if (count < 8)
          requestAnimationFrame(() => randomize.call(this, count + 1))
      }).call(this)
    },

    setColor ([ red, green, blue ]) {
      this.color = { red, green, blue }

      document.querySelector('main').scrollTo({
        left: 0,
        behavior: 'smooth'
      })
    },
    saveColor () {
      this.myColors.push([this.color.red, this.color.green, this.color.blue])
    },
    removeColor (index) {
      this.$delete(this.myColors, index)
    },

    numToHex (num) {
      return num.toString(16).toUpperCase()
    },
    lim (val, min, max) {
      return Math.min(Math.max(val, min), max)
    },
    rand (min, max) {
      return Math.round(Math.random() * (max - min) + min)
    }
  },


  directives: {
    slider: {
      bind (el, { value:key }, { context:$vue }) {
        const hammertime = new Hammer(el)

        let oldVal = null

        hammertime.get('pan').set({ threshold: 0 });

        hammertime.on('panstart', () => oldVal = Object.assign({}, $vue.color))

        hammertime.on('pan', (event) => {
          event.preventDefault()
          
          const val = Math.round($vue.lim(event.deltaY / 20, -15, 15))

          const newVal = key === 'light' ? {
            red: $vue.lim(oldVal.red - val, 0, 15),
            green: $vue.lim(oldVal.green - val, 0, 15),
            blue: $vue.lim(oldVal.blue - val, 0, 15)
          } : $vue.lim(oldVal[key] - val, 0, 15)
          
          if (key === 'light') $vue.$set($vue, 'color', newVal)
          else $vue.$set($vue.color, key, newVal)
        })

        el.addEventListener('touchstart', event => event.preventDefault())
      }
    },

    press: {
      bind (el, binding, vnode) {
        const hammertime = new Hammer(el)

        function emit (vnode, name, data) {
          const handlers = (vnode.data && vnode.data.on) || (vnode.componentOptions && vnode.componentOptions.listeners)

          if (handlers && handlers[name])
            handlers[name].fns(data)
        }

        hammertime.get('press').set({ time: 450 });

        hammertime.on('pressup', (event) => {
          emit(vnode, 'press', event)
        })
      }
    }
  }
})
