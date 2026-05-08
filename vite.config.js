import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { threlteStudio } from '@threlte/studio/vite'

export default defineConfig({
	plugins: [
		// threlteStudio abilita Threlte Studio solo in development (apply: 'serve')
		// Aggiunge un pannello di debug sovrapposto alla scena 3D
		threlteStudio({ apply: 'serve' }),
		sveltekit()
	]
})
 