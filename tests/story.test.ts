import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Story, advanceStoryTime } from '../src/animation/storyTimeline';
import { animateAmbient, scrollCloudX } from '../src/animation/ambient';
import { WindController } from '../src/animation/wind';
import { CONFIG } from '../src/config';
import { createIsland } from '../src/scene/Island';
import { createCharacter } from '../src/scene/Character';
import { createVehicle } from '../src/scene/Vehicle';
import { createGiftBox } from '../src/scene/GiftBox';
import { createBalloons } from '../src/scene/Balloons';
import { createParticles } from '../src/scene/Particles';
import { createEnvironment } from '../src/scene/Environment';
import { createHouse } from '../src/scene/House';
import { textPlane, box, mergeStaticMeshes } from '../src/utils/geometry';
import { parcelDestination } from '../src/utils/curves';
import type { World } from '../src/scene/World';

// Canvas rasterization and WebGL rendering are browser-tested separately. These tests exercise real geometry and story transforms.
Object.defineProperty(globalThis, 'document', { value: { createElement: () => ({ width: 0, height: 0, getContext: () => ({ fillText() {} }) }) }, configurable: true });
const camera = new THREE.OrthographicCamera(-10, 10, 5.7, -5.7, .1, 100); camera.position.set(16, 15, 21); camera.lookAt(0, 2.1, 0); camera.updateMatrixWorld();
const world = {
  camera, wind: new WindController(CONFIG.wind), island: createIsland(), character: createCharacter(), vehicle: createVehicle(), gift: createGiftBox(), balloons: createBalloons(camera), particles: createParticles(), environment: createEnvironment(), house: createHouse(),
  intro: textPlane('intro', 10, 1), welcome: textPlane('welcome', 10, 1), name: textPlane('ATHARVA', 10, 1), dedication: textPlane('dedication', 10, 1),
} as unknown as World;
const story = new Story(world);
assert.equal(story.timeline.duration(), 72, 'Each complete loop must last 72 seconds');
const pose = () => ({
  parcel: world.gift.group.position.toArray(), rotation: world.gift.group.rotation.toArray(), lid: world.gift.lid.rotation.toArray(), ribbon: world.gift.ribbon.scale.toArray(),
  char: world.character.group.position.toArray(), body: world.character.body.rotation.toArray(), arms: world.character.arms.map(a => a.rotation.toArray()),
  bicycle: world.vehicle.group.position.toArray(), wheels: world.vehicle.wheels.map(w => w.rotation.toArray()), crank: world.vehicle.crank.rotation.x,
  actorVisible: [world.character.group.visible, world.vehicle.group.visible, world.gift.group.visible],
  actorOpacity: (world.character.body.children[2] as THREE.Mesh).material instanceof THREE.Material ? ((world.character.body.children[2] as THREE.Mesh).material as THREE.Material).opacity : null,
  burst: world.particles.burst.map(s => ({visible:s.visible, position:s.position.toArray(), opacity:(s.material as THREE.Material).opacity})),
  balloons: world.balloons.balloons.map(b => ({ p: b.base.toArray(), visible: b.group.visible, scale: b.group.scale.toArray() })),
  lettering: [world.intro.material.opacity, world.welcome.material.opacity, world.name.material.opacity],
});
const samples = [0, 7, 7.8, 12, 18, 20.5, 22, 23.7, 25, 27.5, 29, 33, 35.9, 36.8, 39, 43, 45, 60, 62, 64.9, 65, 68, 72];
const expected = new Map<number, ReturnType<typeof pose>>();
for (const t of samples) { story.seek(t); expected.set(t, pose()); }
for (const t of [...samples].reverse()) { story.seek(t); assert.deepEqual(pose(), expected.get(t), `Backward seeking must restore the exact pose at ${t}s`); }
story.seek(22.5);
const hand = world.character.body.localToWorld(new THREE.Vector3(0, .67, .37));
assert.ok(hand.distanceTo(world.gift.group.position) < 1e-9, 'Carried parcel follows the hand anchor');
story.seek(23.8); world.character.group.updateMatrixWorld(true);
const ringingHand = world.character.arms[0].localToWorld(new THREE.Vector3(0, -.25, 0));
assert.ok(ringingHand.distanceTo(world.house.bell.getWorldPosition(new THREE.Vector3())) < 1e-9, 'Ringing hand touches the actual doorbell');
story.seek(35.9); world.character.group.updateMatrixWorld(true); world.gift.group.updateMatrixWorld(true);
const openingHand = world.character.arms[0].localToWorld(new THREE.Vector3(0, -.25, 0));
assert.ok(openingHand.distanceTo(world.gift.lid.localToWorld(new THREE.Vector3(0, .02, .5))) < 1e-9, 'Opening hand follows the real lid handle before release');
story.seek(36.8); assert.ok(world.particles.burst.some(s => s.visible), 'Golden burst appears before the first balloon'); assert.ok(world.balloons.balloons.every(b => !b.group.visible));
for (const t of [26, 29, 36, 45, 60]) { story.seek(t); assert.ok(world.gift.group.position.distanceTo(parcelDestination) < 1e-9, 'Delivered parcel remains on the doorstep'); }
for (const t of [45, 50, 55, 60]) {
  story.seek(t); assert.equal(world.balloons.balloons.filter(b => b.group.visible).length, 7); assert.equal(world.name.material.opacity, 1); assert.equal(world.welcome.material.opacity, 1);
  for (const b of world.balloons.balloons) assert.ok(b.base.distanceTo(b.target) < 1e-8, `Balloon is settled at ${t}s`);
}
story.seek(45); animateAmbient(world, 10, 45);
const ambientPose = world.balloons.balloons.map(b => b.group.quaternion.toArray());
for (let i = 0; i < 10; i++) animateAmbient(world, 10, 45);
assert.deepEqual(world.balloons.balloons.map(b => b.group.quaternion.toArray()), ambientPose, 'Paused ambient motion must not accumulate rotation');
const swayed = world.environment.trees[0].rotation.z; animateAmbient(world, 12, 45);
assert.notEqual(world.environment.trees[0].rotation.z, swayed, 'Ambient motion continues with the story paused');
assert.equal(story.clock.time, 45, 'Ambient motion does not advance the story');
story.seek(7.8); const bikeMaterial = ((world.vehicle.wheels[0].children[0] as THREE.Mesh).material as THREE.Material);
assert.ok(bikeMaterial.opacity > 0 && bikeMaterial.opacity < 1, 'Bicycle fades in along the path');
const treeMaterial = (world.environment.trees[0].getObjectByProperty('isMesh', true) as THREE.Mesh).material as THREE.Material;
assert.equal(treeMaterial.opacity, 1, 'Actor fading must not fade shared environment materials');
assert.equal(world.vehicle.wheels.length, 2, 'Delivery vehicle is a two-wheel bicycle');
assert.ok(world.vehicle.crank.rotation.x > 0, 'Pedals rotate with distance travelled');
story.seek(62.5); assert.ok(bikeMaterial.opacity < 1 && bikeMaterial.opacity > 0, 'Courier and bicycle fade away during the loop reset');
assert.ok(world.balloons.balloons[0].group.scale.x < 1, 'Balloons shrink away before reset');
story.seek(72); const endPose = pose(); story.seek(0); assert.deepEqual(pose(), endPose, 'The loop boundary must restore the opening pose exactly');
assert.equal(world.character.group.visible, false); assert.equal(world.balloons.balloons.filter(b => b.group.visible).length, 0); assert.ok(Math.abs(world.gift.lid.rotation.x) < 1e-9);
const offscreen = world.vehicle.group.position.clone().project(camera); assert.ok(offscreen.x < -1, 'Bicycle and rider reset offscreen');
assert.equal(advanceStoryTime(71.5, 1), .5, 'Normal playback wraps to the next loop');
assert.equal(advanceStoryTime(71.5, 1, false), 72, 'One-cycle playback clamps to the end');
assert.ok(Math.abs(advanceStoryTime(71.99, .02) - .01) < 1e-9, 'Wrap preserves subframe overflow');
assert.ok(scrollCloudX(12.69, .02, 12.7) < -12.6, 'Clouds recycle beyond the visible edge');
assert.ok(Math.abs(scrollCloudX(2, .01, 12.7) - 2.01) < 1e-9, 'Cloud travel is continuous between wraps');
for (const t of [0, 40, 200, 1000]) { animateAmbient(world, t, 0); for (const c of world.environment.clouds) { const right = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion); assert.ok(Math.abs(c.position.dot(right)) <= camera.right + 2.6 + 1e-9); } }
animateAmbient(world, 72, 72); const cloudsBefore = world.environment.clouds.map(c => c.position.toArray()); animateAmbient(world, 72, 0); assert.deepEqual(world.environment.clouds.map(c => c.position.toArray()), cloudsBefore, 'Story wrapping never resets ambient cloud travel');
world.wind.strength = 0; animateAmbient(world, 10, 45); assert.ok(world.environment.canopies.every(c => c.rotation.x === 0 && c.rotation.z === 0), 'Unified wind strength controls canopy motion');
const grass = world.island.userData.grassBlades as THREE.Group[]; assert.ok(grass.every(b => b.rotation.z === b.userData.restZ), 'Unified wind strength controls grass blades');
world.wind.strength = CONFIG.wind.strength; world.wind.setDirection(-1, 0); animateAmbient(world, 10, 45); assert.ok(world.environment.flowers.every(f => f.rotation.x === 0), 'Wind direction consistently controls flower sway');
assert.ok(world.environment.butterflies.every(b => b.userData.wings.length === 2), 'Butterflies have two hinged wings');
const butterflyMaterial = (world.environment.butterflies[0].userData.wings[0].children[0] as THREE.Mesh).material;
assert.ok(butterflyMaterial instanceof THREE.ShaderMaterial && 'purple' in butterflyMaterial.uniforms && 'magenta' in butterflyMaterial.uniforms, 'Butterflies use the purple-to-magenta gradient shader');
const batchRoot = new THREE.Group(), animatedPart = new THREE.Group(); batchRoot.position.set(3, 1, -2); batchRoot.rotation.y = .4;
box(batchRoot, [1, 1, 1], '#aabbcc', [1, 0, 0]); box(batchRoot, [1, 1, 1], '#aabbcc', [-1, 0, 0]); box(animatedPart, [.2, .4, .2], '#aabbcc', [0, .2, 0]); batchRoot.add(animatedPart);
const beforeBatch = new THREE.Box3().setFromObject(batchRoot); mergeStaticMeshes(batchRoot, [animatedPart]); const afterBatch = new THREE.Box3().setFromObject(batchRoot);
assert.ok(beforeBatch.min.distanceTo(afterBatch.min) < 1e-5 && beforeBatch.max.distanceTo(afterBatch.max) < 1e-5, 'Static batching preserves world-space geometry bounds');
assert.equal(animatedPart.children.length, 1, 'Static batching preserves animated children');
story.dispose();
console.log('PASS: 72-second loop, 23 reverse-seek poses, bicycle fade/pedals, parcel/bell/lid hand contact, pre-balloon golden burst, final hold, seamless reset, cloud recycling, shared wind, and gradient butterfly wings.');
