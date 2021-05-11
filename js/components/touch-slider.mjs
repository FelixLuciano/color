import { getCurrentInstance, nextTick } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js"

export default {
	template: `
		<div
			class="touch-slider"
			@keyup="keyup"
			tabindex="0"
		></div>
	`,

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
		},
	},
	$emits: ["update:modelValue", "offset"],

	setup (props, {emit}) {
		const instance = getCurrentInstance()
		let modelValue_start, offset_start

		nextTick(() => {
			const element = instance.vnode.el
			const hammertime = new Hammer(element)

			hammertime.get('pan').set({ threshold: 0 })

			hammertime.on('panstart', (event) => {
				modelValue_start = props.modelValue
				offset_start = -Math.round(event.deltaY / 20) * props.step
			})

			hammertime.on('pan', (event) => {
				const offset = -Math.round(event.deltaY / 20) * props.step
				const newValue = modelValue_start + offset
				const clamped = clamp(newValue, props.min, props.max)

				event.preventDefault()
				emit("update:modelValue", clamped)
				
				if (offset_start != offset) {
					navigator.vibrate(32)
					emit("offset", offset - offset_start)
					offset_start = offset
				}
			})

			element.addEventListener('touchstart', event => event.preventDefault())
		})

		const keyup_events = {
			ArrowUp ({ctrlKey}) {
				if (ctrlKey)
					emit("update:modelValue", props.max)
				else
					if (props.modelValue < props.max)
						emit("update:modelValue", props.modelValue + 1)
			},
			ArrowDown ({ctrlKey}) {
				if (ctrlKey)
					emit("update:modelValue", props.min)
				else
					if (props.modelValue > props.min)
						emit("update:modelValue", props.modelValue - 1)
			}
		}
		function keyup (event) {
			modelValue_start = props.modelValue
			keyup_events[event.key]?.(event)

			nextTick(() => {
				emit("offset", props.modelValue - modelValue_start)
			})
		}

		return {
			keyup
		}
	}
}

function clamp (value, min, max) {
	return Math.min(Math.max(value, min), max)
}
