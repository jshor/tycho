import {Euler} from 'three';
import OrbitalService from '../OrbitalService';
import Constants from '../../constants';
import MathService from '../MathService';
import fixture from './__fixtures__/planets.json';

describe('Orbital Service', () => {

    afterEach(() => jest.resetAllMocks());

    describe('getEclipticGroupRotation()', () => {
        const params = {
            inclination: 10,
            longitudeOfAscendingNode: 15
        };

        describe('when the object is not a satellite', () => {
            beforeEach(() => {
                params.isSatellite = false;
            });

            it('should set the x-dimensional rotation to the ascension vector', () => {
                const result = OrbitalService.getEclipticGroupRotation(params);

                expect(typeof result.x).toBe('number');
                expect(result.x).toEqual(-Math.PI / 2);
            });

            it('should return an Eulerian vector', () => {
                const result = OrbitalService.getEclipticGroupRotation(params);
                expect(result).toBeInstanceOf(Euler);
            });

            it('should not set a y-dimensional Eulerian rotation', () => {
                const result = OrbitalService.getEclipticGroupRotation(params);

                expect(typeof result.y).toBe('number');
                expect(result.y).toEqual(0);
            });
        });

        describe('when the object is not a satellite', () => {
            it('should set the x-dimensional rotation to the ascension vector', () => {
                params.isSatellite = true;
                const result = OrbitalService.getEclipticGroupRotation(params);

                expect(typeof result.x).toBe('number');
                expect(result.x).toEqual(0);
            });
        });
    });

    describe('getOrbitalGroupRotation()', () => {
        it('should return an Eulerian vector', () => {
            const result = OrbitalService.getOrbitalGroupRotation({
                argumentOfPeriapsis: 10
            });
            expect(result).toBeInstanceOf(Euler);
        });
    });

    describe('getBodyRotation()', () => {
        const param = {
            axialTilt: 10,
            arcRotate: 15,
            time: 0
        };

        it('should return an Eulerian vector', () => {
            const result = OrbitalService.getEclipticGroupRotation(param);
            expect(result).toBeInstanceOf(Euler);
        });

        it('should set the x Euler rotation param to axialTilt rotated 90 degrees counter-clockwise', () => {
            const x = OrbitalService.ASCENSION + param.axialTilt;
            const result = OrbitalService.getBodyRotation(param);
            const expected = OrbitalService.toEuler({x});

            expect(typeof result.x).toBe('number');
            expect(result.x).toEqual(expected.x);
        });

        it('should omit the z Euler rotation param', () => {
            const result = OrbitalService.getBodyRotation(param);

            expect(typeof result.z).toBe('number');
            expect(result.z).toEqual(0);
        });
    });

    describe('getBodyPosition()', () => {
        it('should call getPosition() on the ellipse instance with periapses and time props', () => {
            const getPosition = jest.fn();
            const props = {
                time: 0,
                periapses: {}
            };
            const ellipse = {getPosition};
            const spy = jest.spyOn(ellipse, 'getPosition');

            OrbitalService.getBodyPosition(props, ellipse);

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(props.time, props.periapses);
        });
    });

    describe('getPathOpacity()', () => {
        it('should set the path opacity to ON if the `force` flag is true', () => {
            const result = OrbitalService.getPathOpacity({id: 'Earth'}, null, true);

            expect(typeof result).toBe('number');
            expect(result).toEqual(Constants.UI.HOVER_OPACITY_ON);
        });

        it('should set the path opacity to OFF if the highlightedOrbitals is null', () => {
            const result = OrbitalService.getPathOpacity({id: 'Earth'}, null);

            expect(typeof result).toBe('number');
            expect(result).toEqual(Constants.UI.HOVER_OPACITY_OFF);
        });

        it('should set the path opacity to OFF if the list does not contain orbital', () => {
            const result = OrbitalService.getPathOpacity({id: 'Earth'}, ['Mars']);

            expect(typeof result).toBe('number');
            expect(result).toEqual(Constants.UI.HOVER_OPACITY_OFF);
        });

        it('should set the path opacity to ON if the list contains the orbital', () => {
            const id = 'Earth';
            const result = OrbitalService.getPathOpacity({id}, [id]);

            expect(typeof result).toBe('number');
            expect(result).toEqual(Constants.UI.HOVER_OPACITY_ON);
        });
    });

    describe('getMaxViewDistance()', () => {
        it('should return the satellite label range when isSatellite is true', () => {
            const result = OrbitalService.getMaxViewDistance({isSatellite: true});

            expect(typeof result).toBe('number');
            expect(result).toEqual(Constants.WebGL.Camera.SATELLITE_LABEL_RANGE);
        });

        it('should return infinity when isSatellite is false', () => {
            const result = OrbitalService.getMaxViewDistance({isSatellite: false});

            expect(typeof result).toBe('number');
            expect(result).toEqual(Infinity);
        });
    });

    describe('toEuler()', () => {
        it('should return an Eulerian vector', () => {
            const result = OrbitalService.toEuler({});

            expect(result).toBeInstanceOf(Euler);
        });

        it('should convert a coordinate to radians if defined', () => {
            const spy = jest.spyOn(MathService, 'toRadians');
            const x = 5;

            OrbitalService.toEuler({x});

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(x);
        });

        it('should set undefined coordinates to zero', () => {
            const result = OrbitalService.toEuler({x: 5});

            expect(result.y).toEqual(0);
            expect(result.z).toEqual(0);
        });
    });

    describe('getTargetByName()', () => {
        it('should return a planet\'s radius', () => {
            expect(OrbitalService.getTargetByName(fixture, 'Earth')).toEqual(fixture[1]);
        });

        it('should return a satellite\'s radius', () => {
            expect(OrbitalService.getTargetByName(fixture, 'Moon')).toEqual(fixture[1].satellites[0]);
        });

        it('should return a mid-entry list item radius', () => {
            expect(OrbitalService.getTargetByName(fixture, 'Mars')).toEqual(fixture[0]);
        });
    });
});
