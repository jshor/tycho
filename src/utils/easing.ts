export function easeOut (t: number): number {
  // return t * (2 - t)
  return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1
}
