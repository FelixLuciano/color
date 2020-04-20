new Vue({
  el: 'main',
  
  data: {
    red: 15,
    green: 15,
    blue: 15
  },
  
  computed: {
    color () {
      const r = this.toHex(this.red)
      const g = this.toHex(this.green)
      const b = this.toHex(this.blue)
      
      return {
        red: `#${r}00`,
        green: `#0${g}0`,
        blue: `#00${b}`,
        mix: `#${r}${g}${b}`
      }
    }
  },
  
  methods: {
    toHex (num) {
      return num.toString(16).toUpperCase()
    },
    lim (val, min, max) {
      return Math.min(Math.max(val, min), max)
    }
  },


  directives: {
    slider: {
      bind (el, { value:key }, { context:$vue }) {
        const hammertime = new Hammer(el)

        let oldVal = null

        hammertime.get('pan').set({ threshold: 0 });

        hammertime.on('panstart', event => {
          oldVal = key === 'light' ? {
            red: $vue.red,
            green: $vue.green,
            blue: $vue.blue
          } : $vue[key]
        })

        hammertime.on('pan', (event) => {
          event.preventDefault()
          
          const val = Math.round($vue.lim(event.deltaY / 15, -15, 15))

          const newVal = key === 'light' ? {
            red: $vue.lim(oldVal.red - val, 0, 15),
            green: $vue.lim(oldVal.green - val, 0, 15),
            blue: $vue.lim(oldVal.blue - val, 0, 15)
          } : $vue.lim(oldVal - val, 0, 15)
          
          if (key === 'light') {
            $vue.$set($vue, 'red', newVal.red)
            $vue.$set($vue, 'green', newVal.green)
            $vue.$set($vue, 'blue', newVal.blue)
          }
          else $vue.$set($vue, key, newVal)
        })

        el.addEventListener('touchstart', event => event.preventDefault())
      }
    }
  }
})
