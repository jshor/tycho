import {EllipseCurve, CurvePath, Geometry, Vector3} from 'three';
import Ellipse from '../Ellipse';
import data from './__fixtures__/orbitals.json';

describe('Ellipse', () => {
    let ellipse;
    let mockData;

    beforeEach(() => {
        mockData = data[0];
        ellipse = new Ellipse(mockData);
    });

    describe('constructor()', () => {
        it('should set the semimajor and semiminor axes', () => {
            expect(ellipse).toHaveProperty('semimajor');
            expect(ellipse).toHaveProperty('semimajor');
            expect(typeof ellipse.semimajor).toBe('number');
            expect(typeof ellipse.semiminor).toBe('number');
        });

        it('should set the eccentricity', () => {
            expect(ellipse).toHaveProperty('eccentricity');
            expect(typeof ellipse.eccentricity).toBe('number');
        });
    });

    describe('render()', () => {
        it('should set the ellipse property to a new instance of EllipseCurve', () => {
            expect(ellipse).toHaveProperty('ellipse');
            expect(ellipse.ellipse).toBeInstanceOf(EllipseCurve);
        });

        it('should set the path property to a new instance of Path', () => {
            expect(ellipse).toHaveProperty('path');
            expect(ellipse.path).toBeInstanceOf(CurvePath);
        });

        it('should set the geometry property to the path points geometry', () => {
            expect(ellipse).toHaveProperty('geometry');
            expect(ellipse.geometry).toBeInstanceOf(Geometry);
        });

        it('should add the ellipse curve geometry to the path', () => {
            const path = {
                add: jest.fn(),
                createPointsGeometry: jest.fn()
            };
            const ellipseCurve = {};
            const spy = jest.spyOn(path, 'add');

            ellipse.getPath = () => path;
            ellipse.getEllipseCurve = () => ellipseCurve;
            ellipse.render();

            expect(spy).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(ellipseCurve);
        });
    });

    describe('getGeometry()', () => {
        it('should return an instance of Geometry', () => {
            const result = ellipse.getGeometry();
            expect(result).toBeInstanceOf(Geometry);
        });
    });

    describe('getPath()', () => {
        it('should return an instance of Path', () => {
            const result = ellipse.getPath();
            expect(result).toBeInstanceOf(CurvePath);
        });
    });

    describe('getEllipseCurve()', () => {
        it('should return an instance of EllipseCurve', () => {
            const result = ellipse.getEllipseCurve();
            expect(result).toBeInstanceOf(EllipseCurve);
        });
    });

    describe('getPosition()', () => {
        it('should return an instance of Vector3', () => {
            const result = ellipse.getPosition(0, {});
            expect(result).toBeInstanceOf(Vector3);
        });
    });
});
