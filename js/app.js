import { createApp, computed, getCurrentInstance } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js"

import Color from "./components/color.mjs"
import Storage from "./components/storage.mjs"
import {getHexadecimals, getDisplay} from "./components/utils.mjs"
import touchSlider from "./components/touch-slider.mjs"
import horizontalScroll from "./components/horizontal-scroll.mjs"


const tri_app = {
  setup () {
    const color = new Color(15, 15, 15)
    const hex = computed(() => getHexadecimals(color.rgb))
    const display = computed(() => getDisplay(color.rgb))

    function adjustLight (increment) {
      color.increment("light", increment)
    }

    
    const matchCode = /.{3}/g
    const matchChar = /./g

    const storage = new Storage({
      name: "tri_colors",
      legacyNames : ["myColors"],
      save (data) {
        let str = ""

        for (let color of data)
          str += color.map(item => item.toString(16)).join("")

        return str
      },
      load (data) {
        const buffer = []

        for (const colorCode of data.match(matchCode)) {
          const color = colorCode.match(matchChar).map(hex => parseInt(hex, 16))
  
          buffer.push(color)
        }

        return buffer
      }
    })

    function store () {
      storage.store(color.rgb)
    }
    function open (index) {
      const [red, green, blue] = storage.data[index]
      color.set('color', {red, green, blue})
      scrollHome()
    }

    const instance = getCurrentInstance()
    const scrollHome = () => instance.vnode.el.scrollTo({ left: 0, behavior: 'smooth' })

    function press(index, event) {
      let doHold = false
      const hold = setTimeout(() => doHold = true, 450)

      const release = (event2) => {
        event.preventDefault()
        event2.preventDefault()
        clearTimeout(hold)
        if (doHold) storage.remove(index)
        else {
          open(index)
          scrollHome()
        }
      }

      window.addEventListener("mouseup", release, { once: true })
      window.addEventListener("touchend", release, { once: true })

      window.addEventListener("touchmove", () => {
        window.removeEventListener("touchend", release)
        window.removeEventListener("mouseup", release)
      }, { once: true })
    }

    return {
      color,
      hex,
      display,
      getHexadecimals,
      getDisplay,
      adjustLight,
      storage,
      store,
      press
    }
  },

  components: {
    "touch-slider": touchSlider
  },

  directives: {
    horizontalScroll
  }
}

createApp(tri_app).mount("main")
