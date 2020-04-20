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
        function init (event_0) {
          event_0.preventDefault()

          const oldVal = key === 'mix' ? {
            red: $vue.red,
            green: $vue.green,
            blue: $vue.blue
          } : $vue[key]

          function event(event) {
            if (event.target === el )
              handler(event, event_0)
          }
      
          function handler (e, e0) {
            const { pageY } = e.type === 'touchmove' ? e.changedTouches[0] : e
            const { pageY:pageY_0 } = e0.type === 'touchstart' ? e0.changedTouches[0] : e0

            const length = pageY_0 - pageY
            const val = Math.round($vue.lim(length / 15, -15, 15))

            const newVal = key === 'mix' ? {
              red: $vue.lim(oldVal.red + val, 0, 15),
              green: $vue.lim(oldVal.green + val, 0, 15),
              blue: $vue.lim(oldVal.blue + val, 0, 15)
            } : $vue.lim(oldVal + val, 0, 15)
            
            if (key === 'mix') {
              $vue.$set($vue, 'red', newVal.red)
              $vue.$set($vue, 'green', newVal.green)
              $vue.$set($vue, 'blue', newVal.blue)
            }
            else $vue.$set($vue, key, newVal)
          }

          // Mouse
          function mouseHandlerOff () {
            window.removeEventListener('mousemove', event, false)
            window.removeEventListener('mouseup', mouseHandlerOff, false)
          }

          window.addEventListener('mousemove', event, false)
          window.addEventListener('mouseup', mouseHandlerOff, false)

          // Touch
          function touchHandlerOff () {
            window.removeEventListener('touchmove', event, false)
            window.removeEventListener('touchend', touchHandlerOff, false)
          }

          window.addEventListener('touchmove', event, false)
          window.addEventListener('touchend', touchHandlerOff, false)
        }

        el.addEventListener('mousedown', init)
        el.addEventListener('touchstart', init)
      }
    }
  }
})
