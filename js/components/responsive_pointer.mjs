class ResponsivePointer {
	dispatch = (dispatchEvent) => {
		const emit = (name, event) => {
			if (
				event.pointerId == dispatchEvent.pointerId &&
				name in this.#eventListeners
			)
				for (let eventListener of this.#eventListeners[name])
					eventListener.call(dispatchEvent.target, event, dispatchEvent)
		}
		const onMove = (event) => {
			emit("pointermove", event)
		}
		const onUp = (event) => {
			emit("pointerup", event)

			if (event.pointerId === dispatchEvent.pointerId)
				window.removeEventListener("pointermove", onMove)
		}

		emit("pointerdown", dispatchEvent)
		window.addEventListener("pointermove", onMove)
		window.addEventListener("pointerup", onUp, { once: true })
	}

	#eventListeners = {}

	on(name, callback) {
		if (!(name in this.#eventListeners)) this.#eventListeners[name] = []
		this.#eventListeners[name].push(callback)

		return this
	}
	off(name, callback) {
		const index = this.#eventListeners[name]?.indexOf(callback)
		this.#eventListeners[name]?.splice(index, 1)

		return this
	}
}

export default ResponsivePointer
