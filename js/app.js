import { computed, reactive, getCurrentInstance, createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js"

import Color from "./components/color.mjs"
import Storage from "./components/storage.mjs"
import touchSlider from "./components/touch_slider.mjs"
import colorButton from "./components/color_button.mjs"
import horizontalScroll from "./components/horizontal_scroll.mjs"
import { swipe_verticalIcon, holdIcon, plusIcon } from "./components/icons.mjs"
import { getHexadecimals, getDisplay } from "./components/utils.mjs"

const tri_app = {
	setup() {
		const color = new Color(15, 15, 15)
		const hex = computed(() => getHexadecimals(color.rgb))
		const display = computed(() => getDisplay(color.rgb))

		let color_start
		function update_color_start() {
			const { red, green, blue } = color.value

			color_start = {
				red,
				green,
				blue
			}
		}
		function incrementColor(increment) {
			color.increment("color", increment, color_start)
		}

		let randomizeInterval
		function randomize({ target }, isTouch = false) {
			randomizeInterval = setInterval(() => {
				color.randomize()
				navigator.vibrate([24, 42, 24, 42, 24, 42])
			}, 200)

			if (isTouch) {
				target.addEventListener("touchend", () => stopRandomize(target), {
					once: true
				})
				target.addEventListener("touchcancel", () => stopRandomize(target), {
					once: true
				})
			} else
				target.addEventListener("mouseup", () => stopRandomize(target), {
					once: true
				})
		}
		function stopRandomize(target) {
			color.randomize()
			navigator.vibrate(84)
			clearInterval(randomizeInterval)
			target.removeEventListener("touchend", stopRandomize)
			target.removeEventListener("touchcancel", stopRandomize)
			target.removeEventListener("mouseup", stopRandomize)
		}

		const matchCode = /.{3}/g
		const matchChar = /./g

		const storage = new Storage({
			name: "com.lucianofelix.tri-color_storage",
			legacyNames: ["myColors", "tri_colors"],
			save(data) {
				let str = ""

				if (data?.length)
					for (let color of data)
						str += color.map((item) => item.toString(16)).join("")

				return str
			},
			load(data) {
				const buffer = []
				const matches = data?.match(matchCode)

				if (matches?.length)
					for (const colorCode of matches) {
						const color = colorCode
							.match(matchChar)
							.map((hex) => parseInt(hex, 16))

						buffer.push(color)
					}

				return reactive(buffer)
			}
		})

		function store() {
			storage.store(color.rgb)
			navigator.vibrate(64)
		}
		function openColor(index) {
			const [red, green, blue] = storage.data[index]
			color.set("color", { red, green, blue })
			scrollHome()
		}

		const instance = getCurrentInstance()
		const scrollHome = () =>
			instance.vnode.el.scrollTo({ left: 0, behavior: "smooth" })

		return {
			hex,
			color,
			display,
			randomize,
			update_color_start,
			incrementColor,
			storage,
			store,
			openColor
		}
	},

	components: {
		"touch-slider": touchSlider,
		"color-button": colorButton,
		"swipe-vertical-icon": swipe_verticalIcon,
		"hold-icon": holdIcon,
		"plus-icon": plusIcon
	},

	directives: {
		horizontalScroll
	}
}

createApp(tri_app).mount("main")
