import * as THREE from 'three';
import { box, cylinder, sphere, rod, seeded } from '../utils/geometry';

export function createEnvironment() {
  const group = new THREE.Group(), trees: THREE.Group[] = [], flowers: THREE.Group[] = [], clouds: THREE.Group[] = [], butterflies: THREE.Group[] = [], birds: THREE.Group[] = [];
  const random = seeded(97);
  function tree(x: number, z: number, s: number, color: string) {
    const tree = new THREE.Group(); tree.position.set(x, .1, z); tree.scale.setScalar(s);
    cylinder(tree, .11, .17, 1.55, '#b58b68', [0, .75, 0]);
    rod(tree, new THREE.Vector3(0, .8, 0), new THREE.Vector3(-.4, 1.5, 0), .07, '#b58b68');
    sphere(tree, [.69, .9, .67], color, [0, 1.93, 0]); sphere(tree, [.52, .6, .52], color, [-.43, 1.61, .08]); sphere(tree, [.46, .58, .5], color, [.43, 1.85, .07]);
    for (let i = 0; i < 5; i++) sphere(tree, [.07, .07, .07], '#edca8d', [(random() - .5) * .8, 1.65 + random() * .75, .52]);
    trees.push(tree); group.add(tree);
  }
  tree(-4, -1.5, .88, '#91bba0'); tree(-1.35, -2.7, .85, '#bdc9a0'); tree(4.5, .25, .85, '#9cbea0');
  for (const [x, z] of [[-4, -.4], [-2, -2.4], [4, 1.6], [3.9, -2.8], [-1.9, 2.8]]) {
    for (let j = 0; j < 3; j++) sphere(group, [.32, .3 + j * .05, .3], j % 2 ? '#94b78f' : '#80a789', [x + j * .23, .27, z]);
  }
  for (let k = 0; k < 9; k++) {
    const x = [-4.3, -3, -2.1, -1.9, .1, 3.6, 4.3, 1, -.7][k], z = [1, 2.9, .4, -2.7, 2.9, 1.9, -1.5, -2.9, -.9][k];
    for (let j = 0; j < 6; j++) {
      const f = new THREE.Group(); f.position.set(x + (random() - .5) * .65, .12, z + (random() - .5) * .5);
      cylinder(f, .016, .02, .26, '#78a37e', [0, .13, 0], 5);
      const c = ['#f8e4a4', '#e5b0b9', '#d6c3df', '#f4f1d9'][k % 4];
      for (let p = 0; p < 5; p++) { const a = p / 5 * Math.PI * 2; sphere(f, [.06, .035, .06], c, [Math.cos(a) * .07, .27, Math.sin(a) * .07]); }
      sphere(f, [.045, .035, .045], '#e0b96a', [0, .29, 0]); sphere(f, [.07, .02, .03], '#78a37e', [.05, .14, 0]); flowers.push(f); group.add(f);
    }
  }
  // A little fence wraps the garden instead of closing the delivery route.
  for (const spec of [[-3.3, -2.6, 1.7], [3.8, -2.3, 1.4], [3.7, 2.2, 1.1]]) {
    const fence = new THREE.Group(); fence.position.set(spec[0], .12, spec[1]);
    for (let i = 0; i < 6; i++) box(fence, [.1, .58, .1], '#f7ebd2', [i * spec[2] / 5 - spec[2] / 2, .29, 0], .045);
    for (const y of [.2, .43]) box(fence, [spec[2] + .15, .08, .065], '#eee1c4', [0, y, -.05]); group.add(fence);
  }
  const windmill = new THREE.Group(); windmill.position.set(-3.5, .12, -.05);
  cylinder(windmill, .25, .42, 1.15, '#e9dbbd', [0, .58, 0]);
  meshRoof(windmill);
  box(windmill, [.16, .3, .04], '#b68e6e', [0, .2, .36]);
  const blades = new THREE.Group(); blades.position.set(0, 1.21, .34);
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2;
    box(arm, [.07, 1.13, .07], '#b89169', [0, .35, 0]); box(arm, [.26, .62, .06], '#fff0cc', [.08, .6, .015]);
    for (let k = 0; k < 4; k++) box(arm, [.28, .025, .07], '#c9ad82', [.08, .34 + .15 * k, .05], .006);
    blades.add(arm);
  }
  sphere(blades, [.13, .13, .09], '#bd9471', [0, 0, .09]); windmill.add(blades); group.add(windmill);
  function cloud(x: number, y: number, z: number, scale: number) {
    const c = new THREE.Group(); c.position.set(x, y, z); c.scale.setScalar(scale);
    for (const [a, b, r] of [[-.65, 0, .55], [0, .14, .72], [.65, 0, .5], [-.1, -.15, .55]]) sphere(c, [r, r * .55, r * .6], '#f4f6ed', [a, b, 0]);
    c.traverse(o => { if (o instanceof THREE.Mesh) o.castShadow = false; }); clouds.push(c); group.add(c);
  }
  cloud(-7, 3.7, -3, 1.1); cloud(4.3, 5.3, -5.5, .8); cloud(7, 1.2, -1.5, 1); cloud(-1, -.9, 5.1, .7); cloud(-5, .5, -5.2, .65);
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Group();
    for (const side of [-1, 1]) { const wing = sphere(b, [.14, .025, .1], i % 2 ? '#eed59b' : '#e8b2bc', [side * .12, 0, 0]); wing.name = `wing${side}`; }
    sphere(b, [.023, .04, .09], '#98836a', [0, 0, 0]); butterflies.push(b); group.add(b);
  }
  for (let i = 0; i < 3; i++) {
    const bird = new THREE.Group();
    for (const s of [-1, 1]) { const wing = sphere(bird, [.17, .035, .06], '#eff0df', [s * .12, 0, 0]); wing.rotation.z = s * .25; }
    sphere(bird, [.065, .045, .12], '#f8f0d9', [0, 0, 0]); birds.push(bird); group.add(bird);
  }
  return { group, trees, flowers, clouds, butterflies, birds, blades };
}
function meshRoof(parent: THREE.Group) { cylinder(parent, 0, .47, .46, '#d7a18b', [0, 1.38, 0], 12); }
