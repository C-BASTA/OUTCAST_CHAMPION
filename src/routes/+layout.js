// Disabilita il Server-Side Rendering per tutta l'app.
// Un'app 3D con WebGL non ha senso renderizzarla lato server:
// non c'è canvas, non c'è GPU, non c'è niente da pre-renderizzare.
// SvelteKit renderà la pagina solo nel browser (Client-Side Rendering).
export const ssr = false
