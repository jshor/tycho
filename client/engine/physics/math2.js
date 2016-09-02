export default class {

  static HalfPI = Math.PI / 2;

  static TAU = Math.PI * 2;
  
  static ramanujan(a, b) {
    return Math.PI*(3*(a+b)-Math.sqrt((3*a+b)*(a+3*b)));
  }

  static toRadians(deg) {
    return deg * Math.PI / 180;
  }

  static toDegrees(rad) {
    return (rad * 180) / Math.PI;
  }

  static arcSecToRad(time, rotation) {
    return Math.abs(time * (Math.PI / 648000)) % this.TAU;
  }
  
  // render3Dto2D(position, camera) {   
  //   var div = document.getElementsByTagName('canvas')[0];
  //   var pos = position.clone();
  //   projScreenMat = new THREE.Matrix4();
    
  //   projScreenMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  //   pos.applyProjection(projScreenMat);
    
  //   var offset = this.findOffset(div);
  //   var x = (( pos.x + 1 ) * div.width / 2 + offset.left);
  //   var y = (( - pos.y + 1) * div.height  / 2 + offset.top);
    
  //   if(x < div.width && y < div.height)
  //     return { x: x, y: y };
  //   else
  //     return null;
  // },
  
  static findOffset(element) { 
    var pos = new Object();
    pos.left = pos.top = 0;
    
    if (element.offsetParent) { 
      do { 
        pos.left += element.offsetLeft; 
        pos.top += element.offsetTop; 
      } while (element = element.offsetParent); 
    } 
    return pos;
  }
}