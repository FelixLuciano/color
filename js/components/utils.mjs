export function getHexadecimals (color) {
	const [ r, g, b ] = color.map(num => num.toString(16).toUpperCase())

	return {
		red:   `#${r}00`,
		green: `#0${g}0`,
		blue:  `#00${b}`,
		mix:   `#${r}${g}${b}`
	}
}

export function getDisplay (color) {
	const reduce = color.reduce((a, b) => a + b)
	const isDark = reduce < 18
	const isDarken = reduce < 9

	return {
		'--color': getHexadecimals(color).mix,
		color: isDark ? '#FFF' : '#000',
		borderColor: isDarken ? '#444' : 'transparent'
	}
}
