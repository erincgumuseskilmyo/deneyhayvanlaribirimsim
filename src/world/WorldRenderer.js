import * as THREE from 'three';
import { ModelFactory } from './ModelFactory.js';
import { getRoomType } from '../data/rooms.js';
import { getSpecies } from '../data/species.js';

/**
 * Oyun durumunu (GameState) 3B sahneye yansıtır.
 * Fark tabanlı senkronizasyon: yalnızca değişen nesneler eklenir/çıkarılır.
 */
export class WorldRenderer {
  constructor(scene, state, bus) {
    this.sceneMgr = scene;
    this.state = state;
    this.bus = bus;
    this.factory = new ModelFactory();

    this.roomMeshes = new Map();   // roomId -> Object3D
    this.cageMeshes = new Map();   // cageId -> Object3D
    this.animalMeshes = new Map(); // animalId -> Object3D
    this.selectionMesh = null;
    this.ghost = null;
    this.time = 0;

    bus.on('facility:changed', () => this.sync());
    bus.on('room:built', () => this.sync());
  }

  /**
   * Harici modeller sonradan yüklendiğinde mevcut mesh'leri atıp yeniden kurar.
   * (Manifest asenkron yüklendiği için sahne çoktan çizilmiş olabilir.)
   */
  reloadModels() {
    for (const map of [this.animalMeshes, this.cageMeshes, this.roomMeshes]) {
      for (const mesh of map.values()) {
        mesh.parent?.remove(mesh);
        disposeTree(mesh);
      }
      map.clear();
    }
    this.sync();
  }

  sync() {
    this.syncRooms();
    this.syncCages();
    this.syncAnimals();
  }

  syncRooms() {
    const st = this.state;
    const alive = new Set(st.rooms.map((r) => r.id));
    for (const [id, mesh] of this.roomMeshes) {
      if (!alive.has(id)) {
        this.sceneMgr.roomsGroup.remove(mesh);
        disposeTree(mesh);
        this.roomMeshes.delete(id);
      }
    }
    for (const room of st.rooms) {
      if (this.roomMeshes.has(room.id)) continue;
      const mesh = this.factory.buildRoom(room);
      this.sceneMgr.roomsGroup.add(mesh);
      this.roomMeshes.set(room.id, mesh);
    }
  }

  /** Kafesleri oda içinde ızgara halinde diz */
  cageLocalPosition(room, index) {
    const perRow = Math.max(1, Math.floor((room.w - 0.6) / 0.75));
    const col = index % perRow;
    const row = Math.floor(index / perRow);
    const x = -room.w / 2 + 0.6 + col * 0.75;
    const z = -room.d / 2 + 0.7 + row * 0.65;
    return new THREE.Vector3(x, 0.12, Math.min(z, room.d / 2 - 0.5));
  }

  syncCages() {
    const st = this.state;
    const alive = new Set(st.cages.map((c) => c.id));
    for (const [id, mesh] of this.cageMeshes) {
      if (!alive.has(id)) {
        mesh.parent?.remove(mesh);
        disposeTree(mesh);
        this.cageMeshes.delete(id);
      }
    }
    // Oda bazında indeksle
    const byRoom = new Map();
    for (const cage of st.cages) {
      if (!byRoom.has(cage.roomId)) byRoom.set(cage.roomId, []);
      byRoom.get(cage.roomId).push(cage);
    }
    for (const [roomId, cages] of byRoom) {
      const room = st.roomById(roomId);
      const roomMesh = this.roomMeshes.get(roomId);
      if (!room || !roomMesh) continue;
      cages.forEach((cage, i) => {
        if (this.cageMeshes.has(cage.id)) return;
        const pos = this.cageLocalPosition(room, i);
        const mesh = this.factory.buildCage(cage, pos);
        roomMesh.add(mesh);
        this.cageMeshes.set(cage.id, mesh);
      });
    }
  }

  syncAnimals() {
    const st = this.state;
    // Görsel performans: kafes başına en fazla 3 hayvan çizilir (sembolik gösterim)
    const visible = new Set();
    const perCage = new Map();
    for (const a of st.livingAnimals) {
      const n = perCage.get(a.cageId) ?? 0;
      if (n >= 3) continue;
      perCage.set(a.cageId, n + 1);
      visible.add(a.id);
    }

    for (const [id, mesh] of this.animalMeshes) {
      if (!visible.has(id)) {
        mesh.parent?.remove(mesh);
        disposeTree(mesh);
        this.animalMeshes.delete(id);
      }
    }

    for (const a of st.livingAnimals) {
      if (!visible.has(a.id) || this.animalMeshes.has(a.id)) continue;
      const cageMesh = this.cageMeshes.get(a.cageId);
      if (!cageMesh) continue;
      const mesh = this.factory.buildAnimal(a);
      const idx = (perCageIndex(this.animalMeshes, a.cageId, this.state));
      // Kafesin üst yüzeyine otur: sabit bir yükseklik, harici modellerde
      // hayvanın kapağın içine gömülmesine yol açıyordu.
      const topY = cageMesh.userData.topY ?? 0.33;
      mesh.position.set((idx - 1) * 0.14, topY, (idx % 2) * 0.1 - 0.05);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.userData.wander = { phase: Math.random() * Math.PI * 2, cageId: a.cageId };
      cageMesh.add(mesh);
      this.animalMeshes.set(a.id, mesh);
    }
  }

