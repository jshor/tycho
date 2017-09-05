/** this is only temporary for dev */
export default [
{
  id: 'dummyOuter',
  name: 'Dummy Outer',
  GM: 6836529,
  axialTilt: 23.26,
  semimajor: 249598261,
  semiminor: 249556483,
  radius: 637800.0,
  arcRotate: 45.0411, // in arcseconds
  inclination: 1.57869,
  argPeriapsis: 114.20763,
  periapses: {
    last: 1136419200+3600*3, // UNIX time
    next: 1167976800+3600*3 // UNIX time
  },
  eccentricity: 0.01671123,
  longAscNode: 348.73936,
  atmosphereColor: 0x808080,
  ring: {
    innerRadius: 6630,
    outerRadius: 950000
  }
},

{
  id: 'dummyParent',
  name: 'Dummy Planet',
  GM: 6836529,
  axialTilt: 23.26,
  semimajor: 149598261,
  semiminor: 149556483,
  radius: 637800.0,
  arcRotate: 45.0411, // in arcseconds
  inclination: 15.57869,
  argPeriapsis: 114.20763,
  periapses: {
    last: 1156419200+3600*3, // UNIX time
    next: 1167976800+3600*3 // UNIX time
  },
  eccentricity: 0.01671123,
  longAscNode: 348.73936,
  atmosphereColor: 0x808080,
  ring: {
    innerRadius: 6630,
    outerRadius: 950000
  },
  satellites: [{
    id: 'dummyChild',
    name: 'Dummy Satellite',
    GM: 6836529,
    axialTilt: 23.26,
    semimajor: 149598261,
    semiminor: 149556483,
    radius: 637800.0,
    arcRotate: 15.0411, // in arcseconds
    inclination: 1.57869,
    argPeriapsis: 114.20763,
    periapses: {
      last: 1166419200+3600*3, // UNIX time
      next: 1167976800+3600*3 // UNIX time
    },
    eccentricity: 0.01671123,
    longAscNode: 348.73936,
    atmosphereColor: 0xFF0000
  }]
}]