import { Animal } from '../entities/Animal.js';
import { clamp } from '../core/utils.js';

/**
 * ÜREME / YETİŞTİRİCİLİK SİSTEMİ
 * Kafes içinde olgun erkek + dişi varsa gebelik başlayabilir.
 * Refah ve stres üreme başarısını doğrudan etkiler.
 */
export class BreedingSystem {
  constructor(bus, state, rng) {
    this.bus = bus;
    this.state = state;
    this.rng = rng;
    this.breedingEnabled = true;
    this.birthsToday = 0;
    this.deathsToday = 0;
  }

  dailyTick() {
    this.birthsToday = 0;
    this.deathsToday = 0;
    const st = this.state;

    // --- Gebelik ilerlemesi ve doğum ---
    for (const animal of st.livingAnimals) {
      if (animal.reproductiveStatus === 'pregnant') {
        animal.pregnancyDay += 1;
        if (animal.pregnancyDay >= animal.speciesData.gestationDays) {
          this.giveBirth(animal);
        }
      } else if (animal.reproductiveStatus === 'nursing') {
        animal.nursingDays = (animal.nursingDays ?? 0) + 1;
        if (animal.nursingDays >= animal.speciesData.weaningDays) {
          animal.reproductiveStatus = animal.age > animal.speciesData.lifespanDays * 0.85 ? 'retired' : 'ready';
          animal.nursingDays = 0;
        }
      }
    }

    // --- Yeni çiftleşmeler ---
    if (this.breedingEnabled) {
      for (const cage of st.cages) {
        if (cage.purpose !== 'breeding') continue;
        const occupants = st.animalsInCage(cage.id);
        const males = occupants.filter((a) => a.sex === 'M' && a.reproductiveStatus === 'ready');
        const females = occupants.filter((a) => a.sex === 'F' && a.reproductiveStatus === 'ready');
        if (!males.length || !females.length) continue;

        for (const female of females) {
          const chance = this.conceptionChance(female, cage);
          if (this.rng.chance(chance)) {
            female.reproductiveStatus = 'pregnant';
            female.pregnancyDay = 0;
            female.mateGenetics = this.rng.pick(males).genetics;
          }
        }
      }
    }

    // --- Doğal / refah kaynaklı ölümler ---
    for (const animal of st.livingAnimals) {
      const p = this.mortalityChance(animal);
      if (this.rng.chance(p)) {
        animal.die(animal.diseased ? 'hastalık' : animal.ageRatio > 0.9 ? 'yaşlılık' : 'refah/sağlık');
        this.deathsToday += 1;
      }
    }

    if (this.birthsToday > 0) {
      this.bus.emit('breeding:births', this.birthsToday);
    }
    if (this.deathsToday > 2) {
      this.bus.emit('notify', {
        text: `${this.deathsToday} hayvan kaybı yaşandı. Barındırma koşullarını gözden geçirin.`,
        level: 'bad'
      });
    }
  }

  /** Günlük gebe kalma olasılığı — oyun dengesi formülü */
  conceptionChance(female, cage) {
    if (female.age > female.speciesData.lifespanDays * 0.6) return 0;
    const welfareFactor = clamp(female.welfare / 100, 0, 1);
    const stressFactor = clamp(1 - female.stress / 130, 0.2, 1);
    const healthFactor = clamp(female.health / 100, 0, 1);
    const density = this.state.animalsInCage(cage.id).length / Math.max(1, cage.capacity);
    const densityFactor = density > 1 ? 0.5 : 1;
    return 0.075 * welfareFactor * stressFactor * healthFactor * densityFactor;
  }

  giveBirth(mother) {
    const st = this.state;
    const sp = mother.speciesData;
    const [minL, maxL] = sp.litterSizeRange;
    // Refah düşükse yavru sayısı ve yaşama şansı düşer
    const welfareScale = 0.5 + (mother.welfare / 100) * 0.5;
    const litter = Math.max(0, Math.round(this.rng.int(minL, maxL) * welfareScale));

    const cage = st.cageById(mother.cageId);
    for (let i = 0; i < litter; i++) {
      const pup = new Animal({
        species: mother.species,
        sex: this.rng.chance(0.5) ? 'M' : 'F',
        age: 0,
        genetics: this.inheritGenetics(mother),
        cageId: mother.cageId,
        roomId: mother.roomId,
        microbiologicalStatus: mother.microbiologicalStatus,
        birthDay: st.day,
        lineageId: mother.lineageId
      });
      pup.welfare = mother.welfare;
      st.animals.push(pup);
      this.birthsToday += 1;
    }

    mother.reproductiveStatus = 'nursing';
    mother.nursingDays = 0;
    mother.pregnancyDay = 0;

    if (cage) cage.soil(6);
    st.addLog(`${sp.name} doğumu: ${litter} yavru.`, 'good');
  }

  /** Genetik aktarım — oyun soyutlaması (gerçek kalıtım modeli değildir) */
  inheritGenetics(mother) {
    const mate = mother.mateGenetics ?? 'wildtype';
    if (mother.genetics === 'wildtype' && mate === 'wildtype') return 'wildtype';
    const modified = mother.genetics !== 'wildtype' ? mother.genetics : mate;
    // Her iki ebeveyn de modifiye ise aktarım şansı yüksek
    const both = mother.genetics !== 'wildtype' && mate !== 'wildtype';
    return this.rng.chance(both ? 0.85 : 0.5) ? modified : 'wildtype';
  }

  /** Günlük ölüm olasılığı */
  mortalityChance(animal) {
    let p = 0.0004;
    if (animal.ageRatio > 0.85) p += (animal.ageRatio - 0.85) * 0.05;
    if (animal.health < 40) p += (40 - animal.health) * 0.0016;
    if (animal.welfare < 30) p += (30 - animal.welfare) * 0.0009;
    if (animal.diseased) p += 0.012;
    if (animal.age < 5) p += 0.006; // neonatal dönem
    return clamp(p, 0, 0.4);
  }
}
