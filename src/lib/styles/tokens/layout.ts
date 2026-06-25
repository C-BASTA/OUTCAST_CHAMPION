import { sizes } from './sizes';

const breakpoints = {
	mobile: 600,
	tablet: 1024,
} as const;

/**
 * Mirrors the responsive layout tokens from layout-tokens.css.
 * Use this when you need layout values in JS (e.g. for canvas math).
 */
export function getLayoutTokens(viewportWidth: number) {
	if (viewportWidth <= breakpoints.mobile) {
		return {
			paddingLateral:      sizes['5'],  // 24px
			paddingTopHeader:    sizes['4'],  // 16px
			paddingTopBiography: sizes['8'],  // 56px
		};
	}
	if (viewportWidth <= breakpoints.tablet) {
		return {
			paddingLateral:      sizes['7'],  // 40px
			paddingTopHeader:    sizes['5'],  // 24px
			paddingTopBiography: sizes['10'], // 80px
		};
	}
	return {
		paddingLateral:      sizes['10'], // 80px
		paddingTopHeader:    sizes['6'],  // 32px
		paddingTopBiography: sizes['10'], // 80px
	};
}
