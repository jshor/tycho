export const SPECULAR_COLOR = 0x000000;

export const MESH_DEFAULT_COLOR = 0xFFFFFF;

export const SPHERE_SEGMENTS = 32;

export const PLANET_SIZE_SCALE = 1;

export const UNIT_SCALE = 1000000;

export const Ellipse = {
    POINTS: 512,
    START: -Math.PI / 2,
    END: 3 * Math.PI / 2
};

export const Tween = {
    FAST: 1000,
    NORMAL: 2000,
    SLOW: 5000
};

export const Zoom = {
    MIN: 0.0005,
    MAX: 100,
    STEP: 0.005
};

export const Camera = {
    NEAR: 0.001,
    FAR: 15000,
    FOV: 10,
    X: 90000,
    Y: 90000,
    Z: 90000,
    MAX_DISTANCE: 90000,
    MIN_DISTANCE: 0.001,
    SATELLITE_LABEL_RANGE: 1000,
    /** Closest the camera may zoom to a focused body: this many kilometers above
     *  its surface (converted to scene units with the current size scale). */
    MIN_SURFACE_ALTITUDE_KM: 5
};

export interface ScrollScaleEntry {
    distance: number;
    scale: number;
}

export const ScrollScale: ScrollScaleEntry[] = [
    {
        distance: 0.2,
        scale: 0.005
    },
    {
        distance: 0.1,
        scale: 0.05
    },
    {
        distance: 0.05,
        scale: 0.1
    }
];

export interface LensFlareEntry {
    url: string;
    distance: number;
    diameter: number;
}

export const SKYBOX_TEXTURES: string[] = [
    '/static/textures/skybox/space.jpg',
    '/static/textures/skybox/space.jpg',
    '/static/textures/skybox/space.jpg',
    '/static/textures/skybox/space.jpg',
    '/static/textures/skybox/space.jpg',
    '/static/textures/skybox/space.jpg'
];

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
];

export const LENS_FLARE_MAX_DISTANCE = 0.995;

export const Sunlight = {
    COLOR: 0xffffff,
    INTENSITY: 0.95,
    DISTANCE: 20000
};
