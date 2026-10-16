import * as THREE from 'three';
export const deliveryPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-5, .12, 2.15), new THREE.Vector3(-3.7, .12, 2.2),
  new THREE.Vector3(-2.2, .12, 1.4), new THREE.Vector3(-.9, .12, 1.55),
  new THREE.Vector3(.35, .12, 1.85), new THREE.Vector3(1, .12, 1.3),
]);
export const parcelDestination = new THREE.Vector3(2.25, .24, .40);
