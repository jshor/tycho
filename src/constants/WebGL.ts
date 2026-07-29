import * as THREE from 'three'
import { HOVER_OPACITY_OFF } from './UI'

/** The origin (0, 0, 0). */
export const ORIGIN_POINT = new THREE.Vector3(0, 0, 0)

export const SPECULAR_COLOR = 0x333333 // TODO: ought to be determined by albedo, not a constant

export const SHININESS = 40 // TODO: ought to be determined by albedo, not a constant

export const MESH_DEFAULT_COLOR = 0xffffff

export const SPHERE_SEGMENTS = 64

export const PLANET_SIZE_SCALE = 1

export const UNIT_SCALE = 1000000

/** Minimum threshold (in km) that the camera may be in to inflate the size of a body for visibility. */
export const MINIMUM_RADIUS = 1000

export const Ellipse = {
  POINTS: 512,
  START: -Math.PI / 2,
  END: (3 * Math.PI) / 2
}

export const Tween = {
  FAST: 1000,
  NORMAL: 2000,
  SLOW: 5000
}

export const Zoom = {
  MIN: 0,
  MAX: 100,
  STEP: 0.005
}

export const Camera = {
  NEAR: 0.001,
  FAR: 18000,
  FOV: 50,
  X: 0,
  Y: 12000,
  Z: 0,
  MAX_DISTANCE: 12000,
  MIN_DISTANCE: 0.001,
  /** Percentage of FOV for the fully-zoomed orbital to show. */
  FOCUS_FILL: 0.7,
  /** Distance range of the satellite to appear when its system is in focus. */
  SATELLITE_LABEL_RANGE: 7
}

export interface LensFlareEntry {
  url: string
  distance: number
  diameter: number
}

export const SKYBOX_TEXTURES: string[] = [
  '/static/textures/skybox/space.jpg',
  '/static/textures/skybox/space.jpg',
  '/static/textures/skybox/space.jpg',
  '/static/textures/skybox/space.jpg',
  '/static/textures/skybox/space.jpg',
  '/static/textures/skybox/space.jpg'
]

export const LENS_FLARES: LensFlareEntry[] = [
  {
    url: '0.png',
    distance: 0.0,
    diameter: 100
  },
  {
    url: '1.png',
    distance: 0.3,
    diameter: 60
  },
  {
    url: '1.png',
    distance: 0.5,
    diameter: 30
  },
  {
    url: '2.png',
    distance: 0.8,
    diameter: 40
  }
]

export const LENS_FLARE_MAX_DISTANCE = 0.995

export const Sunlight = {
  COLOR: 0xffffff,
  INTENSITY: 0.95,
  DISTANCE: 20000
}

export interface AtmosphereEntry {
  /** Depth of the atmospheric shell above the surface, as a fraction of the body's radius. */
  THICKNESS: number
  /** Sharpness of the limb glow: how tightly it hugs the grazing edge of the disc. */
  POWER: number
  /** Overall brightness of the scattering. */
  INTENSITY: number
  /** Width of the day/night terminator fade (0-1). */
  TERMINATOR_SOFTNESS: number
  /** Warm colour blended in near the terminator (i.e., dusk/dawn). */
  DUSK_COLOR: number
}

/**
 * Atmospheric scattering settings for bodies that have an atmosphere.
 */
export const Atmospheres: Record<string, AtmosphereEntry> = {
  earth: {
    // TODO: make this configurable in JSON
    THICKNESS: 0.03,
    POWER: 3,
    INTENSITY: 1.4,
    TERMINATOR_SOFTNESS: 0.1,
    DUSK_COLOR: 0xffbe94
  }
}

/**
 * The THREE.js material used for the label text.
 */
export const LABEL_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  depthTest: true,
  depthWrite: false
})

/** The glow effect when the text is hovered, which takes the color of the text it surrounds. */
export const LABEL_GLOW = {
  WIDTH: '2%',
  BLUR: '60%',
  OPACITY: 0.85
}

/** An opaque, black background to prevent the labels from looking smushed together. */
export const LABEL_BACKGROUND_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x000000,
  side: THREE.FrontSide,
  transparent: true,
  opacity: HOVER_OPACITY_OFF,
  // hidden by the same bodies that hide the text it sits behind, or it would blank them out
  depthTest: true,
  depthWrite: false
})

/** Padding for the background overlay (in px?). */
export const LABEL_BACKGROUND_PADDING = 0.3

/** The order labels are drawn in, before the distance to each is taken off it. */
export const LABEL_RENDER_ORDER = 1000000

/** Scalar multiple of how far a label should stand off from the orbital. */
export const LABEL_STANDOFF = 1.05

/**
 * The least a label may stand off from its orbital, as a % of how far off that orbital is.
 */
export const LABEL_DEPTH_BIAS = 0.02

/** Path to the font file for the label text. */
export const LABEL_FONT_PATH = '/static/fonts/MonaspaceArgon-Regular.woff'

/** Default font size for the label text. */
export const LABEL_FONT_SIZE = 4
