import * as THREE from 'three';
import type { World } from '../scene/World';
import { smooth } from '../utils/geometry';

export function animateAmbient(w: World, a: number, t: number) {
  w.environment.trees.forEach((tree, i) => { tree.rotation.z = Math.sin(a * .65 + i * 2.4) * .022; tree.rotation.x = Math.sin(a * .4 + i) * .012; });
  w.environment.flowers.forEach((f, i) => { f.rotation.z = Math.sin(a * 1.15 + i * .7) * .09; });
  w.environment.clouds.forEach((c, i) => { if (!c.userData.base) c.userData.base = c.position.clone(); c.position.x = c.userData.base.x + Math.sin(a * .075 + i) * .65; c.position.y = c.userData.base.y + Math.sin(a * .18 + i) * .08; });
  w.environment.blades.rotation.z = a * .34;
  w.environment.butterflies.forEach((b, i) => { b.position.set(Math.sin(a * .35 + i * 2.1) * (2 + i * .35), .65 + Math.sin(a * .8 + i) * .24, 1 + Math.cos(a * .3 + i * 1.7) * 2.2); b.rotation.y = a * -.35 - i; b.children.slice(0, 2).forEach((wing, j) => { wing.rotation.z = Math.sin(a * 14 + i) * .65 * (j ? 1 : -1); }); });
  w.environment.birds.forEach((b, i) => { b.position.set(-4 + Math.sin(a * .09 + i * .4) * 2, 4.6 + i * .18 + Math.sin(a * .5 + i) * .07, -5.2); b.rotation.y = -.4; b.children.slice(0, 2).forEach((wing, j) => { wing.rotation.z = Math.sin(a * 4 + i) * .25 * (j ? -1 : 1); }); });
  w.house.windowMaterial.emissiveIntensity = .3 + Math.sin(a * 1.1) * .06;
  w.particles.smoke.forEach((p, i) => { const phase = (a * .15 + i / 6) % 1; p.position.copy(w.house.smokeOrigin).add(new THREE.Vector3(phase * .7, phase * 1.5, -phase * .2)); p.scale.setScalar(.10 + phase * .24); (p.material as THREE.MeshBasicMaterial).opacity = Math.sin(phase * Math.PI) * .22; });
  w.balloons.balloons.forEach((b, i) => { const settle = smooth(44.5, 45.5, t); b.group.position.copy(b.base); b.group.position.y += Math.sin(a * 1.3 + i * .8) * .055 * settle; b.group.quaternion.copy(w.camera.quaternion); b.group.rotateZ(Math.sin(a + i) * .025 * settle); });
  w.particles.sparkles.forEach((s, i) => {
    const seed = s.userData.seed as number;
    const gathering = smooth(30, 35, t) * (1 - smooth(38, 44, t)); const celebration = smooth(43, 45, t);
    s.visible = gathering > 0 || celebration > 0;
    const phase = a * (.25 + seed * .2) + i * 2.4;
    if (celebration > .5) s.position.set(Math.sin(i * 4.2) * 6, 1 + seed * 4 + Math.sin(phase) * .18, Math.cos(i) * 3);
    else s.position.set(2.25 + Math.sin(phase) * (.4 + seed * .8), .6 + seed * 1.7 + Math.sin(phase) * .15, .4 + Math.cos(phase) * .7);
    s.quaternion.copy(w.camera.quaternion); s.rotation.z += phase * .2;
    const twinkle = Math.pow(Math.max(0, Math.sin(a * 1.9 + i * 2)), 5); s.scale.setScalar((.4 + seed * .65) * twinkle); (s.material as THREE.MeshBasicMaterial).opacity = twinkle * Math.max(gathering, celebration * .7);
  });
}
