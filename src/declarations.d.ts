/// <reference types="vitest/globals" />
/// <reference types="vite/client" />

declare module 'webgl-detect'
declare module '*.css'
declare module '*.scss'
declare module '*.glsl?raw' {
  const source: string
  export default source
}
