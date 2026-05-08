// Dichiarazioni di tipo per config.svelte.js
// TypeScript non capisce la sintassi $state() nei file .js,
// quindi questo file gli dice cosa viene esportato.

export declare const atmosphereSettings: Record<string, {
  bg: string
  ambientIntensity: number
  lightColor: string
  lightIntensity: number
}>

export declare const config: {
  color: string
  roughness: number
  metalness: number
  atmosphere: string
  rotationX: number
  rotationY: number
  rotationZ: number
}
