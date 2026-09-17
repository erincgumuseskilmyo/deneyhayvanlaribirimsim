import { CORRIDOR, UNCONNECTED_CARE_PENALTY } from '../data/corridors.js';
import { GRID_SIZE } from './FacilitySystem.js';

/**
 * Bir odanın kenarına değen koridor karolarını bulur.
 * Koridorlar oda dışında, odanın çevresine bitişik 1x1 karolardır.
 * Saf fonksiyon: 3B katmandan ve sistemlerden bağımsızdır, test edilebilir.
 */
export function roomCorridorAccess(state, room) {
  const sides = { west: false, east: false, north: false, south: false };
  const tiles = [];
  for (const c of state.corridors) {
    const insideX = c.x >= room.x && c.x < room.x + room.w;
    const insideZ = c.z >= room.z && c.z < room.z + room.d;
    // Yalnızca kenara dik komşuluk sayılır; köşeden değen karo kapı açamaz.
    if (insideX && c.z === room.z - 1) sides.north = true;
    else if (insideX && c.z === room.z + room.d) sides.south = true;
    else if (insideZ && c.x === room.x - 1) sides.west = true;
    else if (insideZ && c.x === room.x + room.w) sides.east = true;
    else continue;
    tiles.push(c);
  }
  const connected = sides.west || sides.east || sides.north || sides.south;
  /**
   * Kitap bariyerli yetiştirmede odanın "her iki tarafında kapı" bulunmasını
   * ister (Bölüm 3, s. 52). Oyun bunu karşılıklı iki kenarın koridora açılması
   * olarak modeller; kitaptaki temiz/kirli koridor ayrımı kullanılmaz.
   */
  const twoDoors = (sides.west && sides.east) || (sides.north && sides.south);
  return { sides, tiles, connected, any: connected, twoDoors };
}

/** Bir odanın bakım kapsamı çarpanı: koridora bağlı değilse geçişler zorlaşır. */
export function roomCareFactor(state, room) {
  if (!state.corridors.length) return 1;      // henüz koridor kurulmamışsa ceza yok
  return roomCorridorAccess(state, room).connected ? 1 : 1 - UNCONNECTED_CARE_PENALTY;
}

/**
 * KORİDOR SİSTEMİ — servis alanı olarak koridor yerleştirme ve kaldırma
 * (Bölüm 3, s. 49-51).
 */
export class CorridorSystem {
  constructor(bus, state) {
    this.bus = bus;
    this.state = state;
    this.gridSize = GRID_SIZE;
  }

  canPlace(x, z) {
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
    if (!st.canAfford(CORRIDOR.cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    return { ok: true };
  }

  place(x, z) {
    const check = this.canPlace(x, z);
    if (!check.ok) return check;
    const st = this.state;
    st.spend(CORRIDOR.cost, `Koridor: ${CORRIDOR.name}`, 'construction');
    const tile = { x, z };
    st.corridors.push(tile);
    this.bus.emit('facility:changed');
    this.bus.emit('corridor:built', tile);
    return { ok: true, tile };
  }

  remove(x, z) {
    const st = this.state;
    const idx = st.corridors.findIndex((c) => c.x === x && c.z === z);
    if (idx === -1) return { ok: false, reason: 'Burada koridor yok.' };
    const refund = Math.round(CORRIDOR.cost * 0.4);
    st.corridors.splice(idx, 1);
    st.earn(refund, 'Koridor sökümü geri kazanımı', 'construction');
    this.bus.emit('facility:changed');
    return { ok: true, refund };
  }

  access(room) { return roomCorridorAccess(this.state, room); }

  /** Bariyerli yetiştirmeye uygun (karşılıklı iki kenarı koridora açılan) odalar */
  twoDoorRooms() {
    return this.state.animalRooms.filter((r) => roomCorridorAccess(this.state, r).twoDoors);
  }

  /** Koridora bağlı barındırma odalarının oranı (0-1) */
  connectedShare() {
    const rooms = this.state.animalRooms;
    if (!rooms.length) return 1;
    const n = rooms.filter((r) => roomCorridorAccess(this.state, r).connected).length;
    return n / rooms.length;
  }

  /** Biyogüvenlik puanına koridor katkısı (oyun dengesi kararı). */
  biosecurityBonus() {
    const st = this.state;
    if (!st.corridors.length) return 0;
    const rooms = st.animalRooms;
    if (!rooms.length) return 0;
    const twoDoor = this.twoDoorRooms().length / rooms.length;
    return twoDoor * 6 + this.connectedShare() * 8;
  }

  maintenancePerMonth() {
    return this.state.corridors.length * CORRIDOR.maintenanceCost;
  }
}
