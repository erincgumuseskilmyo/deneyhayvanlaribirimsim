import * as THREE from 'three';
import { ModelFactory } from './ModelFactory.js';
import { getRoomType } from '../data/rooms.js';
import { getSpecies } from '../data/species.js';
import {
  rackCount, rackPositions, usesRacks, cageSlot, slotPosition,
  SLOT_W, SLOT_D, SLOT_H, RACK_ANIMAL_SCALE, RACK_ANIMALS_PER_CAGE
} from './rackLayout.js';

/** Rafın zeminden yükselişi (tekerlek payı) */
const RACK_BASE_Y = 0.02;

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
    this.corridorMeshes = new Map(); // "x,z" -> Object3D
    this.rackMeshes = new Map();   // roomId -> Object3D[]
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
    for (const racks of this.rackMeshes.values()) {
      for (const m of racks) { m.parent?.remove(m); disposeTree(m); }
    }
    this.rackMeshes.clear();
    for (const map of [this.animalMeshes, this.cageMeshes, this.roomMeshes, this.corridorMeshes]) {
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
    this.syncCorridors();
    this.syncRacks();
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

  syncCorridors() {
    const st = this.state;
    const alive = new Set(st.corridors.map((c) => `${c.x},${c.z}`));
    for (const [key, mesh] of this.corridorMeshes) {
      if (!alive.has(key)) {
        this.sceneMgr.corridorsGroup.remove(mesh);
        disposeTree(mesh);
        this.corridorMeshes.delete(key);
      }
    }
    for (const tile of st.corridors) {
      const key = `${tile.x},${tile.z}`;
      if (this.corridorMeshes.has(key)) continue;
      const mesh = this.factory.buildCorridor(tile);
      this.sceneMgr.corridorsGroup.add(mesh);
      this.corridorMeshes.set(key, mesh);
    }
  }

  /**
   * Kafes rafları: tavşan dışındaki barındırma odalarında arka duvara
   * kafes rafı dizilir (bkz. src/world/rackLayout.js).
   */
  syncRacks() {
    const st = this.state;
    for (const [id, racks] of this.rackMeshes) {
      if (!st.roomById(id)) {
        for (const m of racks) { m.parent?.remove(m); disposeTree(m); }
        this.rackMeshes.delete(id);
      }
    }
    for (const room of st.rooms) {
      const roomMesh = this.roomMeshes.get(room.id);
      if (!roomMesh) continue;
      const want = rackCount(room, st.cagesInRoom(room.id).length);
      const have = this.rackMeshes.get(room.id) ?? [];
      if (have.length === want) continue;
      for (const m of have) { m.parent?.remove(m); disposeTree(m); }
      // Raflar yeniden kurulunca onlara bağlı kafes yuvaları da düşer;
      // bir sonraki syncCages/syncAnimals turunda yeniden üretilirler.
      this.dropRoomCages(room.id);
      const made = rackPositions(room, want).map((p) => {
        const mesh = this.factory.buildRack();
        // Rafın ön yüzü modelde +z'ye bakar; arka duvarda sırtı duvara dönük dursun
        mesh.rotation.y = Math.PI;
        mesh.position.set(p.x, RACK_BASE_Y, p.z);
        roomMesh.add(mesh);
        return mesh;
      });
      if (made.length) this.rackMeshes.set(room.id, made);
      else this.rackMeshes.delete(room.id);
    }
  }

  /** Bir odanın kafes yuvalarını ve içindeki hayvanları sahneden düşür */
  dropRoomCages(roomId) {
    for (const cage of this.state.cagesInRoom(roomId)) {
      const mesh = this.cageMeshes.get(cage.id);
      if (!mesh) continue;
      for (const [aid, am] of this.animalMeshes) {
        if (am.parent === mesh) {
          disposeTree(am);
          this.animalMeshes.delete(aid);
        }
      }
      mesh.parent?.remove(mesh);
      disposeTree(mesh);
      this.cageMeshes.delete(cage.id);
    }
  }

  /** Kafesleri oda içinde ızgara halinde diz (yalnızca tavşan odaları) */
  cageLocalPosition(room, index, step = 0.75) {
    const perRow = Math.max(1, Math.floor((room.w - 0.4) / step));
    const col = index % perRow;
    const row = Math.floor(index / perRow);
    const x = -room.w / 2 + step * 0.75 + col * step;
    const z = -room.d / 2 + step * 0.85 + row * step * 0.88;
    const back = room.d / 2 - step * 0.6;
    return new THREE.Vector3(x, 0.12, Math.min(z, back));
  }

  /**
   * Raf gözü: kafesin kendisi rafın modelinde zaten çizilidir, burada yalnızca
   * hayvanların bağlanacağı boş bir çapa (Group) kurulur. Çapa -90 derece
   * döndürülür ki hayvanların uzun ekseni gözün derinliğine denk gelsin.
   */
  buildSlotAnchor(cage, slot, rackPos) {
    const p = slotPosition(slot.shelf, slot.col);
    const anchor = new THREE.Group();
    // Çapa odaya bağlanır (rafa değil): harici raf modeli ölçeklendiği için
    // rafın altına eklenen her şey ikinci kez ölçeklenirdi. Rafın ön yüzü
    // Math.PI döndürülmüş olduğundan göz ekseni x'te ters çevrilir.
    anchor.position.set(rackPos.x - p.x, RACK_BASE_Y + p.y, rackPos.z + p.z);
    anchor.rotation.y = -Math.PI / 2;
    anchor.userData = {
      kind: 'cage',
      id: cage.id,
      rackSlot: true,
      topY: 0,
      spread: SLOT_W,
      limitX: SLOT_D * 0.3,
      limitZ: SLOT_W * 0.45
    };
    return anchor;
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

      if (usesRacks(room)) {
        // Tavşan dışındaki türler kafeslerini rafta bulur: zeminde ayrı kafes
        // kutusu çizilmez, her kafes bir raf gözüne oturur.
        const racks = this.rackMeshes.get(roomId) ?? [];
        if (!racks.length) continue;
        const positions = rackPositions(room, racks.length);
        cages.forEach((cage, i) => {
          if (this.cageMeshes.has(cage.id)) return;
          const slot = cageSlot(i, racks.length);
          const anchor = this.buildSlotAnchor(
            cage, slot, positions[Math.min(slot.rack, positions.length - 1)]
          );
          roomMesh.add(anchor);
          this.cageMeshes.set(cage.id, anchor);
        });
        continue;
      }

      // Yerleşim adımı odadaki en büyük kafese göre belirlenir, yoksa
      // geniş kafesler birbirinin içine girer.
      const step = Math.max(0.75, ...cages.map(
        (c) => 0.62 * Math.sqrt((c.def.floorArea ?? 800) / 800) * 1.22
      ));
      cages.forEach((cage, i) => {
        if (this.cageMeshes.has(cage.id)) return;
        const pos = this.cageLocalPosition(room, i, step);
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
      const cageMesh = this.cageMeshes.get(a.cageId);
      // Raf gözü zemin kafesinden dar: orada daha az hayvan çizilir
      const cap = cageMesh?.userData.rackSlot ? RACK_ANIMALS_PER_CAGE : 3;
      const n = perCage.get(a.cageId) ?? 0;
      if (n >= cap) continue;
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

      // Hayvanlar kafesin UZUN ekseni (x) boyunca hizalanır ve kısa eksende
      // (z) kaydırılarak dizilir. Kısa eksene çevirmek, sıçan gibi uzun
      // gövdeli türlerde hayvanı kafesin dışına taşırıyordu.
      const spread = (cageMesh.userData.spread ?? 0.19);
      const side = idx === 0 ? 0 : (idx % 2 === 1 ? 1 : -1);
      mesh.position.set(
        (Math.random() - 0.5) * spread * 0.25,
        topY,
        side * spread * 0.42
      );
      // +X ya da -X'e bakar (kafesin uzun ekseni), küçük bir sapmayla
      mesh.rotation.y = (side >= 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.45;
      if (cageMesh.userData.rackSlot) mesh.scale.multiplyScalar(rackFit(mesh));
      mesh.userData.wander = {
        phase: Math.random() * Math.PI * 2,
        cageId: a.cageId,
        limitX: cageMesh.userData.limitX ?? 0.2,
        limitZ: cageMesh.userData.limitZ ?? 0.16
      };
      cageMesh.add(mesh);
      this.animalMeshes.set(a.id, mesh);
    }
  }

  /** Refah/hastalık durumuna göre kafes rengini güncelle */
  refreshIndicators() {
    const st = this.state;
    for (const cage of st.cages) {
      const mesh = this.cageMeshes.get(cage.id);
      // Raf gözünde kafes gövdesi rafın modelinde; boyanacak ayrı kutu yok
      if (!mesh || mesh.userData.rackSlot) continue;
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
      mesh.position.x = THREE.MathUtils.clamp(mesh.position.x, -w.limitX, w.limitX);
      mesh.position.z = THREE.MathUtils.clamp(mesh.position.z, -w.limitZ, w.limitZ);
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

  setCorridorGhost(gx, gz, valid) {
    this.clearGhost();
    this.ghost = this.factory.buildCorridorGhost(valid);
    this.ghost.position.set(gx + 0.5, 0, gz + 0.5);
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
    return [this.sceneMgr.roomsGroup, this.sceneMgr.corridorsGroup, this.sceneMgr.ground];
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

/**
 * Raf gözüne giren hayvanın ölçek çarpanı: gözün iç yüksekliğini aşan türler
 * (ör. kobay) tavana girmesin diye ayrıca küçültülür.
 */
function rackFit(mesh) {
  const h = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3()).y;
  if (!(h > 0)) return RACK_ANIMAL_SCALE;
  return Math.min(RACK_ANIMAL_SCALE, (SLOT_H * 0.85) / h);
}
