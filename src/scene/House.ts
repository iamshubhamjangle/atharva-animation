import * as THREE from 'three';
import { box, cylinder, sphere, mesh, textPlane } from '../utils/geometry';

export function createHouse() {
  const group = new THREE.Group(); group.position.set(2.25, .12, -1.25);
  box(group, [2.75, .24, 2.45], '#e5d7b9', [0, .08, 0]);
  box(group, [2.4, 1.95, 2.05], '#fae8c8', [0, 1.05, -.1], .1);
  // Gable and two rounded tiled roof slopes.
  const triangle = new THREE.Shape(); triangle.moveTo(-1.3, 0); triangle.lineTo(1.3, 0); triangle.lineTo(0, 1.15); triangle.closePath();
  const gable = mesh(new THREE.ExtrudeGeometry(triangle, { depth: 2.18, bevelEnabled: false }), '#f5d9b4', group, [0, 1.95, -1.2]);
  gable.castShadow = true;
  for (const side of [-1, 1]) {
    const slope = new THREE.Group(); slope.position.set(side * .69, 2.49, -.12); slope.rotation.z = side * -.69;
    box(slope, [1.84, .14, 2.65], '#b96f65', [0, 0, 0]);
    for (let row = 0; row < 5; row++) for (let col = 0; col < 7; col++) box(slope, [.37, .1, .37], (row + col) % 3 ? '#dfa18a' : '#e8b098', [-.73 + row * .36, .1, -1.13 + col * .375], .08);
    group.add(slope);
  }
  for (let i = 0; i < 8; i++) sphere(group, [.15, .13, .18], '#e9b49a', [0, 3.1, -1.25 + i * .33]);
  box(group, [.39, .9, .44], '#e7c4a1', [.68, 2.8, -.8]); box(group, [.52, .15, .56], '#d09e83', [.68, 3.26, -.8]);
  box(group, [.75, 1.33, .14], '#be8b65', [0, .79, .97], .16);
  box(group, [.58, 1.17, .06], '#d7a77e', [0, .76, 1.06], .13);
  for (let i = 0; i < 3; i++) box(group, [.015, 1.04, .015], '#b9815f', [-.16 + .16 * i, .74, 1.1], .005);
  sphere(group, [.055, .055, .04], '#eac877', [.2, .73, 1.12]);
  const windowMaterial = new THREE.MeshStandardMaterial({ color: '#ffdd95', emissive: '#f8c26b', emissiveIntensity: .35, roughness: .45 });
  for (const x of [-.8, .8]) {
    box(group, [.56, .69, .12], '#b68c72', [x, 1.22, .99]); box(group, [.44, .56, .08], windowMaterial, [x, 1.22, 1.06]);
    box(group, [.055, .58, .08], '#fff0cf', [x, 1.22, 1.12]); box(group, [.48, .055, .08], '#fff0cf', [x, 1.22, 1.12]);
    for (const s of [-1, 1]) box(group, [.17, .7, .07], '#9cbba8', [x + s * .38, 1.22, 1.03]);
    box(group, [.72, .14, .26], '#d39a7d', [x, .83, 1.12]);
    for (let i = 0; i < 4; i++) sphere(group, [.11, .1, .11], i % 2 ? '#e9b4ba' : '#edce87', [x - .24 + i * .16, .96, 1.16]);
  }
  // Round attic window, with crossbars.
  const attic = cylinder(group, .23, .23, .12, '#b68c72', [0, 2.35, 1.01], 32); attic.rotation.x = Math.PI / 2;
  sphere(group, [.17, .17, .035], windowMaterial, [0, 2.35, 1.09]);
  box(group, [.035, .34, .06], '#ffedcd', [0, 2.35, 1.13]); box(group, [.34, .035, .06], '#ffedcd', [0, 2.35, 1.13]);
  box(group, [1.05, .16, .55], '#e8d8b8', [0, .13, 1.23]); box(group, [1.25, .10, .46], '#eee0c7', [0, .04, 1.52]);
  box(group, [.09, .17, .07], '#ac9168', [.49, 1.02, 1.1]); const bell = sphere(group, [.035, .035, .025], '#edcb74', [.49, 1.03, 1.15]);
  const plaque = textPlane('home, sweet home', .85, .13, '#775c45', 80); plaque.position.set(0, 1.7, 1.11); plaque.material.depthTest = true; group.add(plaque);
  const mailbox = new THREE.Group(); mailbox.position.set(1.15, 0, 1.47); cylinder(mailbox, .055, .07, .65, '#b38a61', [0, .32, 0]);
  box(mailbox, [.4, .28, .48], '#a3c6b5', [0, .72, 0], .13); box(mailbox, [.29, .03, .015], '#547b70', [0, .73, .248]);
  box(mailbox, [.04, .34, .04], '#d5a37f', [.24, .87, 0]); box(mailbox, [.2, .12, .04], '#da9a8d', [.31, 1, 0]); group.add(mailbox);
  return { group, windowMaterial, bell, smokeOrigin: new THREE.Vector3(2.93, 3.5, -2.05) };
}
