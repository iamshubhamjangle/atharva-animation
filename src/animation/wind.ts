import { Vector2 } from 'three';

/** One wind field, sampled at each plant's position; offsets represent travelling gusts. */
export class WindController {
  readonly direction: Vector2;
  strength: number;
  frequency: number;
  constructor(options: { direction: readonly [number, number]; strength: number; frequency: number }) {
    this.direction = new Vector2(...options.direction).normalize(); this.strength = options.strength; this.frequency = options.frequency;
  }
  setDirection(x: number, z: number) { if (Math.hypot(x, z) > .001) this.direction.set(x, z).normalize(); }
  sample(x: number, z: number, time: number) {
    const phase = time * this.frequency - (x * this.direction.x + z * this.direction.y) * .48;
    return this.strength * (.42 + Math.sin(phase) * .4 + Math.sin(phase * 1.63 + 1.4) * .18);
  }
}
