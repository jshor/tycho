import PhysicsService from '../PhysicsService';

describe('Physics Service', () => {
    describe('meanAnomaly()', () => {
        it('should calculate the mean anomaly for the given time and period', () => {
            const time = 1904203483930;
            const period = 123;
            const result = PhysicsService.meanAnomaly(time, period);

            expect(typeof result).toBe('number');
            expect(result).toEqual(231.21963500976562);
        });
    });

    describe('eccentricAnomaly()', () => {
        const time = 1904203483930;
        const periapses = {
            last: 1704203483930,
            next: 1504203483935
        };

        it('should calculate eccentric anomaly with E = mean anomaly, if below eccentricity threshold', () => {
            const eccentricity = 0.1;
            const result = PhysicsService.eccentricAnomaly(eccentricity, time, periapses);

            expect(typeof result).toBe('number');
            expect(result).toEqual(3.162141838892115);
        });

        it('should calculate eccentric anomaly with E = π, if above or equal to eccentricity threshold', () => {
            const eccentricity = 0.8;
            const result = PhysicsService.eccentricAnomaly(eccentricity, time, periapses);

            expect(typeof result).toBe('number');
            expect(result).toEqual(3.154150555403371);
        });
    });

    describe('getTheta()', () => {
        it('should return the angle for the given eccentricity and eccentric anomaly', () => {
            const eccentricity = 0.1;
            const eccAnomaly = 0.52;
            const result = PhysicsService.getTheta(eccentricity, eccAnomaly);

            expect(typeof result).toBe('number');
            expect(result).toEqual(32.77699586625071);
        });

        it('should return the positive complement of the angle, if negative', () => {
            const eccentricity = 0.1;
            const eccAnomaly = -0.52;
            const result = PhysicsService.getTheta(eccentricity, eccAnomaly);

            expect(typeof result).toBe('number');
            expect(result).toEqual(327.22300413374927);
        });
    });

    describe('thetaToPercent()', () => {
        it('should return the percentage of a valid angle', () => {
            const theta = 180;
            const result = PhysicsService.thetaToPercent(theta);

            expect(typeof result).toBe('number');
            expect(result).toEqual(0.5);
        });

        it('should return 0 if the angle is greater than 360 degrees', () => {
            const theta = 361;
            const result = PhysicsService.thetaToPercent(theta);

            expect(typeof result).toBe('number');
            expect(result).toEqual(0);
        });

        it('should return 0 if the provided number is NaN', () => {
            const theta = NaN;
            const result = PhysicsService.thetaToPercent(theta);

            expect(typeof result).toBe('number');
            expect(result).toEqual(0);
        });
    });

    describe('ellipticPercent()', () => {
        it('should return the current percentage of ellipse travelled', () => {
            const eccentricity = 0.2;
            const time = 1904203483930;
            const periapses = {
                last: 1704203483930,
                next: 1504203483935
            };
            const result = PhysicsService.ellipticPercent(eccentricity, time, periapses);

            expect(typeof result).toBe('number');
            expect(result).toEqual(0.5024478586268485);
        });
    });

    describe('orbitalEnergyConservation()', () => {
        it('should calculate the orbital energy constant of the given body', () => {
            const GM = 100000;
            const r = 100;
            const semimamjor = 1000;
            const result = PhysicsService.orbitalEnergyConservation(GM, r, semimamjor);

            expect(typeof result).toBe('number');
            expect(result).toBe(1.1260884512328505e-8);
        });
    });

    describe('toAU()', () => {
        it('should convert the given parameter value to astronomical units using given scale', () => {
            const result = PhysicsService.toAU(100, 10000);

            expect(typeof result).toBe('number');
            expect(result).toEqual(0.00668459);
        });

        it('should convert the given parameter value to astronomical units using 1 as scale', () => {
            const result = PhysicsService.toAU(100);

            expect(typeof result).toBe('number');
            expect(result).toEqual(6.68459e-7);
        });
    });
});
