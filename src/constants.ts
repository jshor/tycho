export const TRANSITION_TIME = 3000

/**
 * Space is really big. If the user were to zoom linearly (either by using the scrollwheel or pinching the screen),
 * it would either take forever to zoom in, or the planet would be too close.
 * This scalar is multiplied by the zoom distance in order to slow down zooming as the user gets closer to the focused object.
 */
export const ZOOM_SPEED_SCALAR = 1
