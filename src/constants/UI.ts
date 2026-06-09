export const Sliders = {
    // Uniform size multiplier (see `scale` in the store): natural numbers 1–10
    // applied to both body radii and orbit paths, with no further exaggeration.
    Scale: {
        MIN: 1,
        MAX: 10,
        STEP: 1
    },
    // 10^speed time multiplier (see `animationSpeed` in the store).
    Speed: {
        MIN: 0,
        MAX: 10,
        STEP: 1
    }
};

export const ModalTypes = {
    STATS_MODAL: 'STATS_MODAL',
    ABOUT_MODAL: 'ABOUT_MODAL'
} as const;

export type ModalType = typeof ModalTypes[keyof typeof ModalTypes];

export const Targets = {
    ALTERNATE: ['mars', 'Mars'] as [string, string],
    DEFAULT: ['earth', 'Earth'] as [string, string]
};

export const UX_DATE_FORMAT = 'MMM DD, YYYY h:mm:ss a';

export const ZOOM_LABEL_TRIGGER = 25;

export const SPIN_LABEL_ARROW_COUNT = 4;

export const WHEEL_DELTA_DIVISOR = 100000;

export const HOVER_OPACITY_ON = 1;

export const HOVER_OPACITY_OFF = 0.4;
