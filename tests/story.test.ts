import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Story } from '../src/animation/storyTimeline';
import { animateAmbient } from '../src/animation/ambient';
import { createCharacter } from '../src/scene/Character';
import { createVehicle } from '../src/scene/Vehicle';
import { createGiftBox } from '../src/scene/GiftBox';
import { createBalloons } from '../src/scene/Balloons';
import { createParticles } from '../src/scene/Particles';
import { createEnvironment } from '../src/scene/Environment';
import { createHouse } from '../src/scene/House';
import { textPlane } from '../src/utils/geometry';
import { parcelDestination } from '../src/utils/curves';
import type { World } from '../src/scene/World';

// Canvas rasterization and WebGL rendering are browser-tested separately. These tests exercise real geometry and story transforms.
Object.defineProperty(globalThis, 'document', { value: { createElement: () => ({ width: 0, height: 0, getContext: () => ({ fillText() {} }) }) }, configurable: true });
const camera = new THREE.OrthographicCamera(-10, 10, 5.7, -5.7, .1, 100); camera.position.set(16, 15, 21); camera.lookAt(0, 2.1, 0); camera.updateMatrixWorld();
const world = {
  camera, character: createCharacter(), vehicle: createVehicle(), gift: createGiftBox(), balloons: createBalloons(camera), particles: createParticles(), environment: createEnvironment(), house: createHouse(),
  intro: textPlane('intro', 10, 1), welcome: textPlane('welcome', 10, 1), name: textPlane('ATHARVA', 10, 1), dedication: textPlane('dedication', 10, 1),
} as unknown as World;
const story = new Story(world);
assert.equal(story.timeline.duration(), 60, 'GSAP story must last exactly 60 seconds');
const pose = () => ({
  parcel: world.gift.group.position.toArray(), rotation: world.gift.group.rotation.toArray(), lid: world.gift.lid.rotation.toArray(), ribbon: world.gift.ribbon.scale.toArray(),
  char: world.character.group.position.toArray(), body: world.character.body.rotation.toArray(), arms: world.character.arms.map(a => a.rotation.toArray()),
  cart: world.vehicle.group.position.toArray(), wheels: world.vehicle.wheels.map(w => w.rotation.toArray()),
  balloons: world.balloons.balloons.map(b => ({ p: b.base.toArray(), visible: b.group.visible, scale: b.group.scale.toArray() })),
  lettering: [world.intro.material.opacity, world.welcome.material.opacity, world.name.material.opacity],
});
const samples = [0, 7, 12, 18, 20.5, 22, 23.7, 25, 27.5, 29, 33, 36.4, 39, 43, 45, 60];
const expected = new Map<number, ReturnType<typeof pose>>();
for (const t of samples) { story.seek(t); expected.set(t, pose()); }
for (const t of [...samples].reverse()) { story.seek(t); assert.deepEqual(pose(), expected.get(t), `Backward seeking must restore the exact pose at ${t}s`); }
story.seek(22.5);
const hand = world.character.body.localToWorld(new THREE.Vector3(0, .67, .37));
assert.ok(hand.distanceTo(world.gift.group.position) < 1e-9, 'Carried parcel follows the hand anchor');
story.seek(23.8); world.character.group.updateMatrixWorld(true);
const ringingHand = world.character.arms[0].localToWorld(new THREE.Vector3(0, -.25, 0));
assert.ok(ringingHand.distanceTo(world.house.bell.getWorldPosition(new THREE.Vector3())) < 1e-9, 'Ringing hand touches the actual doorbell');
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
story.seek(60); story.seek(0); assert.equal(world.character.group.visible, false); assert.equal(world.balloons.balloons.filter(b => b.group.visible).length, 0); assert.ok(Math.abs(world.gift.lid.rotation.x) < 1e-9);
story.dispose();
console.log('PASS: 60-second timeline, 16 reverse-seek poses, hand attachment, doorstep placement, 15-second final hold, independent ambient motion, and restart.');
