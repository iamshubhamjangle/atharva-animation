import * as THREE from 'three';
import type { World } from '../scene/World';
import { smooth } from '../utils/geometry';
import { CONFIG } from '../config';

export function scrollCloudX(base: number, travel: number, limit: number) {
  const span = limit * 2;
  return ((base + travel + limit) % span + span) % span - limit;
}

export function animateAmbient(w: World, a: number, t: number) {
  const wind = w.wind, direction = wind.direction;
  const bend = (object: THREE.Object3D, x: number, z: number, amount: number, restZ = 0) => { const gust = wind.sample(x, z, a) * amount; object.rotation.x = direction.y * gust; object.rotation.z = restZ - direction.x * gust; };
  w.environment.trees.forEach(tree => bend(tree, tree.position.x, tree.position.z, .025));
  w.environment.canopies.forEach(canopy => bend(canopy, canopy.userData.windX, canopy.userData.windZ, .075));
  w.environment.flowers.forEach(f => bend(f, f.position.x, f.position.z, .13));
  w.environment.flowerHeads.forEach(head => bend(head, head.userData.windX, head.userData.windZ, .13));
  (w.island.userData.grassBlades as THREE.Group[]).forEach(blade => bend(blade, blade.position.x, blade.position.z, .31, blade.userData.restZ));
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(w.camera.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(w.camera.quaternion);
  const cloudLimit = w.camera.right + 2.6, screenWind = direction.x * right.x + direction.y * right.z;
  w.environment.clouds.forEach((c, i) => {
    if (!c.userData.base) c.userData.base = c.position.clone();
    const base = c.userData.base as THREE.Vector3, baseX = base.dot(right);
    const x = scrollCloudX(baseX, a * CONFIG.wind.cloudSpeed * screenWind * (.8 + i * .14), cloudLimit);
    c.position.copy(base).addScaledVector(right, x - baseX); c.position.y += Math.sin(a * .18 + i) * .055;
  });
  w.environment.blades.rotation.z = a * .34 * wind.strength / .7;
  w.environment.butterflies.forEach((b, i) => {
    const phase = (a * .026 + i * .2) % 1;
    b.position.set(-4.8 + phase * 9.4 + Math.sin(a * 2 + i) * .06, .6 + phase * 1.6 + Math.sin(a * 3.1 + i) * .09, 3.1 - phase * 1.8 + Math.sin(a * 1.6 + i) * .1);
    b.rotation.set(Math.sin(a * 2 + i) * .09, Math.atan2(9.4, -1.8), Math.sin(a * 1.8 + i) * .14);
    b.scale.setScalar((.75 + i * .06) * smooth(0, .06, phase) * (1 - smooth(.94, 1, phase)));
    (b.userData.wings as THREE.Group[]).forEach((wing, j) => { wing.rotation.z = (j ? 1 : -1) * (.3 + Math.sin(a * 25 + i * 1.7) * .95); });
  });
  w.environment.birds.forEach((b, i) => {
    b.position.set(0, 2.1, 0).addScaledVector(right, -7 + Math.sin(a * .085) * 1.3 + Math.abs(i - 2) * .37).addScaledVector(up, 3.45 + (i - 2) * .17 + Math.sin(a * 1.4 + i) * .025);
    b.rotation.set(.08, .9, Math.sin(a * .4) * .04);
    (b.userData.wings as THREE.Group[]).forEach((wing, j) => { wing.rotation.z = (j ? 1 : -1) * (Math.sin(a * 6.5 + i * .55) * .65 - .1); });
  });
  w.house.windowMaterial.emissiveIntensity = .3 + Math.sin(a * 1.1) * .06;
  w.particles.smoke.forEach((p, i) => { const phase = (a * .15 + i / 6) % 1; p.position.copy(w.house.smokeOrigin).add(new THREE.Vector3(phase * direction.x * .7, phase * 1.5, phase * direction.y * .7)); p.scale.setScalar(.10 + phase * .24); (p.material as THREE.MeshBasicMaterial).opacity = Math.sin(phase * Math.PI) * .22; });
  w.balloons.balloons.forEach((b, i) => {
    const settle = smooth(43, 45, t); b.group.position.copy(b.base).addScaledVector(right, (Math.sin(a * .67 + i * .9) * .045 + Math.sin(a * 1.17 + i) * .015) * settle);
    b.group.position.y += (Math.sin(a * 1.15 + i * .8) * .06 + Math.sin(a * .54 + i) * .025) * settle;
    b.group.quaternion.copy(w.camera.quaternion); b.group.rotateZ(Math.sin(a * .8 + i) * .035 * settle);
  });
  w.particles.sparkles.forEach((s, i) => {
    const seed = s.userData.seed as number;
    const gathering = smooth(30, 35, t) * (1 - smooth(38, 44, t)); const celebration = smooth(43, 45, t) * (1 - smooth(CONFIG.timings.departure, CONFIG.timings.reset, t));
    s.visible = gathering > 0 || celebration > 0;
    const phase = a * (.25 + seed * .2) + i * 2.4;
    if (celebration > .5) s.position.set(Math.sin(i * 4.2) * 6, 1 + seed * 4 + Math.sin(phase) * .18, Math.cos(i) * 3);
    else s.position.set(2.25 + Math.sin(phase) * (.4 + seed * .8), .6 + seed * 1.7 + Math.sin(phase) * .15, .4 + Math.cos(phase) * .7);
    s.quaternion.copy(w.camera.quaternion); s.rotation.z += phase * .2;
    const twinkle = Math.pow(Math.max(0, Math.sin(a * 1.9 + i * 2)), 5); s.scale.setScalar((.4 + seed * .65) * twinkle); (s.material as THREE.MeshBasicMaterial).opacity = twinkle * Math.max(gathering, celebration * .7);
  });
}
