import * as THREE from 'three';
import { box, cylinder, sphere, seeded } from '../utils/geometry';
import { deliveryPath } from '../utils/curves';

export function createIsland() {
  const group = new THREE.Group(); const random = seeded(42);
  const soil = cylinder(group, 5.65, 4.95, 1.18, '#bc9678', [0, -.72, 0], 64); soil.scale.z = .73;
  const layer = cylinder(group, 5.56, 5.08, .45, '#d4b08b', [0, -.24, 0], 64); layer.scale.z = .73;
  const grass = cylinder(group, 5.55, 5.62, .24, '#a8cda0', [0, -.02, 0], 64); grass.scale.z = .73;
  const underside = sphere(group, [4.7, .52, 3.35], '#a98470', [0, -1.26, 0]); underside.rotation.y = .05;
  for (let i = 0; i < 38; i++) {
    const t = i / 37; const p = deliveryPath.getPointAt(t); const stone = box(group, [.4 + random() * .15, .07, .49], i % 3 ? '#e9dabe' : '#f2e5cb', [p.x, .145, p.z], .10);
    stone.rotation.y = random() * .7;
  }
  for (let i = 0; i < 35; i++) {
    const a = random() * Math.PI * 2; const r = Math.sqrt(random()); const x = Math.cos(a) * 5.1 * r, z = Math.sin(a) * 3.5 * r;
    if (z < .9 && x > .8 || deliveryPath.getPoints(25).some(p => Math.hypot(p.x - x, p.z - z) < .6)) continue;
    if (i % 3 === 0) sphere(group, [.12 + random() * .15, .1, .13], '#c6c1aa', [x, .16, z]);
    else { for (let j = 0; j < 3; j++) { const blade = box(group, [.035, .18 + random() * .12, .025], '#76a27d', [x + j * .08, .22, z], .01); blade.rotation.z = (j - 1) * .25; } }
  }
  for (let i = 0; i < 16; i++) { const angle = i / 16 * Math.PI * 2; sphere(group, [.12, .09, .07], '#dfc5a4', [5.49 * Math.cos(angle), -.45 - random() * .6, 4.01 * Math.sin(angle)]); }
  return group;
}
