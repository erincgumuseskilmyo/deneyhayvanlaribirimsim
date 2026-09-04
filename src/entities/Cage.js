import { nextId } from '../core/RNG.js';
import { clamp } from '../core/utils.js';
import { getCageType } from '../data/cages.js';

export class Cage {
  constructor({ type = 'standard', roomId, gridIndex = 0 }) {
    const def = getCageType(type);
    this.id = nextId('cg');
    this.type = type;
    this.roomId = roomId;
    this.gridIndex = gridIndex;      // oda içindeki raf konumu (görsel)
    this.capacity = def.capacity;
    this.cleanliness = 90;           // 0-100
    this.enrichment = 40;            // 0-100, zenginleştirme düzeyi
    this.daysSinceCleaning = 0;
    this.waterOk = true;
    this.foodOk = true;
    this.purpose = 'breeding';       // breeding | stock | study
  }

  get def() { return getCageType(this.type); }

  soil(amount) {
    this.cleanliness = clamp(this.cleanliness - amount);
    this.daysSinceCleaning += 1;
  }

  clean() {
    this.cleanliness = 100;
    this.daysSinceCleaning = 0;
  }
}
