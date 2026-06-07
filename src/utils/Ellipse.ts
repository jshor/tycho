import * as THREE from 'three';
import Constants from '../constants';
import PhysicsService from '../services/PhysicsService';
import MathService from '../services/MathService';
import Scale from '../utils/Scale';
import { Periapses } from '../types';

interface EllipseProps {
    semimajor: number;
    semiminor: number;
    eccentricity: number;
    scale: number;
}

export default class Ellipse {

    semimajor: number;
    semiminor: number;
    eccentricity: number;
    scale: number;
    ellipse: THREE.EllipseCurve;
    path: any;
    geometry: any;

    constructor({ semimajor, semiminor, eccentricity, scale }: EllipseProps) {
        this.semimajor = semimajor;
        this.semiminor = semiminor;
        this.eccentricity = eccentricity;
        this.setScale(scale);
    }

    render = (): void => {
        this.ellipse = this.getEllipseCurve();
        this.path = this.getPath();
        this.geometry = this.getGeometry();
        this.path.add(this.ellipse);
    }

    getGeometry = (): any => {
        return (this.path as any).createPointsGeometry(
            Constants.WebGL.Ellipse.POINTS
        );
    }

    getPath = (): any => {
        return new THREE.CurvePath();
    }

    getEllipseCurve = (): THREE.EllipseCurve => {
        const semimajor = Scale(this.semimajor, this.scale);
        const semiminor = Scale(this.semiminor, this.scale);
        const focus = MathService.getFocus(semimajor, semiminor);

        return new THREE.EllipseCurve(
            0,
            focus,
            semiminor,
            semimajor,
            Constants.WebGL.Ellipse.START,
            Constants.WebGL.Ellipse.END
        );
    }

    getVertices = (): THREE.Vector2[] => {
        const points = Constants.WebGL.Ellipse.POINTS;
        const path: any = new THREE.Path((this.ellipse as any).getPoints(points));
        const geometry: any = path.createPointsGeometry(points);

        path.add(this.ellipse);

        return geometry.vertices;
    }

    getPosition = (time: number, periapses: Periapses): THREE.Vector3 => {
        const percent = PhysicsService.ellipticPercent(
            this.eccentricity, time, periapses
        );
        const vector2d = this.path.getPoint(percent);

        return new THREE.Vector3(vector2d.x, vector2d.y);
    }

    setScale = (scale: number): void => {
        this.scale = scale;
        this.render();
    }
}
