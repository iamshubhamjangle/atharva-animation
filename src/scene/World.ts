import * as THREE from 'three';
import { CONFIG } from '../config';
import { createIsland } from './Island';
import { createHouse } from './House';
import { createEnvironment } from './Environment';
import { createCharacter } from './Character';
import { createVehicle } from './Vehicle';
import { createGiftBox } from './GiftBox';
import { createBalloons } from './Balloons';
import { createParticles } from './Particles';
import { textPlane } from '../utils/geometry';
import { WindController } from '../animation/wind';

export class World {
  readonly scene = new THREE.Scene();
  readonly wind = new WindController(CONFIG.wind);
  readonly camera: THREE.OrthographicCamera;
  readonly renderer: THREE.WebGLRenderer;
  readonly house = createHouse();
  readonly environment = createEnvironment();
  readonly character = createCharacter();
  readonly vehicle = createVehicle();
  readonly gift = createGiftBox();
  readonly particles = createParticles();
  readonly balloons: ReturnType<typeof createBalloons>;
  readonly intro = textPlane(CONFIG.intro, 13, 1.3, CONFIG.colors.ink, 91);
  readonly welcome = textPlane(CONFIG.welcome, 10, .75, CONFIG.colors.ink, 100);
  readonly name = textPlane(CONFIG.name, 10, 1.05, CONFIG.colors.ink, 180);
  readonly dedication = textPlane('a little delivery. a whole world of love.', 10, .55, '#637e73', 58);
  readonly island = createIsland();
  constructor(canvas: HTMLCanvasElement) {
    const height = CONFIG.camera.viewHeight, width = height * 16 / 9;
    this.camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, .1, 120);
    this.camera.position.set(...CONFIG.camera.position); this.camera.lookAt(new THREE.Vector3(...CONFIG.camera.target)); this.camera.updateMatrixWorld();
    // Keep the low sky lane behind the cottage as it scrolls past the island.
    this.environment.clouds[2].position.add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(6));
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(CONFIG.width, CONFIG.height, false); this.renderer.setPixelRatio(1);
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = .98;
    this.scene.background = new THREE.Color(CONFIG.colors.sky); this.scene.fog = new THREE.Fog(CONFIG.colors.sky, 32, 65);
    this.scene.add(new THREE.HemisphereLight('#fff8e6', '#779485', 1.4));
    const sun = new THREE.DirectionalLight('#fff0d3', 2.6); sun.position.set(-5, 10, 7); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -9; sun.shadow.camera.right = 9; sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9; sun.shadow.normalBias = .035; sun.shadow.bias = -.0002; sun.shadow.radius = 5; this.scene.add(sun);
    const fill = new THREE.DirectionalLight('#d5eaf1', .65); fill.position.set(6, 5, -6); this.scene.add(fill);
    // An actual receiving surface gives the floating diorama a soft, grounded shadow.
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: CONFIG.colors.sky, roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -2.35; floor.receiveShadow = true; this.scene.add(floor);
    this.balloons = createBalloons(this.camera);
    this.scene.add(this.island, this.house.group, this.environment.group, this.character.group, this.vehicle.group, this.gift.group, this.balloons.group, this.particles.group);
    // Camera-space lettering is part of the WebGL scene and therefore the exported video.
    this.camera.add(this.intro, this.welcome, this.name, this.dedication); this.scene.add(this.camera);
    this.intro.position.set(0, 4.65, -15); this.welcome.position.set(0, 4.85, -15); this.name.position.set(0, 4.05, -15); this.dedication.position.set(0, -4.95, -15);
  }
  render() { this.renderer.render(this.scene, this.camera); }
  dispose() {
    const geometries = new Set<THREE.BufferGeometry>(), mats = new Set<THREE.Material>(), textures = new Set<THREE.Texture>();
    this.scene.traverse(o => { if (o instanceof THREE.Mesh || o instanceof THREE.Line) { geometries.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { mats.add(m); const map = (m as THREE.MeshBasicMaterial).map; if (map) textures.add(map); }); } });
    geometries.forEach(g => g.dispose()); textures.forEach(t => t.dispose()); mats.forEach(m => m.dispose()); this.renderer.dispose();
  }
}