  /** Refah/hastalık durumuna göre kafes rengini güncelle */
  refreshIndicators() {
    const st = this.state;
    for (const cage of st.cages) {
      const mesh = this.cageMeshes.get(cage.id);
      if (!mesh) continue;
      const body = mesh.children[0];
      if (!body?.material) continue;
      const dirty = cage.cleanliness < 45;
      const target = dirty ? 0xd9c9b6 : 0xdfe6ec;
      body.material.color.setHex(target);
    }
    for (const room of st.rooms) {
      const mesh = this.roomMeshes.get(room.id);
      if (!mesh) continue;
      const floor = mesh.children[0];
      if (!floor?.material) continue;
      // Oda tabelası: tür atanmışsa tür adı, değilse oda adı (Bölüm 3, s. 51)
      const sign = mesh.userData.sign;
      if (sign) {
        const label = room.species ? getSpecies(room.species).name : room.def.name;
        const suffix = room.quarantined ? ' · KARANTİNA'
          : !room.operational ? ' · KAPALI'
          : room.diseaseLevel > 20 ? ' · ŞÜPHE' : '';
        this.factory.updateSign(sign, label + suffix);
      }

      if (room.diseaseLevel > 20) floor.material.color.setHex(0xe3c3bd);
      else if (room.quarantined) floor.material.color.setHex(0xe8d9b8);
      else if (!room.operational) floor.material.color.setHex(0xc8c8c8);
      else floor.material.color.setHex(room.def.color);
    }
  }

  /** Küçük hareket animasyonu + harici GLB animasyon kliplerinin güncellenmesi */
  animate(dt) {
    this.time += dt;

    // Harici modellerden gelen animasyon klipleri (varsa)
    for (const map of [this.animalMeshes, this.cageMeshes, this.roomMeshes]) {
      for (const mesh of map.values()) {
        mesh.userData.mixer?.update(dt);
      }
    }

    // Oda tabelaları kameraya dönük dursun (hangi açıdan bakılırsa okunabilsin)
    const cam = this.sceneMgr.camera;
    for (const mesh of this.roomMeshes.values()) {
      const sign = mesh.userData.sign;
      if (!sign) continue;
      const dx = cam.position.x - (mesh.position.x + sign.position.x);
      const dz = cam.position.z - (mesh.position.z + sign.position.z);
      sign.rotation.y = Math.atan2(dx, dz);
    }

    for (const mesh of this.animalMeshes.values()) {
      // Kendi modeli animasyonluysa el yapımı salınım uygulanmaz
      if (mesh.userData.mixer) continue;
      const w = mesh.userData.wander;
      if (!w) continue;
      const t = this.time * 1.2 + w.phase;
      mesh.position.x += Math.sin(t) * 0.0009;
      mesh.position.z += Math.cos(t * 0.7) * 0.0009;
      mesh.position.x = THREE.MathUtils.clamp(mesh.position.x, -0.2, 0.2);
      mesh.position.z = THREE.MathUtils.clamp(mesh.position.z, -0.16, 0.16);
      mesh.rotation.y += Math.sin(t * 0.5) * 0.006;
    }
  }

  setSelection(room) {
    if (this.selectionMesh) {
      this.sceneMgr.scene.remove(this.selectionMesh);
      disposeTree(this.selectionMesh);
      this.selectionMesh = null;
    }
    if (room) {
      this.selectionMesh = this.factory.buildSelection(room);
      this.sceneMgr.scene.add(this.selectionMesh);
    }
  }

  setGhost(typeId, gx, gz, valid) {
    this.clearGhost();
    if (!typeId) return;
    this.ghost = this.factory.buildGhost(typeId, valid);
    const [w, d] = getRoomType(typeId).size;
    this.ghost.position.set(gx + w / 2, 0, gz + d / 2);
    this.sceneMgr.ghostGroup.add(this.ghost);
  }

  clearGhost() {
    if (!this.ghost) return;
    this.sceneMgr.ghostGroup.remove(this.ghost);
    disposeTree(this.ghost);
    this.ghost = null;
  }

  /** Bir mesh'ten oda/kafes kimliğini bulur */
  resolvePick(object) {
    let o = object;
    while (o) {
      if (o.userData?.kind) return o.userData;
      o = o.parent;
    }
    return null;
  }

  pickableObjects() {
    return [this.sceneMgr.roomsGroup, this.sceneMgr.ground];
  }
}

function perCageIndex(map, cageId, state) {
  let n = 0;
  for (const [id] of map) {
    const a = state.animalById(id);
    if (a && a.cageId === cageId) n += 1;
  }
  return n;
}

function disposeTree(obj) {
  if (obj.userData?.mixer) {
    obj.userData.mixer.stopAllAction();
    obj.userData.mixer.uncacheRoot(obj);
    obj.userData.mixer = null;
  }
  obj.traverse?.((child) => {
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose?.());
    else child.material?.dispose?.();
  });
}
