import * as THREE from 'three';
import { box, sphere, cylinder } from '../utils/geometry';

export function createCharacter() {
  const group = new THREE.Group(), body = new THREE.Group(); group.add(body);
  const legs: THREE.Group[] = [], arms: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(side * .105, .37, 0);
    box(leg, [.14, .28, .14], '#6d8f87', [0, -.13, 0]); box(leg, [.18, .11, .26], '#765f53', [0, -.27, .055]); body.add(leg); legs.push(leg);
  }
  box(body, [.46, .47, .32], '#a4c7bd', [0, .57, 0], .12);
  box(body, [.035, .35, .025], '#e7dfc4', [0, .59, .17], .008);
  box(body, [.13, .13, .025], '#e5ce97', [-.13, .63, .18], .02);
  sphere(body, [.3, .3, .28], '#f0cba9', [0, 1.03, 0]);
  for (const side of [-1, 1]) {
    sphere(body, [.07, .09, .07], '#edc29f', [side * .29, 1.01, 0]);
    sphere(body, [.029, .038, .018], '#4d4e48', [side * .105, 1.07, .254]);
    sphere(body, [.052, .025, .01], '#e7a999', [side * .16, .98, .249]);
    const arm = new THREE.Group(); arm.position.set(side * .27, .75, 0);
    box(arm, [.13, .25, .15], '#a4c7bd', [0, -.1, 0], .06); sphere(arm, [.075, .075, .075], '#f0cba9', [0, -.25, 0]); arms.push(arm); body.add(arm);
  }
  sphere(body, [.05, .047, .06], '#edc09b', [0, 1.01, .278]);
  const smile = new THREE.EllipseCurve(0, 0, .07, .045, Math.PI, Math.PI * 2, false, 0);
  const smileLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(smile.getPoints(12).map(p => new THREE.Vector3(p.x, p.y, 0))), new THREE.LineBasicMaterial({ color: '#8e6355' })); smileLine.position.set(0, .98, .271); body.add(smileLine);
  sphere(body, [.31, .14, .29], '#86aea5', [0, 1.28, 0]); box(body, [.46, .06, .28], '#719b94', [0, 1.25, .19], .08);
  sphere(body, [.07, .06, .02], '#f3da9d', [0, 1.32, .255]);
  return { group, body, legs, arms };
}
