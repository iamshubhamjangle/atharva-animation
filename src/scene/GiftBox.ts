import * as THREE from 'three';
import { box, sphere } from '../utils/geometry';
export function createGiftBox() {
  const group = new THREE.Group();
  box(group, [.54, .43, .5], '#edcca0', [0, .23, 0]);
  box(group, [.56, .43, .08], '#d7a3a1', [0, .24, 0]); box(group, [.08, .43, .52], '#d7a3a1', [0, .24, 0]);
  const lid = new THREE.Group(); lid.position.set(0, .45, -.25); box(lid, [.6, .11, .56], '#f3d9ae', [0, .02, .25]);
  const ribbon = new THREE.Group(); ribbon.position.set(0, .09, .25);
  box(ribbon, [.61, .025, .075], '#dba9a4', [0, 0, 0]); box(ribbon, [.075, .025, .57], '#dba9a4', [0, .005, 0]);
  for (const side of [-1, 1]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(.105, .027, 6, 16), new THREE.MeshStandardMaterial({ color: '#dba9a4', roughness: .6 })); loop.position.set(side * .08, .065, 0); loop.rotation.x = -.5; loop.rotation.y = side * .5; loop.scale.y = .65; ribbon.add(loop); }
  sphere(ribbon, [.05, .045, .05], '#dba9a4', [0, .05, .01]); lid.add(ribbon); group.add(lid);
  const glowMaterial = new THREE.MeshBasicMaterial({ color: '#ffe3a1', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const glow = sphere(group, [.5, .75, .5], glowMaterial, [0, .55, 0]); glow.castShadow = false;
  const light = new THREE.PointLight('#ffce72', 0, 4, 2); light.position.y = .55; group.add(light);
  return { group, lid, ribbon, glow, glowMaterial, light };
}
