import {
	h,
	ref,
	computed
} from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js"

import { deleteIcon } from "./icons.mjs"
import responsivePointer from "./Responsive_pointer.mjs"
import { getHexadecimals, getDisplay } from "./utils.mjs"

export default {
	render() {
		return h(
			"button",
			{
				class: this.className,
				style: this.style,
				title: this.title,
				onPointerdown: (event) => this.dispatchPointer(event)
			},
			[
				h("span", {}, this.hex),
				h(deleteIcon)
			]
		)
	},

	props: {
		color: {
			type: Object,
			required: true
		}
	},
	$emits: ["select", "delete"],

	setup({ color }, { emit }) {
		const doDelete = ref(false)

		const hex = computed(() => getHexadecimals(color).color)
		const style = computed(() => getDisplay(color))
		const title = computed(() => `Open color ${hex.value}`)

		const className = computed(() => {
			return `color-button ${
				!doDelete.value
					? "display-mode"
					: "delete-mode"
			}`
		})

		let hold, holdTimeout

		const pointer = new responsivePointer()
			.on("pointerdown", () => {
				hold = false

				holdTimeout = setTimeout(() => {
					hold = true
					navigator.vibrate(64)
				}, 450)
			})
			.on("pointermove", ({ pointerType }) => {
				if (pointerType === "touch") clearTimeout(holdTimeout)
			})
			.on("pointerup", (event, {target}) => {
				const focusout = () => doDelete.value = false

				clearTimeout(holdTimeout)
				target.focus()

				if (hold) {
					doDelete.value = !doDelete.value

					if (doDelete.value)
						target.addEventListener("focusout", focusout, {once: true})
					else
						target.removeEventListener("focusout", focusout)
				}
				else {
					if (!doDelete.value) emit("select")
					else setTimeout(emit, 10, "delete")
					
					navigator.vibrate([42, 24, 42])
				}
			})

		return {
			hex,
			className,
			style,
			title,
			doDelete,
			dispatchPointer: pointer.dispatch
		}
	}
}
