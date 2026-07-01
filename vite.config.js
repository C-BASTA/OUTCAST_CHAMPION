import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { threlteStudio } from '@threlte/studio/vite'
import { palette } from './src/lib/styles/tokens/colors.ts'
import { sizes } from './src/lib/styles/tokens/sizes.ts'
import { easings } from './src/lib/styles/tokens/easings.ts'
import { fontFamilies } from './src/lib/styles/tokens/typography.ts'
import { radius } from './src/lib/styles/tokens/radius.ts'

/** @param {string} s */
function camelToKebab(s) {
	return s
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/([A-Za-z])(\d)/g, '$1-$2')
		.toLowerCase()
}

function designTokensPlugin() {
	const virtualId = 'virtual:design-tokens'
	const resolvedId = '\0virtual:design-tokens.css'

	const lines = [':root {']

	for (const [key, value] of Object.entries(palette)) {
		lines.push(`  --hex-${camelToKebab(key)}: ${value};`)
	}

	lines.push(`  --base-size: 1rem;`)
	for (const [key, value] of Object.entries(sizes)) {
		lines.push(`  --size-${key}: ${value}px;`)
	}

	for (const [key, value] of Object.entries(easings)) {
		lines.push(`  --${camelToKebab(key)}: ${value};`)
	}

	for (const [key, value] of Object.entries(fontFamilies)) {
		lines.push(`  --font-${key}: ${value};`)
	}

	for (const [key, value] of Object.entries(radius)) {
		lines.push(`  --radius-${key}: ${value}px;`)
	}

	lines.push('}')
	const css = lines.join('\n')

	return {
		name: 'design-tokens',
		resolveId(id) {
			if (id === virtualId || id === resolvedId) return resolvedId
		},
		load(id) {
			if (id === resolvedId) return css
		},
	}
}

export default defineConfig({
	plugins: [
		threlteStudio({ apply: 'serve' }),
		designTokensPlugin(),
		sveltekit()
	],
	ssr: {
		noExternal: ['gsap']
	}
})
