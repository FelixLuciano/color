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

		let randomizeInterval
		function randomize ({target}, isTouch = false) {
			randomizeInterval = setInterval(() => {
				color.randomize()
				navigator.vibrate([32, 32, 32, 32, 32, 32])
			} , 200)

			if (isTouch) {
				target.addEventListener("touchend", () => stopRandomize(target), {once: true})
				target.addEventListener("touchcancel", () => stopRandomize(target), {once: true})
			}
			else target.addEventListener("mouseup", () => stopRandomize(target), {once: true})
		}
		function stopRandomize (target) {
			color.randomize()
			navigator.vibrate(128)
			clearInterval(randomizeInterval)
			target.removeEventListener("touchend", stopRandomize)
			target.removeEventListener("touchcancel", stopRandomize)
			target.removeEventListener("mouseup", stopRandomize)
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
			navigator.vibrate(64)
		}
		function open (index) {
			const [red, green, blue] = storage.data[index]
			color.set('color', {red, green, blue})
			scrollHome()
			navigator.vibrate([50, 28, 50])
		}

		const instance = getCurrentInstance()
		const scrollHome = () => instance.vnode.el.scrollTo({ left: 0, behavior: 'smooth' })

		function press(index, event) {
			let doHold = false
			const onHold = () => {
				doHold = true
				navigator.vibrate(64)
			}
			const hold = setTimeout(onHold, 450)

			const release = (event2) => {
				event.preventDefault()
				event2.preventDefault()

				clearTimeout(hold)
				if (doHold) storage.remove(index)
				else {
					open(index)
					scrollHome()
				}

				window.removeEventListener("mouseup", release)
				window.removeEventListener("touchcancel", release)
				window.removeEventListener("touchend", release)
				window.removeEventListener("touchmove", cancel)
			}

			const cancel = () => {
				window.removeEventListener("touchcancel", release)
				window.removeEventListener("touchend", release)
				window.removeEventListener("mouseup", release)
			}

			window.addEventListener("mouseup", release, { once: true })
			window.addEventListener("touchcancel", release, { once: true })
			window.addEventListener("touchend", release, { once: true })
			window.addEventListener("touchmove", cancel, { once: true })
		}

		return {
			color,
			randomize,
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
