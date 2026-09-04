import { nextId } from '../core/RNG.js';
import { clamp } from '../core/utils.js';
import { getSpecies } from '../data/species.js';

/**
 * Tek bir hayvanı temsil eder.
 * Sağlık/refah/stres 0-100 ölçeğindedir (oyun soyutlaması).
 */
export class Animal {
  constructor({
    species = 'mouse',
    sex = 'F',
    age = 0,
    genetics = 'wildtype',
    cageId = null,
    roomId = null,
    microbiologicalStatus = 'conventional',
    birthDay = 0,
    lineageId = null
  } = {}) {
    const sp = getSpecies(species);

    this.id = nextId('an');
    this.species = species;
    this.sex = sex;                 // 'M' | 'F'
    this.age = age;                 // gün
    this.weight = this._baseWeight(sp);
    this.health = 92;
    this.welfare = 75;
    this.stress = 15;
    this.genetics = genetics;       // wildtype | transgenic | knockout | knockin
    this.reproductiveStatus = 'immature'; // immature | ready | pregnant | nursing | retired
    this.pregnancyDay = 0;
    this.cageId = cageId;
    this.roomId = roomId;
    this.microbiologicalStatus = microbiologicalStatus; // conventional | spf | germ_free
    this.experimentalStatus = 'stock';  // stock | assigned | in_study | reserved
    this.birthDate = birthDay;
    this.lineageId = lineageId || nextId('line');
    this.alive = true;
    this.causeOfDeath = null;
    this.diseased = false;
  }

  _baseWeight(sp) {
    // Oyun soyutlaması: doğumda türün ölçeğine bağlı sembolik ağırlık (gram)
    return { mouse: 1.5, rat: 5, guinea_pig: 90, gerbil: 3, hamster: 2.5, rabbit: 60 }[sp.id] ?? 2;
  }

  get speciesData() { return getSpecies(this.species); }

  get isMature() { return this.age >= this.speciesData.maturityDays; }

  get ageRatio() { return this.age / this.speciesData.lifespanDays; }

  /** Yaşa göre büyüme (asimptotik) — oyun soyutlaması */
  updateWeight() {
    const sp = this.speciesData;
    const adult = { mouse: 28, rat: 320, guinea_pig: 850, gerbil: 75, hamster: 120, rabbit: 3200 }[sp.id] ?? 30;
    const t = clamp(this.age / sp.maturityDays, 0, 1);
    const target = this._baseWeight(sp) + (adult - this._baseWeight(sp)) * t;
    // Refah düşükse hedef ağırlığın altında kalır
    const welfareFactor = 0.8 + 0.2 * (this.welfare / 100);
    this.weight = Math.round(target * welfareFactor * 10) / 10;
  }

  ageOneDay() {
    this.age += 1;
    if (this.reproductiveStatus === 'immature' && this.isMature) {
      this.reproductiveStatus = 'ready';
    }
    if (this.age > this.speciesData.lifespanDays * 0.85) {
      this.reproductiveStatus = 'retired';
    }
    this.updateWeight();
  }

  die(cause) {
    this.alive = false;
    this.causeOfDeath = cause;
    this.reproductiveStatus = 'retired';
  }

  /** Satış / proje değeri — refah ve sağlık değeri etkiler */
  marketValue() {
    const sp = this.speciesData;
    let value = sp.salePrice;
    if (this.microbiologicalStatus === 'spf') value *= 1.6;
    if (this.microbiologicalStatus === 'germ_free') value *= 2.4;
    if (this.genetics === 'transgenic') value *= 2.0;
    if (this.genetics === 'knockout') value *= 2.8;
    if (this.genetics === 'knockin') value *= 3.4;
    const quality = 0.55 + 0.45 * ((this.health + this.welfare) / 200);
    return Math.round(value * quality);
  }

  toJSON() { return { ...this }; }
}
