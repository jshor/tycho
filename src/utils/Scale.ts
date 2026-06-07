import Constants from '../constants';

const Scale = (radius: number, scale: number = 1): number => {
    return (scale * radius) / Constants.WebGL.UNIT_SCALE;
};

export default Scale;
