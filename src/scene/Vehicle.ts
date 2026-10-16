import * as THREE from 'three';
import { box, cylinder, rod, sphere } from '../utils/geometry';

export function createVehicle() {
  const group = new THREE.Group(), wheels: THREE.Mesh[] = [];
  box(group, [.58, .12, 1.03], '#e7c98f', [0, .27, 0], .08);
  box(group, [.65, .38, .49], '#e4b18d', [0, .52, -.2], .08);
  box(group, [.69, .06, .53], '#f3d3a3', [0, .72, -.2]);
  for (const side of [-1, 1]) {
    const wheel = cylinder(group, .22, .22, .1, '#65746c', [side * .38, .23, -.17], 24); wheel.rotation.z = Math.PI / 2; wheels.push(wheel);
    const hub = cylinder(wheel, .105, .105, .12, '#e6d9bc', [0, 0, 0], 16); hub.rotation.z = 0;
    for (let i = 0; i < 5; i++) { const spoke = box(wheel, [.025, .13, .30], '#bcb89e', [0, 0, 0], .01); spoke.rotation.y = i * Math.PI / 5; }
  }
  const front = cylinder(group, .17, .17, .1, '#65746c', [0, .18, .54], 24); front.rotation.z = Math.PI / 2; wheels.push(front);
  rod(group, new THREE.Vector3(0, .3, .5), new THREE.Vector3(0, .96, .45), .04, '#a6bfb1');
  const bar = cylinder(group, .04, .04, .55, '#b48b64', [0, .95, .45]); bar.rotation.z = Math.PI / 2;
  sphere(group, [.1, .09, .07], '#f7e4b7', [0, .77, .53]);
  return { group, wheels };
}
