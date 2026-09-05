import { nextId } from '../core/RNG.js';
import { clamp } from '../core/utils.js';
import { getCageType } from '../data/cages.js';
import { capacityFor, getSpecies } from '../data/species.js';

export class Cage {
  constructor({ type = 'shoebox', roomId, gridIndex = 0 }) {
    const def = getCageType(type);
    this.id = nextId('cg');
    this.type = type;
    this.roomId = roomId;
    this.gridIndex = gridIndex;      // oda içindeki raf konumu (görsel)
    this.floorArea = def.floorArea;   // cm²
    this.height = def.height;         // cm
    this.cleanliness = 90;           // 0-100
    this.enrichment = 40;            // 0-100, zenginleştirme düzeyi
    this.daysSinceCleaning = 0;
    this.waterOk = true;
    this.foodOk = true;
    this.purpose = 'breeding';       // breeding | stock | study
  }

  get def() { return getCageType(this.type); }

  /**
   * Bu kafesin verilen tür için alabileceği hayvan sayısı.
   * Kaynak: Bölüm 3, Tablo 3.2-3.7 (tür başına taban alanı ve minimum bölme).
   * Metabolizma kafesi tek bireyliktir (Bölüm 3, s. 58).
   */
  capacityForSpecies(speciesId, weightGr = null) {
    if (!speciesId) return 0;
    const sp = getSpecies(speciesId);
    const w = weightGr ?? sp?.adultWeight ?? 30;
    const byArea = capacityFor(speciesId, this.floorArea, this.height, w);
    if (byArea === 0) return 0;   // türün minimum bölme ölçüsünü karşılamıyor
    // Taban alanı hesabı bazı kombinasyonlarda gerçekçi olmayan grup
    // büyüklükleri verir; kafes tipine bağlı üst sınır uygulanır.
    // Metabolizma kafesi tek bireyliktir (Bölüm 3, s. 58).
    const cap = this.def.singleOccupancy ? 1 : (this.def.maxOccupants ?? byArea);
    return Math.min(byArea, cap);
  }

  soil(amount) {
    this.cleanliness = clamp(this.cleanliness - amount);
    this.daysSinceCleaning += 1;
  }

  clean() {
    this.cleanliness = 100;
    this.daysSinceCleaning = 0;
  }
}
