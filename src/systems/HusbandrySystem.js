import { clamp, avg } from '../core/utils.js';
import { roomCareFactor } from './CorridorSystem.js';

/** Kafesler haftada bir-iki kez değiştirilir (Bölüm 5, s. 109). */
export const CAGE_CLEAN_INTERVAL_DAYS = 4;

/**
 * Günlük bakım işleri: kafeslerin kirlenmesi, temizlenmesi,
 * yem/su durumu ve zenginleştirme.
 * Personel kapasitesi yetmezse işler aksar.
 */
export class HusbandrySystem {
  constructor(bus, state, rng) {
    this.bus = bus;
    this.state = state;
    this.rng = rng;
    this.lastReport = { cleaned: 0, missed: 0, coverage: 1 };
  }

  /** Toplam bakım kapasitesi (hayvan-eşdeğeri) */
  careCapacity() {
    return this.state.staff
      .filter((s) => s.def.capabilities.includes('care') || s.def.capabilities.includes('health'))
      .reduce((sum, s) => sum + s.effectiveCapacity, 0);
  }

  cleaningCapacity() {
    const base = this.state.staff
      .reduce((sum, s) => sum + s.def.hygieneContribution * s.effectiveCapacity, 0);
    const bonus = this.state.hasRoom('cleaning') ? 1.35 : 0.8;
    return base * bonus;
  }

  dailyTick() {
    const st = this.state;
    const animals = st.livingAnimals;
    const cages = st.cages;
    if (!cages.length) {
      this.lastReport = { cleaned: 0, missed: 0, coverage: 1 };
      return;
    }

    // --- Bakım kapsamı ---
    const capacity = this.careCapacity();
    const coverage = animals.length === 0 ? 1 : clamp(capacity / animals.length, 0, 1.2);

    // --- Kafeslerin kirlenmesi ---
    // Koridora bağlanmayan odalarda malzeme/kafes taşınması güçleşir, bakım aksar
    // ("Koridorlar ... kolay geçişi sağlayacak şekilde geniş olmalıdır." s. 50)
    const roomFactor = new Map();
    for (const r of st.rooms) roomFactor.set(r.id, roomCareFactor(st, r));

    for (const cage of cages) {
      const cov = coverage * (roomFactor.get(cage.roomId) ?? 1);
      const occ = st.animalsInCage(cage.id);
      const occupants = occ.length;
      const cap = occupants ? cage.capacityForSpecies(occ[0].species, occ[0].weight) : 1;
      const load = occupants / Math.max(1, cap);
      const soilRate = 5 + load * 9;
      cage.soil(soilRate);
      // Yem/su: kapsam düşükse aksama olasılığı artar
      cage.foodOk = this.rng.next() < 0.35 + cov * 0.7;
      cage.waterOk = this.rng.next() < 0.4 + cov * 0.7;
      // Zenginleştirme, bakıcı varsa yenilenir
      const hasEnricher = st.staff.some((s) => s.def.capabilities.includes('enrichment'));
      const target = (hasEnricher ? 70 : 30) + cage.def.welfareBonus * 1.5;
      cage.enrichment = clamp(cage.enrichment + (target - cage.enrichment) * 0.15 * cov);
    }

    // --- Temizlik ---
    // "Farklı bir durum söz konusu değilse kafesler haftada bir-iki kez
    //  değiştirilmeli, uygun deterjan ile yıkanmalı ve iyi bir şekilde
    //  durulanmalıdır." (Bölüm 5, s. 109)
    let budget = this.cleaningCapacity();
    const queue = [...cages].sort((a, b) => b.daysSinceCleaning - a.daysSinceCleaning);
    let cleaned = 0;
    for (const cage of queue) {
      if (cage.daysSinceCleaning < CAGE_CLEAN_INTERVAL_DAYS && cage.cleanliness > 55) continue;
      const cost = 8 * cage.def.cleaningDifficulty;
      if (budget < cost) break;
      budget -= cost;

      // "Yeni yavruları olmuş bir farenin kafesini veya altlık malzemesinin
      //  değiştirilmesi stresi arttıracağı için anne farenin yavrularını yemesine
      //  sebep olabilir." (Bölüm 5, s. 109)
      const occupants = st.animalsInCage(cage.id);
      const nursing = occupants.find((a) => a.reproductiveStatus === 'nursing');
      if (nursing && cage.daysSinceCleaning < CAGE_CLEAN_INTERVAL_DAYS * 2) continue;
      if (nursing && this.rng.chance(0.12)) {
        const pups = occupants.filter((a) => a.age < nursing.speciesData.weaningDays);
        const victim = this.rng.pick(pups);
        if (victim) {
          victim.die('kannibalizm');
          st.addLog('Emziren dişinin kafesi değiştirildi; stres sonucu yavru kaybı yaşandı.', 'bad');
          this.bus.emit('husbandry:cannibalism', { cageId: cage.id });
        }
      }
      cage.clean();
      cleaned += 1;
    }
    const missed = queue.filter((c) => c.cleanliness < 45).length;

    // --- Oda hijyeni kafeslerden türetilir ---
    for (const room of st.rooms) {
      const roomCages = st.cagesInRoom(room.id);
      const cageHygiene = roomCages.length ? avg(roomCages, (c) => c.cleanliness) : 85;
      const base = room.def.hygiene * 100;
      room.hygiene = clamp(base * 0.4 + cageHygiene * 0.6);
    }

    st.hygiene = clamp(st.rooms.length ? avg(st.rooms, (r) => r.hygiene) : 70);
    this.lastReport = { cleaned, missed, coverage };

    if (missed > 0 && st.day % 5 === 0) {
      this.bus.emit('notify', {
        text: `${missed} kafes temizlik bekliyor — hijyen düşüyor.`, level: 'warn'
      });
    }
  }
}
