import { CORRIDOR_TYPES, UNCONNECTED_CARE_PENALTY } from '../data/corridors.js';
import { GRID_SIZE } from './FacilitySystem.js';

/**
 * Bir odanın kenarına değen koridor karolarını bulur.
 * Koridorlar oda dışında, odanın çevresine bitişik 1x1 karolardır.
 * Saf fonksiyon: 3B katmandan ve sistemlerden bağımsızdır, test edilebilir.
 */
export function roomCorridorAccess(state, room) {
  const access = { clean: false, dirty: false, tiles: [] };
  for (const c of state.corridors) {
    const touchesX = c.x >= room.x - 1 && c.x <= room.x + room.w;
    const touchesZ = c.z >= room.z - 1 && c.z <= room.z + room.d;
    if (!touchesX || !touchesZ) continue;
    const insideX = c.x >= room.x && c.x < room.x + room.w;
    const insideZ = c.z >= room.z && c.z < room.z + room.d;
    // Yalnızca kenara dik komşuluk sayılır; köşeden değen karo kapı açamaz.
    const edge = (insideX && !insideZ) || (insideZ && !insideX);
    if (!edge) continue;
    access[c.type] = true;
    access.tiles.push(c);
  }
  access.any = access.clean || access.dirty;
  /**
   * "Tesis içerisinde bariyerli yetiştirme yapılıyorsa o zaman odanın her iki
   *  tarafında kapı bulunmalı ve bu kapılardan biri kirli, biri de temiz
   *  koridora açılmalıdır." (Bölüm 3, s. 52)
   */
  access.barrierCompliant = access.clean && access.dirty;
  return access;
}

/** Bir odanın bakım kapsamı çarpanı: koridora bağlı değilse geçişler zorlaşır. */
export function roomCareFactor(state, room) {
  if (!state.corridors.length) return 1;      // henüz koridor kurulmamışsa ceza yok
  return roomCorridorAccess(state, room).any ? 1 : 1 - UNCONNECTED_CARE_PENALTY;
}

/**
 * KORİDOR SİSTEMİ — servis alanı olarak koridor yerleştirme ve kaldırma
 * (Bölüm 3, s. 49-52).
 */
export class CorridorSystem {
  constructor(bus, state) {
    this.bus = bus;
    this.state = state;
    this.gridSize = GRID_SIZE;
  }

  canPlace(typeId, x, z) {
    const def = CORRIDOR_TYPES[typeId];
    if (!def) return { ok: false, reason: 'Bilinmeyen koridor tipi.' };
    const st = this.state;
    if (x < 0 || z < 0 || x >= this.gridSize || z >= this.gridSize) {
      return { ok: false, reason: 'Arsa sınırlarının dışında.' };
    }
    if (st.corridorAt(x, z)) return { ok: false, reason: 'Burada zaten koridor var.' };
    for (const r of st.rooms) {
      if (x >= r.x && x < r.x + r.w && z >= r.z && z < r.z + r.d) {
        return { ok: false, reason: 'Oda üzerine koridor döşenemez.' };
      }
    }
    if (!st.canAfford(def.cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    return { ok: true };
  }

  place(typeId, x, z) {
    const check = this.canPlace(typeId, x, z);
    if (!check.ok) return check;
    const def = CORRIDOR_TYPES[typeId];
    const st = this.state;
    st.spend(def.cost, `Koridor: ${def.name}`, 'construction');
    const tile = { x, z, type: typeId };
    st.corridors.push(tile);
    this.bus.emit('facility:changed');
    this.bus.emit('corridor:built', tile);
    return { ok: true, tile };
  }

  remove(x, z) {
    const st = this.state;
    const idx = st.corridors.findIndex((c) => c.x === x && c.z === z);
    if (idx === -1) return { ok: false, reason: 'Burada koridor yok.' };
    const tile = st.corridors[idx];
    const refund = Math.round(CORRIDOR_TYPES[tile.type].cost * 0.4);
    st.corridors.splice(idx, 1);
    st.earn(refund, 'Koridor sökümü geri kazanımı', 'construction');
    this.bus.emit('facility:changed');
    return { ok: true, refund };
  }

  access(room) { return roomCorridorAccess(this.state, room); }

  /** Bariyerli yetiştirmeye uygun (temiz + kirli koridora açılan) barındırma odaları */
  barrierCompliantRooms() {
    return this.state.animalRooms.filter((r) => roomCorridorAccess(this.state, r).barrierCompliant);
  }

  /** Koridora bağlı barındırma odalarının oranı (0-1) */
  connectedShare() {
    const rooms = this.state.animalRooms;
    if (!rooms.length) return 1;
    const n = rooms.filter((r) => roomCorridorAccess(this.state, r).any).length;
    return n / rooms.length;
  }

  /** Biyogüvenlik puanına koridor katkısı (oyun dengesi kararı). */
  biosecurityBonus() {
    const st = this.state;
    if (!st.corridors.length) return 0;
    const rooms = st.animalRooms;
    if (!rooms.length) return 0;
    const compliant = this.barrierCompliantRooms().length / rooms.length;
    return compliant * 10 + this.connectedShare() * 4;
  }

  maintenancePerMonth() {
    return this.state.corridors.reduce(
      (s, c) => s + CORRIDOR_TYPES[c.type].maintenanceCost, 0
    );
  }
}
