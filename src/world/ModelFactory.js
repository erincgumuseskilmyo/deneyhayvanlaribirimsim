import * as THREE from 'three';
import { getRoomType } from '../data/rooms.js';
import { getSpecies } from '../data/species.js';

/**
 * LOW-POLY MODEL ÜRETİMİ
 * Modeller prosedürel olarak üretilir (harici GLB dosyası gerekmez).
 * Dış GLB kullanmak isteyen için `loadGLTF` kancası bırakılmıştır:
 * public/models/<name>.glb konur ve ModelFactory.override(name, url) çağrılır.
 */

const WALL_H = 1.5;

export class ModelFactory {
  constructor() {
    this.overrides = new Map(); // name -> THREE.Object3D (klonlanır)
    this.materials = {
      wall: new THREE.MeshLambertMaterial({ color: 0xf2f4f7 }),
      floor: new THREE.MeshLambertMaterial({ color: 0xdfe4ea }),
      cage: new THREE.MeshLambertMaterial({ color: 0xdfe6ec }),
      cageLid: new THREE.MeshLambertMaterial({ color: 0xa9b6c2 }),
      bedding: new THREE.MeshLambertMaterial({ color: 0xe8dcc0 }),
      rack: new THREE.MeshLambertMaterial({ color: 0xbcc6d0 })
    };
  }

  /** Harici GLB modeli kaydet (opsiyonel) */
  async loadGLTF(name, url) {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    this.overrides.set(name, gltf.scene);
    return gltf.scene;
  }

  _override(name) {
    const o = this.overrides.get(name);
    return o ? o.clone(true) : null;
  }

  // ---------- ODA ----------

  buildRoom(room) {
    const custom = this._override(`room_${room.type}`);
    if (custom) { custom.position.set(room.x + room.w / 2, 0, room.z + room.d / 2); return custom; }

    const def = getRoomType(room.type);
    const group = new THREE.Group();
    group.name = `room:${room.id}`;
    group.userData = { kind: 'room', id: room.id };

    // Zemin
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(room.w - 0.08, 0.12, room.d - 0.08),
      new THREE.MeshLambertMaterial({ color: def.color })
    );
    floor.position.set(0, 0.06, 0);
    floor.receiveShadow = true;
    floor.userData = { kind: 'room', id: room.id };
    group.add(floor);

