import { reactive } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js"

class Color {
	constructor (red, green, blue) {
		this.value = reactive({red, green, blue})
	}

	set (name, value) {
		if (name === 'color')
			this.#animate(value)

		else if (name === "light")
			for (name of ["red", "green", "blue"])
				this.set(name, value)
		
		else
			this.value[name] = Math.min(Math.max(value, 0), 15)
	}

	increment (name, amount, base) {
		if (name === 'light') {
			this.increment('red', amount)
			this.increment('green', amount)
			this.increment('blue', amount)
		}
		else {
			if (base === undefined) base = this.value[name]
			this.set(name, base + amount)
		}
	}

	randomize () {
		this.set("color", {
			red: Math.round(Math.random() * 15),
			green: Math.round(Math.random() * 15),
			blue: Math.round(Math.random() * 15)
		})
	}

	#frameRequest

	#animate (color) {
		cancelAnimationFrame(this.#frameRequest)
		this.#transition(color)
	}

	#transition (newColor) {
		const entries = Object.entries(newColor)
		let doTransition
		
		for (const [name, value] of entries) {
			const offset = Math.sign(value - this.value[name])
			
			doTransition |= offset
			this.increment(name, offset)
		}
		
		if (doTransition)
			this.#frameRequest = requestAnimationFrame(() => this.#transition(newColor))
	}

	get rgb () {
		return Object.values(this.value)
	}
}

export default Color
