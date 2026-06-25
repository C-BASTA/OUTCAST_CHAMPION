/** Pixel values for each size token. Use these in JS/Three.js. */
export const sizes = {
	'0':   0,
	'1':   4,
	'2':   8,
	'3':   12,
	'4':   16,
	'4-5': 20,
	'5':   24,
	'6':   32,
	'7':   40,
	'8':   56,
	'9':   72,
	'10':  80,
	'11':  92,
	'12':  107,
	'999': 999,
} as const satisfies Record<string, number>;
