// Stato condiviso tra +page.svelte e Intro.svelte
// così quando si torna indietro dalla gallery il progresso è conservato
export const introState = $state({ scrolled: 0 })