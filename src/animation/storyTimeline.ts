import * as THREE from 'three';
import gsap from 'gsap';
import { CONFIG } from '../config';
import type { World } from '../scene/World';
import { deliveryPath, parcelDestination } from '../utils/curves';
import { clamp, smooth } from '../utils/geometry';

const ease = gsap.parseEase('power2.inOut');
const buoyant = gsap.parseEase('back.out(1.15)');
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const mix = (a: THREE.Vector3, b: THREE.Vector3, n: number) => a.clone().lerp(b, clamp(n, 0, 1));
export class Story {
  readonly clock = { time: 0 };
  readonly timeline: gsap.core.Timeline;
  constructor(readonly world: World) {
    this.timeline = gsap.timeline({ paused: true });
    this.timeline.to(this.clock, { time: CONFIG.duration, duration: CONFIG.duration, ease: 'none', onUpdate: () => this.apply() });
    this.apply();
  }
  seek(time: number) { this.timeline.time(clamp(time, 0, CONFIG.duration), true); this.clock.time = clamp(time, 0, CONFIG.duration); this.apply(); }
  apply() {
    const t = this.clock.time, w = this.world, char = w.character;
    const journey = ease(smooth(CONFIG.timings.journey, CONFIG.timings.arrival, t));
    const p = deliveryPath.getPointAt(journey), tangent = deliveryPath.getTangentAt(Math.min(.999, journey));
    const heading = Math.atan2(tangent.x, tangent.z);
    w.vehicle.group.visible = t >= 7; char.group.visible = t >= 7;
    w.vehicle.group.position.copy(p); w.vehicle.group.rotation.y = heading;
    w.vehicle.wheels.forEach(wheel => { wheel.rotation.x = journey * deliveryPath.getLength() / .22; });
    const ride = v(0, 0, -.62).applyAxisAngle(v(0, 1, 0), heading).add(p);
    const pickup = v(.48, .12, 1.48), door = v(2.47, .28, .17), retreat = v(1.12, .12, 1.8);
    const stepOff = smooth(18, 19.6, t), walk = smooth(21, 23.1, t), back = smooth(26.1, 27.9, t);
    let charPosition = mix(ride, pickup, stepOff); charPosition = mix(charPosition, door, walk); charPosition = mix(charPosition, retreat, back);
    char.group.position.copy(charPosition);
    char.group.rotation.y = THREE.MathUtils.lerp(heading, -Math.PI, stepOff);
    if (t >= 26) char.group.rotation.y = THREE.MathUtils.lerp(-Math.PI, .6, smooth(26, 28, t));
    const moving = t >= 7 && t < 18 ? Math.sin(Math.PI * journey) * .5 : (t >= 18 && t < 19.6) || (t >= 21 && t < 23.1) || (t >= 26.1 && t < 27.9) ? 1 : 0;
    char.body.position.y = Math.abs(Math.sin(t * 9)) * .04 * moving + (smooth(43.5, 44, t) - smooth(44, 44.5, t)) * .15;
    char.body.rotation.z = Math.sin(t * 5) * .035 * moving;
    const carrying = smooth(19.7, 20.8, t) * (1 - smooth(24.7, 26, t));
    char.arms.forEach((arm, i) => { arm.rotation.set(-carrying * 1.3 + Math.sin(t * 9 + i * Math.PI) * .35 * moving * (1 - carrying), 0, (i ? -.1 : .1)); });
    char.legs.forEach((leg, i) => { leg.rotation.x = Math.sin(t * 9 + i * Math.PI) * .4 * moving; });
    const wave = smooth(44.5, 45.5, t);
    char.body.rotation.x = -Math.sin(smooth(24.5, 25.7, t) * Math.PI) * .26 - wave * .08;
    const ring = smooth(23.1, 23.65, t) * (1 - smooth(24.05, 24.5, t));
    const reachingArm = char.arms[0];
    const shoulderHome = v(-.27, .75, 0), handRest = v(0, -.25, 0);
    char.group.updateMatrixWorld(true);
    const bellLocal = char.body.worldToLocal(w.house.bell.getWorldPosition(new THREE.Vector3()));
    const reachDirection = bellLocal.clone().sub(shoulderHome).normalize();
    const reachShoulder = bellLocal.clone().addScaledVector(reachDirection, -.25);
    reachingArm.position.copy(shoulderHome).lerp(reachShoulder, ring);
    if (ring > 0) {
      const homeRotation = reachingArm.quaternion.clone();
      const touchRotation = new THREE.Quaternion().setFromUnitVectors(handRest.clone().normalize(), reachDirection);
      reachingArm.quaternion.copy(homeRotation).slerp(touchRotation, ring);
    }
    w.house.bell.scale.set(.035, .035, .025 * (1 - ring * .3));
    char.arms[1].rotation.z = -.1 - wave * (2.1 + Math.sin(t * 4) * .24); char.arms[1].rotation.x += wave * .15;
    // Explicit world-space attachment: the carried parcel follows the same hand anchor on every seek.
    char.group.updateMatrixWorld(true); const hand = char.body.localToWorld(v(0, .67, .37));
    const onCart = w.vehicle.group.localToWorld(v(0, .79, -.2));
    let parcel = mix(onCart, hand, smooth(19.9, 20.8, t)); parcel = mix(parcel, parcelDestination, smooth(24.7, 26, t));
    w.gift.group.position.copy(parcel); w.gift.group.visible = t >= 7;
    w.gift.group.rotation.set(0, THREE.MathUtils.lerp(heading, 0, smooth(20, 26, t)), 0);
    if (t < 18) w.gift.group.rotation.z = Math.sin(t * 8) * .035 * Math.sin(journey * Math.PI);
    const wiggle = (smooth(28.5, 29, t) - smooth(30, 30.6, t)) * .055 + (smooth(31, 31.7, t) - smooth(35.3, 36, t)) * .12;
    w.gift.group.rotation.z += Math.sin(t * 14) * wiggle;
    w.gift.ribbon.scale.setScalar(1 - .45 * smooth(32, 35.5, t)); w.gift.ribbon.rotation.z = smooth(32, 36, t) * .8;
    const opening = buoyant(smooth(35.8, 37.1, t)); w.gift.lid.rotation.x = -opening * 2.05; w.gift.lid.position.y = .45 + opening * .10;
    const magic = smooth(31, 36, t) * (1 - .85 * smooth(38, 45, t)); w.gift.glowMaterial.opacity = magic * .15; w.gift.light.intensity = magic * 1.1;
    w.balloons.balloons.forEach((b, i) => {
      const start = CONFIG.timings.reveal + i * .79, u = clamp((t - start) / 2.55, 0, 1), rise = buoyant(u);
      const origin = parcelDestination.clone().add(v(0, .65, 0));
      b.base.copy(origin).lerp(b.target, rise); b.base.x += Math.sin(u * Math.PI) * (i % 2 ? .4 : -.4);
      b.group.position.copy(b.base); b.group.visible = u > 0; b.group.scale.setScalar(.12 + .88 * smooth(0, .6, u));
    });
    w.intro.material.opacity = smooth(.3, 1.8, t) * (1 - smooth(5, 6.6, t));
    const final = smooth(44, 45, t); w.welcome.material.opacity = final; w.name.material.opacity = final; w.dedication.material.opacity = final;
    w.welcome.position.y = 4.75 + final * .1; w.name.position.y = 3.95 + final * .1;
    w.particles.confetti.forEach((c, i) => {
      const seed = c.userData.seed as number, age = t - 44.3, life = 4.5 + seed * 2;
      c.visible = age >= 0 && age < life;
      c.position.set((seed - .5) * 8 + Math.sin(i * 4.2) * age * .16, 5.1 - age * .73 + Math.sin(i) * .5, Math.cos(i * 1.7) * 2 + age * .05);
      c.rotation.set(age * (1 + seed), age * 2 + i, age + i);
      c.scale.setScalar(1 - smooth(life - 1, life, age));
    });
  }
  dispose() { this.timeline.kill(); }
}
