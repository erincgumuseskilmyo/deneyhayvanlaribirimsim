import { Room } from '../entities/Room.js';
import { Cage } from '../entities/Cage.js';
import { Animal } from '../entities/Animal.js';
import { getRoomType } from '../data/rooms.js';
import { getCageType } from '../data/cages.js';
import { getSpecies } from '../data/species.js';
import { TECH } from '../data/tech.js';
import { clamp } from '../core/utils.js';
import { roomCorridorAccess } from './CorridorSystem.js';

export const GRID_SIZE = 26;

/**
 * TESİS SİSTEMİ — grid üzerinde oda yerleştirme, kafes alımı,
 * koloni kurma, tür ve teknoloji açma, çalışma izni.
 */
export class FacilitySystem {
  constructor(bus, state, rng) {
    this.bus = bus;
    this.state = state;
    this.rng = rng;
    this.gridSize = GRID_SIZE;
  }

  // --- Oda yerleştirme ---

  canPlace(typeId, x, z) {
    const def = getRoomType(typeId);
    if (!def) return { ok: false, reason: 'Bilinmeyen oda tipi.' };
    const st = this.state;
    if (def.tier > 1 && st.facilityLevel < 2) {
      return { ok: false, reason: 'Bu oda için tesis seviyesi 2 gerekli.' };
    }
    const [w, d] = def.size;
    if (x < 0 || z < 0 || x + w > this.gridSize || z + d > this.gridSize) {
      return { ok: false, reason: 'Arsa sınırlarının dışında.' };
    }
    const ghost = { x, z, w, d };
    for (const r of st.rooms) {
      if (!(ghost.x + ghost.w <= r.x || r.x + r.w <= ghost.x ||
            ghost.z + ghost.d <= r.z || r.z + r.d <= ghost.z)) {
        return { ok: false, reason: 'Başka bir odayla çakışıyor.' };
      }
    }
    for (const c of st.corridors) {
      if (c.x >= x && c.x < x + w && c.z >= z && c.z < z + d) {
        return { ok: false, reason: 'Koridor üzerine oda inşa edilemez.' };
      }
    }
    if (!st.canAfford(def.cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    return { ok: true };
  }

  placeRoom(typeId, x, z) {
    const check = this.canPlace(typeId, x, z);
    if (!check.ok) return check;
    const def = getRoomType(typeId);
    const st = this.state;
    st.spend(def.cost, `İnşaat: ${def.name}`, 'construction');
    const room = new Room({ type: typeId, x, z });
    // Teknik oda varsa iklim kontrolü daha iyi kurulur
    room.ventilation = 55 + def.ventilation * 40 + (st.hasRoom('utility') ? 8 : 0);
    st.rooms.push(room);
    st.addLog(`${def.name} inşa edildi.`);
    this.recomputeFacilityLevel();
    this.bus.emit('facility:changed');
    this.bus.emit('room:built', room);
    return { ok: true, room };
  }

  demolishRoom(roomId) {
    const st = this.state;
    const idx = st.rooms.findIndex((r) => r.id === roomId);
    if (idx === -1) return { ok: false, reason: 'Oda bulunamadı.' };
    const room = st.rooms[idx];
    if (st.animalsInRoom(room.id).length) {
      return { ok: false, reason: 'Odada hayvan var. Önce hayvanları taşıyın.' };
    }
    // Kafesler sökülür, %40 geri kazanım
    const cages = st.cagesInRoom(room.id);
    let refund = Math.round(room.def.cost * 0.25);
    for (const c of cages) refund += Math.round(c.def.cost * 0.4);
    st.cages = st.cages.filter((c) => c.roomId !== room.id);
    st.rooms.splice(idx, 1);
    st.earn(refund, `Yıkım geri kazanımı: ${room.name}`, 'construction');
    this.recomputeFacilityLevel();
    this.bus.emit('facility:changed');
    return { ok: true, refund };
  }

  // --- Kafesler ---

  buyCages(roomId, cageType, count) {
    const st = this.state;
    const room = st.roomById(roomId);
    if (!room) return { ok: false, reason: 'Oda bulunamadı.' };
    const def = getCageType(cageType);
    if (!def) return { ok: false, reason: 'Bilinmeyen kafes tipi.' };
    if (def.requiresRoom && room.type !== def.requiresRoom) {
      return { ok: false, reason: `Bu kafes yalnızca ${getRoomType(def.requiresRoom).name} içine kurulabilir.` };
    }
    if (!room.def.capacity) return { ok: false, reason: 'Bu odaya kafes yerleştirilemez.' };
    // Büyük kafesler odada daha çok yer kaplar (def.slots).
    const used = st.cagesInRoom(roomId).reduce((sum, c) => sum + (c.def.slots ?? 1), 0);
    const free = room.def.capacity - used;
    const slots = def.slots ?? 1;
    if (free < slots) {
      return { ok: false, reason: `Oda kapasitesi yetersiz (${free}/${slots} birim boş).` };
    }
    const n = Math.min(count, Math.floor(free / slots));
    const cost = def.cost * n;
    if (!st.canAfford(cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    st.spend(cost, `${def.name} × ${n}`, 'cage');
    for (let i = 0; i < n; i++) {
      st.cages.push(new Cage({ type: cageType, roomId, gridIndex: st.cagesInRoom(roomId).length }));
    }
    this.bus.emit('facility:changed');
    return { ok: true, count: n, cost };
  }

  // --- Koloni kurma ---

  /** Odaya seçilen türden başlangıç kolonisi alır. */
  foundColony(roomId, speciesId, pairs = 4) {
    const st = this.state;
    const room = st.roomById(roomId);
    if (!room) return { ok: false, reason: 'Oda bulunamadı.' };
    if (!st.unlockedSpecies.has(speciesId)) return { ok: false, reason: 'Bu tür henüz açılmadı.' };
    if (!room.def.allowedSpecies.includes(speciesId)) {
      return { ok: false, reason: 'Bu oda bu türü barındıramaz.' };
    }
    if (room.species && room.species !== speciesId) {
      return { ok: false, reason: 'Oda başka bir türe ayrılmış.' };
    }
    const cages = st.cagesInRoom(roomId).filter((c) => st.animalsInCage(c.id).length === 0);
    if (cages.length < pairs) {
      return { ok: false, reason: `Boş kafes yetersiz (${cages.length}/${pairs}).` };
    }
    const sp = getSpecies(speciesId);
    // Alım maliyeti: satış fiyatının üstünde (dışarıdan tedarik)
    const perAnimal = Math.round(sp.salePrice * 1.4);
    const cost = perAnimal * pairs * 3; // 1 erkek + 2 dişi
    if (!st.canAfford(cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    st.spend(cost, `${sp.name} kolonisi (${pairs} grup)`, 'animal_purchase');

    const micro = st.colonyStatus;
    for (let i = 0; i < pairs; i++) {
      const cage = cages[i];
      cage.purpose = 'breeding';
      const make = (sex) => {
        const a = new Animal({
          species: speciesId, sex,
          age: sp.maturityDays + this.rng.int(5, 40),
          cageId: cage.id, roomId,
          microbiologicalStatus: micro,
          birthDay: st.day - sp.maturityDays
        });
        a.reproductiveStatus = 'ready';
        a.updateWeight();
        return a;
      };
      st.animals.push(make('M'), make('F'), make('F'));
    }
    room.species = speciesId;

    // Karantina odası yoksa biyogüvenlik riski
    if (!st.hasRoom('quarantine')) {
      st.adjust('biosecurity', -8);
      this.bus.emit('notify', {
        text: 'Karantina odası olmadan hayvan kabul edildi — biyogüvenlik riski.', level: 'warn'
      });
    }
    st.addLog(`${sp.name} kolonisi kuruldu (${pairs * 3} birey).`, 'good');
    this.bus.emit('facility:changed');
    return { ok: true, cost, count: pairs * 3 };
  }

  // --- İzin, tür ve teknoloji ---

  licenseRequirements() {
    const st = this.state;
    const req = {
      animalRoom: st.hasRoom('animal'),
      changing: st.hasRoom('changing'),
      cleaning: st.hasRoom('cleaning'),
      quarantine: st.hasRoom('quarantine'),
      utility: st.hasRoom('utility'),
      veterinarian: st.staffOfRole('veterinarian').length > 0,
      caretaker: st.staffOfRole('caretaker').length > 0
    };
    req.ok = Object.values(req).every(Boolean);
    return req;
  }

  applyForLicense() {
    const st = this.state;
    if (st.hasOperatingLicense) return { ok: false, reason: 'İzin zaten alınmış.' };
    const req = this.licenseRequirements();
    if (!req.ok) return { ok: false, reason: 'Koşullar sağlanmadı.', req };
    const cost = 35000;
    if (!st.canAfford(cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    st.spend(cost, 'Çalışma izni başvuru gideri', 'admin');
    st.hasOperatingLicense = true;
    st.adjust('ethics', 6);
    st.adjust('scientificReputation', 6);
    st.addLog('Tesis çalışma izni alındı.', 'good');
    // İzin, tesis seviyesinin bir bileşenidir: hemen yeniden hesapla
    this.recomputeFacilityLevel();
    this.bus.emit('facility:changed');
    return { ok: true };
  }

  unlockSpecies(speciesId) {
    const st = this.state;
    const sp = getSpecies(speciesId);
    if (!sp) return { ok: false, reason: 'Tür bulunamadı.' };
    if (st.unlockedSpecies.has(speciesId)) return { ok: false, reason: 'Zaten açık.' };
    const req = sp.unlockRequirement;
    if (req?.facilityLevel && st.facilityLevel < req.facilityLevel) {
      return { ok: false, reason: `Tesis seviyesi ${req.facilityLevel} gerekli.` };
    }
    if (!st.canAfford(sp.unlockCost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    st.spend(sp.unlockCost, `Tür açılışı: ${sp.name}`, 'expansion');
    st.unlockedSpecies.add(speciesId);
    st.addLog(`${sp.name} üretimi açıldı.`, 'good');
    this.bus.emit('facility:changed');
    return { ok: true };
  }

  canUnlockTech(techId) {
    const st = this.state;
    const t = TECH[techId];
    if (!t) return { ok: false, reason: 'Teknoloji bulunamadı.' };
    if (st.unlockedTech.has(techId)) return { ok: false, reason: 'Zaten açık.' };
    for (const r of t.requires) {
      if (!st.unlockedTech.has(r)) return { ok: false, reason: `Önce ${TECH[r].name} gerekli.` };
    }
    if (t.requiresRoom && !st.hasRoom(t.requiresRoom)) {
      return { ok: false, reason: `${getRoomType(t.requiresRoom).name} gerekli.` };
    }
    if (t.requiresBarrierCorridors) {
      const ok = st.animalRooms.some((r) => roomCorridorAccess(st, r).barrierCompliant);
      if (!ok) {
        return {
          ok: false,
          reason: 'En az bir barındırma odası hem temiz hem kirli koridora açılmalı (s. 52).'
        };
      }
    }
    if (t.requiresStaff && st.staffOfRole(t.requiresStaff).length === 0) {
      return { ok: false, reason: 'Veteriner hekim gerekli.' };
    }
    if (!st.canAfford(t.cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    return { ok: true };
  }

  unlockTech(techId) {
    const check = this.canUnlockTech(techId);
    if (!check.ok) return check;
    const st = this.state;
    const t = TECH[techId];
    st.spend(t.cost, `Teknoloji: ${t.name}`, 'expansion');
    st.unlockedTech.add(techId);
    st.applyEffects(t.effects ?? {});
    if (t.setsColonyStatus) {
      st.colonyStatus = t.setsColonyStatus;
      for (const a of st.livingAnimals) a.microbiologicalStatus = t.setsColonyStatus;
    }
    if (t.setsBiosafetyLevel) st.biosafetyLevel = Math.max(st.biosafetyLevel, t.setsBiosafetyLevel);
    if (t.setsWelfareUnit) st.hasWelfareUnit = true;
    st.addLog(`${t.name} devreye alındı.`, 'good');
    this.recomputeFacilityLevel();
    this.bus.emit('facility:changed');
    return { ok: true };
  }

  /** Tesis seviyesi oda çeşitliliği, teknoloji ve itibardan hesaplanır */
  recomputeFacilityLevel() {
    const st = this.state;
    const distinct = new Set(st.rooms.map((r) => r.type)).size;
    const tier2 = st.rooms.filter((r) => r.def.tier === 2).length;
    let level = 1;
    if (distinct >= 6 && st.hasOperatingLicense) level = 2;
    if (distinct >= 9 && tier2 >= 2) level = 3;
    if (distinct >= 11 && st.unlockedTech.has('barrier_housing')) level = 4;
    if (st.unlockedTech.has('bgs3') && tier2 >= 5) level = 5;
    if (level !== st.facilityLevel) {
      st.facilityLevel = level;
      st.addLog(`Tesis seviyesi ${level} oldu.`, 'good');
      this.bus.emit('facility:levelUp', level);
    }
  }

  /** Oda içi iklimlendirme simülasyonu (günlük) */
  dailyTick() {
    const st = this.state;
    const utilityBonus = st.hasRoom('utility') ? 1 : 0;
    for (const room of st.rooms) {
      const def = room.def;
      if (!room.operational) {
        room.temperature += (18 - room.temperature) * 0.3;
        room.ventilation = clamp(room.ventilation - 20);
        continue;
      }
      const targetTemp = room.species ? avgOf(getSpecies(room.species).tempOptimum) : 22;
      const targetHum = room.species ? avgOf(getSpecies(room.species).humidityOptimum) : 55;
      const control = def.temperatureControl + utilityBonus * 0.1;
      const humControl = def.humidityControl + utilityBonus * 0.1;
      // Dış etkiler ve kontrol gücü
      const noiseT = this.rng.range(-2.5, 2.5) * (1 - control);
      const noiseH = this.rng.range(-8, 8) * (1 - humControl);
      room.temperature += (targetTemp - room.temperature) * control + noiseT;
      room.humidity = clamp(room.humidity + (targetHum - room.humidity) * humControl + noiseH, 10, 95);
      room.ventilation = clamp(
        room.ventilation + ((55 + def.ventilation * 40 + utilityBonus * 8) - room.ventilation) * 0.3
      );
      // Gürültü: kalabalık ve komşu oda sayısına bağlı
      const occupants = st.animalsInRoom(room.id).length;
      room.noise = clamp(10 + occupants * 0.4 + (st.rooms.length > 8 ? 8 : 0));
    }
  }

  /** Bir odada boş kafes bulup hayvanı yerleştirir (basit otomatik dağıtım) */
  autoAssign(animal, roomId) {
    const st = this.state;
    const cages = st.cagesInRoom(roomId);
    for (const c of cages) {
      if (st.animalsInCage(c.id).length < c.capacityForSpecies(animal.species)) {
        animal.cageId = c.id; animal.roomId = roomId;
        return true;
      }
    }
    return false;
  }
}

const avgOf = ([a, b]) => (a + b) / 2;
