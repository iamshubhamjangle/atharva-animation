import * as THREE from 'three';
import { CONFIG } from '../config';
import { sphere, textTexture, createFader } from '../utils/geometry';

export function createBalloons(camera: THREE.Camera) {
  const group = new THREE.Group(); const balloons: { group: THREE.Group; target: THREE.Vector3; base: THREE.Vector3; setOpacity: (opacity: number) => void }[] = [];
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  const center = new THREE.Vector3(0, 4.75, 0);
  CONFIG.name.split('').forEach((letter, i) => {
    const b = new THREE.Group(); b.quaternion.copy(camera.quaternion);
    const mat = new THREE.MeshStandardMaterial({ color: CONFIG.balloonColors[i], roughness: .38, metalness: .02 });
    sphere(b, [.48, .61, .43], mat, [0, 0, 0]);
    const knot = new THREE.Mesh(new THREE.ConeGeometry(.055, .09, 8), mat); knot.position.y = -.61; b.add(knot);
    const stringCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -.66, 0), new THREE.Vector3(.04, -.93, .01), new THREE.Vector3(-.04, -1.21, 0), new THREE.Vector3(.02, -1.5, 0)]);
    const string = new THREE.Mesh(new THREE.TubeGeometry(stringCurve, 16, .009, 4, false), new THREE.MeshStandardMaterial({ color: '#a99e87' })); b.add(string);
    const text = new THREE.Mesh(new THREE.PlaneGeometry(.62, .68), new THREE.MeshBasicMaterial({ map: textTexture(letter, '#fffdf2', 190, 'Georgia', 256, 256), transparent: true, depthWrite: false })); text.position.z = .435; text.renderOrder = 5; b.add(text);
    const shine = sphere(b, [.055, .14, .012], '#fff5de', [-.22, .23, .36]); shine.rotation.z = -.4;
    const arc = .58 * (1 - Math.pow((i - 3) / 3, 2)) + (i - 3) * .055 + (i % 2 ? .045 : -.045);
    const target = center.clone().addScaledVector(right, (i - 3) * 1.12).addScaledVector(up, arc);
    balloons.push({ group: b, target, base: new THREE.Vector3(), setOpacity: createFader(b) }); group.add(b);
  });
  return { group, balloons };
}
