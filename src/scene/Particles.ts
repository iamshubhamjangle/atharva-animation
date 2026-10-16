import * as THREE from 'three';
import { seeded } from '../utils/geometry';
export function createParticles() {
  const group = new THREE.Group(); const random = seeded(123);
  const sparkles: THREE.Mesh[] = [], confetti: THREE.Mesh[] = [], smoke: THREE.Mesh[] = [];
  const starShape = new THREE.Shape();
  for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2, r = j % 2 ? .028 : .11; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (!j) starShape.moveTo(x, y); else starShape.lineTo(x, y); } starShape.closePath();
  const starGeo = new THREE.ShapeGeometry(starShape);
  for (let i = 0; i < 55; i++) { const m = new THREE.MeshBasicMaterial({ color: i % 2 ? '#fff2c7' : '#e7bd6c', transparent: true, side: THREE.DoubleSide }); const s = new THREE.Mesh(starGeo, m); s.userData.seed = random(); group.add(s); sparkles.push(s); }
  for (let i = 0; i < 55; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(.055 + random() * .035, .12), new THREE.MeshStandardMaterial({ color: ['#e6b0aa', '#f0d391', '#b5c3d5', '#a5c8b1'][i % 4], side: THREE.DoubleSide })); c.userData.seed = random(); group.add(c); confetti.push(c); }
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: '#f4f3e9', transparent: true, opacity: .3, depthWrite: false })); group.add(p); smoke.push(p); }
  return { group, sparkles, confetti, smoke };
}