    // Duvarlar (kalın kenar çerçevesi)
    const t = 0.14;
    const wallMat = this.materials.wall.clone();
    const walls = [
      { w: room.w, d: t, x: 0, z: -room.d / 2 + t / 2 },
      { w: room.w, d: t, x: 0, z: room.d / 2 - t / 2 },
      { w: t, d: room.d, x: -room.w / 2 + t / 2, z: 0 },
      { w: t, d: room.d, x: room.w / 2 - t / 2, z: 0 }
    ];
    for (const w of walls) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, WALL_H, w.d), wallMat);
      mesh.position.set(w.x, WALL_H / 2 + 0.1, w.z);
      mesh.castShadow = true;
      mesh.userData = { kind: 'room', id: room.id, isWall: true };
      group.add(mesh);
    }

    // Kapı boşluğu göstergesi (renkli eşik)
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.06, 0.28),
      new THREE.MeshLambertMaterial({ color: 0x7f95ab })
    );
    door.position.set(0, 0.14, room.d / 2 - 0.14);
    group.add(door);

    // Oda tipini belirten renkli işaret kübü (çatı köşesi)
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshLambertMaterial({ color: def.color })
    );
    marker.position.set(-room.w / 2 + 0.35, WALL_H + 0.3, -room.d / 2 + 0.35);
    marker.castShadow = true;
    group.add(marker);

    group.position.set(room.x + room.w / 2, 0, room.z + room.d / 2);
    return group;
  }

  // ---------- KAFES ----------

  buildCage(cage, localPos) {
    const custom = this._override(`cage_${cage.type}`);
    if (custom) { custom.position.copy(localPos); return custom; }

    const group = new THREE.Group();
    group.userData = { kind: 'cage', id: cage.id };

    const scale = cage.type === 'metabolism' ? 0.5 : 0.62;
    const h = 0.26;

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(scale, h, scale * 0.78),
      this.materials.cage.clone()
    );
    body.position.y = h / 2;
    body.castShadow = true;
    body.userData = { kind: 'cage', id: cage.id };
    group.add(body);

    // Altlık
    const bedding = new THREE.Mesh(
      new THREE.BoxGeometry(scale * 0.9, 0.06, scale * 0.68),
      this.materials.bedding.clone()
    );
    bedding.position.y = h * 0.55;
    group.add(bedding);

    // Kapak — tipe göre renk/şekil
    const lidColor = {
      standard: 0xa9b6c2, improved: 0x93b39a, microisolator: 0x9fb4cc,
      ivc: 0x6f93bd, metabolism: 0xc2a98f
    }[cage.type] ?? 0xa9b6c2;
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(scale * 1.02, 0.07, scale * 0.8),
      new THREE.MeshLambertMaterial({ color: lidColor })
    );
    lid.position.y = h + 0.035;
    lid.castShadow = true;
    lid.userData = { kind: 'cage', id: cage.id };
    group.add(lid);

    // IVC hava bağlantısı
    if (cage.type === 'ivc') {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.22, 6),
        new THREE.MeshLambertMaterial({ color: 0x8fa7bd })
      );
      pipe.position.set(scale * 0.45, h + 0.14, 0);
      group.add(pipe);
    }

    group.position.copy(localPos);
    return group;
  }

  /** Kafes rafı (görsel dolgu) */
  buildRack(width, depth) {
    const g = new THREE.Group();
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.05, depth),
      this.materials.rack.clone()
    );
    shelf.position.y = 0.02;
    shelf.receiveShadow = true;
    g.add(shelf);
    return g;
  }

  // ---------- HAYVAN ----------

  buildAnimal(animal) {
    const custom = this._override(`animal_${animal.species}`);
    if (custom) return custom;

    const sp = getSpecies(animal.species);
    const s = sp.scale;
    const group = new THREE.Group();
    group.userData = { kind: 'animal', id: animal.id };

    const color = new THREE.Color(sp.color);
    if (animal.genetics !== 'wildtype') color.offsetHSL(0.45, 0.15, -0.05);
    const mat = new THREE.MeshLambertMaterial({ color, flatShading: true });

    // Gövde — düşük poligonlu kapsül benzeri
    const body = new THREE.Mesh(new THREE.SphereGeometry(s * 0.5, 7, 5), mat);
    body.scale.set(1.5, 0.85, 0.9);
    body.position.y = s * 0.45;
    body.castShadow = true;
    group.add(body);

    // Baş
    const head = new THREE.Mesh(new THREE.SphereGeometry(s * 0.3, 6, 5), mat);
    head.position.set(s * 0.65, s * 0.5, 0);
    head.castShadow = true;
    group.add(head);

    // Kulaklar
    const earGeo = new THREE.CircleGeometry(s * 0.17, 6);
    const earMat = new THREE.MeshLambertMaterial({
      color: color.clone().offsetHSL(0, 0, -0.08), side: THREE.DoubleSide
    });
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(earGeo, earMat);
      ear.position.set(s * 0.6, s * 0.72, side * s * 0.2);
      ear.rotation.y = Math.PI / 2;
      group.add(ear);
    }

    // Kuyruk (tavşan hariç uzun)
    const tailLen = animal.species === 'rabbit' ? s * 0.2 : s * 1.1;
    const tail = new THREE.Mesh(
      new THREE.CylinderGeometry(s * 0.05, s * 0.03, tailLen, 4),
      new THREE.MeshLambertMaterial({ color: 0xd8b8b0 })
    );
    tail.rotation.z = Math.PI / 2.2;
    tail.position.set(-s * 0.75, s * 0.4, 0);
    group.add(tail);

    return group;
  }

  /** Yerleştirme önizlemesi (hayalet) */
  buildGhost(typeId, valid) {
    const def = getRoomType(typeId);
    const [w, d] = def.size;
    const mat = new THREE.MeshBasicMaterial({
      color: valid ? 0x5da36f : 0xc1564f,
      transparent: true, opacity: 0.38, depthWrite: false
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, d), mat);
    mesh.position.y = 0.3;
    const group = new THREE.Group();
    group.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(w, 0.6, d)),
      new THREE.LineBasicMaterial({ color: valid ? 0x2f6a44 : 0x8f3c36 })
    );
    edges.position.y = 0.3;
    group.add(edges);
    return group;
  }

  /** Seçim çerçevesi */
  buildSelection(room) {
    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(room.w, 1.8, room.d));
    const line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x4a7fb5 }));
    line.position.set(room.x + room.w / 2, 0.9, room.z + room.d / 2);
    return line;
  }
}
