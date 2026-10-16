import * as THREE from 'three';
import { box, cylinder, sphere, rod, seeded, mergeStaticMeshes } from '../utils/geometry';

export function createEnvironment() {
  const group = new THREE.Group(), trees: THREE.Group[] = [], canopies: THREE.Group[] = [], flowers: THREE.Group[] = [], flowerHeads: THREE.Group[] = [], clouds: THREE.Group[] = [], butterflies: THREE.Group[] = [], birds: THREE.Group[] = [];
  const random = seeded(97);
  function tree(x: number, z: number, s: number, color: string) {
    const tree = new THREE.Group(); tree.position.set(x, .1, z); tree.scale.setScalar(s);
    cylinder(tree, .11, .17, 1.55, '#b58b68', [0, .75, 0]);
    rod(tree, new THREE.Vector3(0, .8, 0), new THREE.Vector3(-.4, 1.5, 0), .07, '#b58b68');
    const canopy = new THREE.Group(); canopy.position.y = 1.25; canopy.userData.windX = x; canopy.userData.windZ = z;
    sphere(canopy, [.69, .9, .67], color, [0, .68, 0]); sphere(canopy, [.52, .6, .52], color, [-.43, .36, .08]); sphere(canopy, [.46, .58, .5], color, [.43, .6, .07]);
    for (let i = 0; i < 5; i++) sphere(canopy, [.07, .07, .07], '#edca8d', [(random() - .5) * .8, .4 + random() * .75, .52]);
    tree.add(canopy); canopies.push(canopy); mergeStaticMeshes(canopy); mergeStaticMeshes(tree, [canopy]);
    trees.push(tree); group.add(tree);
  }
  tree(-4, -1.5, .88, '#72a98c'); tree(-1.35, -2.7, .85, '#a3b877'); tree(4.5, .25, .85, '#7eaa86');
  for (const [x, z] of [[-4, -.4], [-2, -2.4], [4, 1.6], [3.9, -2.8], [-1.9, 2.8]]) {
    for (let j = 0; j < 3; j++) sphere(group, [.32, .3 + j * .05, .3], j % 2 ? '#94b78f' : '#80a789', [x + j * .23, .27, z]);
  }
  for (let k = 0; k < 9; k++) {
    const x = [-4.3, -3, -2.1, -1.9, .1, 3.6, 4.3, 1, -.7][k], z = [1, 2.9, .4, -2.7, 2.9, 1.9, -1.5, -2.9, -.9][k];
    for (let j = 0; j < 6; j++) {
      const f = new THREE.Group(); f.position.set(x + (random() - .5) * .65, .12, z + (random() - .5) * .5);
      cylinder(f, .016, .02, .26, '#78a37e', [0, .13, 0], 5);
      const c = ['#efc34f', '#dc86a4', '#aa83d0', '#f2d48a', '#d76d9a', '#c3a0dc'][(j + k) % 6];
      const head = new THREE.Group(); head.position.y = .27; head.userData.windX = f.position.x; head.userData.windZ = f.position.z;
      const petalCount = j % 3 === 0 ? 7 : 5;
      for (let p = 0; p < petalCount; p++) { const a = p / petalCount * Math.PI * 2; sphere(head, [.06, .035, .06], c, [Math.cos(a) * .07, 0, Math.sin(a) * .07]); }
      sphere(head, [.04, .035, .04], '#b78335', [0, .025, 0]); mergeStaticMeshes(head); f.add(head); flowerHeads.push(head);
      sphere(f, [.07, .02, .03], '#548e65', [.05, .14, 0]); flowers.push(f); group.add(f);
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
    c.traverse(o => { if (o instanceof THREE.Mesh) o.castShadow = false; }); mergeStaticMeshes(c); clouds.push(c); group.add(c);
  }
  cloud(-7, 3.7, -3, 1.1); cloud(4.3, 5.3, -5.5, .8); cloud(7, 1.2, -1.5, 1); cloud(-1, -.9, 5.1, .7); cloud(-5, .5, -5.2, .65);
  const wingShape = new THREE.Shape(); wingShape.moveTo(0, 0);
  wingShape.bezierCurveTo(.04, .18, .20, .20, .17, .07); wingShape.bezierCurveTo(.15, .025, .12, .015, .09, -.005);
  wingShape.bezierCurveTo(.20, -.13, .06, -.18, .015, -.04); wingShape.quadraticCurveTo(0, -.025, 0, 0);
  const wingGeometry = new THREE.ShapeGeometry(wingShape, 18), uv = wingGeometry.attributes.uv;
  const positions = wingGeometry.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, positions.getX(i) / .2, (positions.getY(i) + .15) / .33);
  const butterflyMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { purple: { value: new THREE.Color('#652f9b') }, magenta: { value: new THREE.Color('#d65aaf') } },
    vertexShader: 'varying vec2 vUv; varying vec3 vNormal; void main(){vUv=uv;vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform vec3 purple; uniform vec3 magenta; varying vec2 vUv; varying vec3 vNormal; void main(){float gradient=smoothstep(0.05,0.9,vUv.x);vec3 color=mix(purple,magenta,gradient);float vein=pow(abs(sin(atan(vUv.y-0.48,vUv.x+0.02)*14.0)),20.0);color*=1.0-vein*0.25;float light=0.78+0.22*abs(dot(normalize(vNormal),normalize(vec3(0.3,0.8,0.5))));gl_FragColor=vec4(color*light,1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
  });
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Group(), wings: THREE.Group[] = [];
    for (const side of [-1, 1]) { const hinge = new THREE.Group(); const wing = new THREE.Mesh(wingGeometry, butterflyMaterial); wing.rotation.x = -Math.PI / 2; wing.scale.x = side; hinge.add(wing); b.add(hinge); wings.push(hinge); }
    b.userData.wings = wings; b.scale.setScalar(.75 + i * .06);
    sphere(b, [.014, .02, .085], '#503d64', [0, 0, 0]);
    for (const s of [-1, 1]) rod(b, new THREE.Vector3(s * .008, 0, .07), new THREE.Vector3(s * .035, .015, .12), .003, '#503d64');
    b.traverse(o => { if (o instanceof THREE.Mesh) o.castShadow = false; }); butterflies.push(b); group.add(b);
  }
  for (let i = 0; i < 5; i++) {
    const bird = new THREE.Group(), wings: THREE.Group[] = [];
    for (const s of [-1, 1]) {
      const hinge = new THREE.Group();
      sphere(hinge, [.21, .025, .08], '#8b9997', [s * .18, -.009, -.015]);
      sphere(hinge, [.19, .025, .075], '#b9bdb1', [s * .16, .012, 0]);
      for (let f = 0; f < 3; f++) { const feather = sphere(hinge, [.09, .016, .035], '#a2aaa1', [s * (.23 + f * .025), 0, -.025 - f * .035]); feather.rotation.y = s * -.3; }
      mergeStaticMeshes(hinge); bird.add(hinge); wings.push(hinge);
    }
    sphere(bird, [.048, .052, .135], '#d1cbb8', [0, 0, 0]); sphere(bird, [.045, .045, .05], '#ddd5c0', [0, .03, .12]);
    sphere(bird, [.012, .013, .013], '#536865', [.034, .045, .14]); sphere(bird, [.025, .016, .046], '#b59166', [0, .022, .17]);
    bird.userData.wings = wings; bird.traverse(o => { if (o instanceof THREE.Mesh) o.castShadow = false; }); birds.push(bird); group.add(bird);
  }
  mergeStaticMeshes(group, [...trees, ...flowers, ...clouds, ...butterflies, ...birds, blades]);
  return { group, trees, canopies, flowers, flowerHeads, clouds, butterflies, birds, blades };
}
function meshRoof(parent: THREE.Group) { cylinder(parent, 0, .47, .46, '#d7a18b', [0, 1.38, 0], 12); }
