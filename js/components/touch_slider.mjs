import { h } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js"

import ResponsivePointer from "./Responsive_pointer.mjs"
import { clamp } from "./utils.mjs"

export default {
	render() {
		return h("div", {
			class: "touch-slider",
			tabindex: 0,
			onPointerdown: (event) => this.dispatchPointer(event),
			onKeydown: (event) => this.dispatchKey(event)
		})
	},

	props: {
		modelValue: {
			type: Number,
			default: 0
		},
		min: {
			type: Number,
			default: 0
		},
		max: {
			type: Number,
			default: 10
		},
		step: {
			type: Number,
			default: 1
		}
	},
	$emits: ["update:modelValue", "slidestart", "slidemove", "slideend"],

	setup(props, { emit }) {
		let screenY_start, value_start, offset_start

		const pointer = new ResponsivePointer()
			.on("pointerdown", (event) => {
				screenY_start = event.screenY
				value_start = props.modelValue
				offset_start = 0

				emit("slidestart", 0)
				navigator.vibrate(24)
			})
			.on("pointermove", ({ screenY }) => {
				const deltaY = screenY_start - screenY
				const offset = Math.round(deltaY / 20) * props.step
				const newValue = clamp(value_start + offset, props.min, props.max)

				if (offset_start != offset) {
					if (newValue != props.modelValue) navigator.vibrate(24)

					emit("update:modelValue", newValue)
					emit("slidemove", offset)
					offset_start = offset
				}
			})
			.on("pointerup", ({ target }) => {
				emit("slideend", props.modelValue - value_start)
				target.focus()
			})

		const dispatchKey = (event) => {
			let modelValue_start = props.modelValue

			switch (event.key) {
				case "ArrowUp": {
					if (event.ctrlKey) emit("update:modelValue", props.max)
					else if (props.modelValue < props.max) emit("update:modelValue", props.modelValue + 1)
					break
				}
				case "ArrowDown": {
					if (event.ctrlKey) emit("update:modelValue", props.min)
					else if (props.modelValue > props.min)
						emit("update:modelValue", props.modelValue - 1)
					break
				}
			}

			emit("offset", props.modelValue - modelValue_start)
		}

		return {
			dispatchPointer: pointer.dispatch,
			dispatchKey: dispatchKey
		}
	}
}
