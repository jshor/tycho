import { UNIT_SCALE } from '../constants/WebGL';

const Scale = (radius: number, scale: number = 1): number => {
    return (scale * radius) / UNIT_SCALE;
};

export default Scale;
