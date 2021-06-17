export function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max)
}

export function num2hex(num) {
	return num.toString(16).toUpperCase()
}

export function getHexadecimals(color) {
	const [r, g, b] = color.map(num2hex)

	return {
		red: `#${r}00`,
		green: `#0${g}0`,
		blue: `#00${b}`,
		color: `#${r}${g}${b}`
	}
}

export function getDisplay(color) {
	const max =  Math.max(...color)
	const isDark = max < 10
	const isDarken = max < 8
	const alpha = Math.round(7 * (1 - max / 15))

	const textColor = isDark ? "#FFF" : "#000"
	const borderColor = isDarken ? `#FFF${ num2hex(alpha) }` : "transparent"

	return {
		"--color": getHexadecimals(color).color,
		color: textColor,
		borderColor: borderColor
	}
}
