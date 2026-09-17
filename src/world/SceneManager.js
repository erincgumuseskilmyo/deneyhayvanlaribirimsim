import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Sahne, kamera, ışıklar ve kontroller.
 * Üstten bakış + hafif izometrik perspektif; zoom ve pan serbest,
 * dikey açı sınırlandırılmıştır (oda içleri hep görünür kalsın diye).
 */
export class SceneManager {
  constructor(canvas, gridSize) {
    this.gridSize = gridSize;
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeef1f5);
    this.scene.fog = new THREE.Fog(0xeef1f5, 60, 140);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.5, 400);
    // Başlangıçta tesisin kurulacağı bölgeye yakın dur: uzaktan bakışta
    // odalar okunamayacak kadar küçük kalıyor.
    const c = gridSize * 0.38;
    this.camera.position.set(c + 13, 17, c + 16);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(c, 0, c);
    this.focusTarget = null;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 90;
    // Hafif izometrik: kamera hep yukarıdan bakar
    this.controls.minPolarAngle = 0.22;
    this.controls.maxPolarAngle = Math.PI / 2.6;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };
    this.controls.update();

    this._setupLights();
    this._setupGround();

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  _setupLights() {
    const hemi = new THREE.HemisphereLight(0xffffff, 0xb9c2cc, 0.85);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff6e8, 1.0);
    sun.position.set(this.gridSize * 0.7, 42, this.gridSize * 0.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const s = this.gridSize;
    sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
    sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
    sun.shadow.camera.far = 120;
    sun.shadow.bias = -0.0009;
    this.scene.add(sun);
    this.sun = sun;

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.28));
  }

  _setupGround() {
    const g = this.gridSize;
    // Arsa
    const groundGeo = new THREE.PlaneGeometry(g, g);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xcfd8c8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(g / 2, 0, g / 2);
    ground.receiveShadow = true;
    ground.name = 'ground';
    this.scene.add(ground);
    this.ground = ground;

    // Çevre çimi
    const outer = new THREE.Mesh(
      new THREE.PlaneGeometry(g * 3, g * 3),
      new THREE.MeshLambertMaterial({ color: 0xc2cfba })
    );
    outer.rotation.x = -Math.PI / 2;
    outer.position.set(g / 2, -0.05, g / 2);
    outer.receiveShadow = true;
    this.scene.add(outer);

    // Grid çizgileri
    const grid = new THREE.GridHelper(g, g, 0x9fb0a0, 0xb8c4b4);
    grid.position.set(g / 2, 0.02, g / 2);
    grid.material.opacity = 0.55;
    grid.material.transparent = true;
    this.scene.add(grid);
    this.grid = grid;

    // Grup katmanları
    this.roomsGroup = new THREE.Group(); this.roomsGroup.name = 'rooms';
    this.cagesGroup = new THREE.Group(); this.cagesGroup.name = 'cages';
    this.animalsGroup = new THREE.Group(); this.animalsGroup.name = 'animals';
    this.corridorsGroup = new THREE.Group(); this.corridorsGroup.name = 'corridors';
    this.ghostGroup = new THREE.Group(); this.ghostGroup.name = 'ghost';
    this.scene.add(this.roomsGroup, this.cagesGroup, this.animalsGroup,
                   this.corridorsGroup, this.ghostGroup);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Ekran koordinatını grid hücresine çevirir */
  pointerToGrid(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.groundPlane, hit)) return null;
    return { gx: Math.floor(hit.x), gz: Math.floor(hit.z), point: hit };
  }

  /** İmleç altındaki nesneleri döndürür (oda/kafes seçimi için) */
  pick(clientX, clientY, objects) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(objects, true);
  }

  /** Kamerayı belirli bir grid noktasına yumuşakça yöneltir. */
  focusOn(gx, gz) {
    this.focusTarget = { x: gx, z: gz };
  }

  render() {
    if (this.focusTarget) {
      const t = this.controls.target;
      const nx = t.x + (this.focusTarget.x - t.x) * 0.08;
      const nz = t.z + (this.focusTarget.z - t.z) * 0.08;
      this.camera.position.x += nx - t.x;
      this.camera.position.z += nz - t.z;
      t.set(nx, 0, nz);
      if (Math.hypot(this.focusTarget.x - nx, this.focusTarget.z - nz) < 0.05) {
        this.focusTarget = null;
      }
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /** Kamera yüksekliğine göre duvarları şeffaflaştırır (iç görünürlük) */
  updateWallTransparency() {
    const dist = this.camera.position.distanceTo(this.controls.target);
    const polar = this.controls.getPolarAngle();
    // Yatay bakışta duvarlar saydamlaşsın, tepeden bakışta katılaşsın
    const t = Math.min(1, Math.max(0, (polar - 0.55) / 0.65));
    const opacity = 0.97 - t * 0.5;
    this.roomsGroup.traverse((obj) => {
      if (obj.userData.isWall && obj.material) {
        obj.material.opacity = opacity;
        obj.material.transparent = opacity < 0.99;
      }
    });
    return { dist, polar };
  }
}
