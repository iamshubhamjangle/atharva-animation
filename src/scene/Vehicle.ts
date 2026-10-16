import * as THREE from 'three';
import { box, rod, sphere, material, createFader, mergeStaticMeshes } from '../utils/geometry';

export function createVehicle() {
  const group = new THREE.Group(), wheels: THREE.Group[] = [];
  const rear = new THREE.Vector3(0, .30, -.53), front = new THREE.Vector3(0, .30, .59);
  const crankPosition = new THREE.Vector3(0, .32, -.03), saddle = new THREE.Vector3(0, .64, -.24), head = new THREE.Vector3(0, .67, .31);
  for (const axle of [rear, front]) {
    const wheel = new THREE.Group(); wheel.position.copy(axle);
    const tire = new THREE.Mesh(new THREE.TorusGeometry(.25, .038, 8, 32), material('#455d58')); tire.rotation.y = Math.PI / 2; tire.castShadow = true; wheel.add(tire);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.215, .014, 6, 32), material('#e7d2a4')); rim.rotation.y = Math.PI / 2; wheel.add(rim);
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; rod(wheel, new THREE.Vector3(), new THREE.Vector3(0, Math.sin(a) * .214, Math.cos(a) * .214), .007, '#c6b694'); }
    rod(wheel, new THREE.Vector3(-.055, 0, 0), new THREE.Vector3(.055, 0, 0), .036, '#d3b777');
    mergeStaticMeshes(wheel); group.add(wheel); wheels.push(wheel);
  }
  for (const [a, b] of [[rear, saddle], [rear, crankPosition], [saddle, crankPosition], [crankPosition, head], [saddle, new THREE.Vector3(0, .43, .14)], [new THREE.Vector3(0, .43, .14), head], [head, front]]) rod(group, a, b, .027, '#548b83');
  box(group, [.32, .075, .22], '#866749', [0, .68, -.24], .035);
  rod(group, head, new THREE.Vector3(0, .88, .12), .025, '#ccbc9a');
  rod(group, new THREE.Vector3(-.25, .88, .12), new THREE.Vector3(.25, .88, .12), .025, '#ccbc9a');
  for (const side of [-1, 1]) rod(group, new THREE.Vector3(side * .16, .88, .12), new THREE.Vector3(side * .26, .88, .12), .037, '#8a6b53');
  sphere(group, [.045, .035, .045], '#d8b76f', [.13, .91, .12]);
  const crank = new THREE.Group(); crank.position.copy(crankPosition);
  for (const side of [-1, 1]) {
    rod(crank, new THREE.Vector3(side * .105, 0, 0), new THREE.Vector3(side * .105, side * .105, 0), .018, '#bbac8f');
    box(crank, [.12, .035, .1], '#736e56', [side * .13, side * .105, 0], .012);
  }
  group.add(crank);
  // Rear wicker parcel basket, slats, and a deterministic cargo anchor.
  box(group, [.5, .07, .42], '#b5895e', [0, .75, -.55], .035);
  for (let i = 0; i < 7; i++) for (const side of [-1, 1]) box(group, [.045, .23, .035], '#d5b27e', [-.23 + i * .077, .88, -.55 + side * .20], .01);
  for (let i = 0; i < 5; i++) for (const side of [-1, 1]) box(group, [.035, .23, .04], '#c9a470', [side * .25, .88, -.73 + i * .09], .01);
  for (const side of [-1, 1]) { box(group, [.55, .035, .04], '#e5c591', [0, 1, -.55 + side * .21], .014); box(group, [.035, .035, .44], '#e5c591', [side * .26, 1, -.55], .014); }
  const cargoAnchor = new THREE.Object3D(); cargoAnchor.position.set(0, .83, -.55); group.add(cargoAnchor);
  mergeStaticMeshes(group, [...wheels, crank]);
  return { group, wheels, crank, wheelRadius: .288, cargoAnchor, setOpacity: createFader(group) };
}
