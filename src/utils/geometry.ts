import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const materials = new Map<string, THREE.MeshStandardMaterial>();
export function material(color: string, roughness = .82) {
  const key = `${color}:${roughness}`;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness }));
  return materials.get(key)!;
}
export function mesh(geometry: THREE.BufferGeometry, color: string | THREE.Material, parent?: THREE.Object3D, position: number[] = [0, 0, 0]) {
  const obj = new THREE.Mesh(geometry, typeof color === 'string' ? material(color) : color);
  obj.position.set(position[0], position[1], position[2]); obj.castShadow = true; obj.receiveShadow = true; parent?.add(obj); return obj;
}
export function box(parent: THREE.Object3D, size: number[], color: string | THREE.Material, pos: number[], radius = .08) {
  return mesh(new RoundedBoxGeometry(size[0], size[1], size[2], 3, radius), color, parent, pos);
}
const sphereGeometry = new THREE.SphereGeometry(1, 16, 12);
export function sphere(parent: THREE.Object3D, scale: number[], color: string | THREE.Material, pos: number[]) {
  const o = mesh(sphereGeometry, color, parent, pos); o.scale.set(scale[0], scale[1], scale[2]); return o;
}
export function cylinder(parent: THREE.Object3D, radiusTop: number, radiusBottom: number, height: number, color: string, pos: number[], sides = 12) {
  return mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, sides), color, parent, pos);
}
export function rod(parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, radius: number, color: string) {
  const o = cylinder(parent, radius, radius, a.distanceTo(b), color, a.clone().add(b).multiplyScalar(.5).toArray());
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); return o;
}
export function textTexture(text: string, color = '#405b58', fontSize = 120, family = 'Georgia', width = 1600, height = 240) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.font = `500 ${fontSize}px ${family}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(text, width / 2, height / 2);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
export function textPlane(text: string, width: number, height: number, color = '#405b58', fontSize = 120, family = 'Georgia') {
  const textureWidth = Math.round(240 * width / height);
  const mat = new THREE.MeshBasicMaterial({ map: textTexture(text, color, fontSize, family, textureWidth, 240), transparent: true, depthWrite: false, depthTest: false, toneMapped: false });
  const o = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat); o.renderOrder = 100; return o;
}
export function seeded(seed: number) { let s = seed; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export const clamp = THREE.MathUtils.clamp;
export const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

/** Batch only rigid, opaque meshes. Animated groups and their descendants keep independent transforms. */
export function mergeStaticMeshes(root: THREE.Group, protectedRoots: THREE.Object3D[] = []) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert(), protectedSet = new Set(protectedRoots);
  const batches = new Map<THREE.Material, THREE.Mesh[]>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material) || object.material.transparent || object.material instanceof THREE.ShaderMaterial) return;
    let parent: THREE.Object3D | null = object;
    while (parent && parent !== root) { if (protectedSet.has(parent)) return; parent = parent.parent; }
    const bucket = batches.get(object.material) ?? []; bucket.push(object); batches.set(object.material, bucket);
  });
  for (const [material, meshes] of batches) {
    if (meshes.length < 2) continue;
    const geometries = meshes.map(mesh => { const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone(); return geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld)); });
    const geometry = mergeGeometries(geometries, false); geometries.forEach(g => g.dispose());
    if (!geometry) continue;
    const combined = new THREE.Mesh(geometry, material); combined.castShadow = meshes.some(m => m.castShadow); combined.receiveShadow = meshes.some(m => m.receiveShadow);
    meshes.forEach(mesh => mesh.removeFromParent()); root.add(combined);
  }
}

/** Isolate fading actors from cached environment materials. */
export function createFader(group: THREE.Group) {
  const copies = new Map<THREE.Material, THREE.Material>();
  const entries: { material: THREE.Material; opacity: number; transparent: boolean; depthWrite: boolean }[] = [];
  const casters: { object: THREE.Object3D; casts: boolean }[] = [];
  group.traverse(object => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
    casters.push({ object, casts: object.castShadow });
    const copy = (source: THREE.Material) => {
      if (!copies.has(source)) { const material = source.clone(); copies.set(source, material); entries.push({ material, opacity: source.opacity, transparent: source.transparent, depthWrite: source.depthWrite }); }
      return copies.get(source)!;
    };
    object.material = Array.isArray(object.material) ? object.material.map(copy) : copy(object.material);
  });
  return (opacity: number) => {
    for (const entry of entries) {
      const transparent = entry.transparent || opacity < .999;
      if (entry.material.transparent !== transparent) { entry.material.transparent = transparent; entry.material.needsUpdate = true; }
      entry.material.opacity = opacity * entry.opacity; entry.material.depthWrite = opacity < .999 ? false : entry.depthWrite;
    }
    for (const caster of casters) caster.object.castShadow = caster.casts && opacity > .8;
  };
}
