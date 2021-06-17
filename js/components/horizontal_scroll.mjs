export default {
	created(element) {
		let lastTrigger = 0

		element.addEventListener("wheel", (event) => {
			const toLeft = event.deltaY < 0 && element.scrollLeft > 0
			const toRight =
				event.deltaY > 0 &&
				element.scrollLeft < element.scrollWidth - element.clientWidth
			const now = new Date().getTime()

			if (toLeft || toRight) {
				// event.preventDefault()
				event.stopPropagation()

				element.scrollLeft += event.deltaY
				lastTrigger = now
			} else if (now - lastTrigger < 350) {
				// event.preventDefault()
				event.stopPropagation()

				lastTrigger = now
			}
		}, {
			passive: true
		})
	}
}
