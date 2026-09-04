import { clamp, avg } from '../core/utils.js';

/**
 * HAYVAN REFAHI SİSTEMİ
 * Refah şu faktörlerin ağırlıklı bileşimidir:
 * yem, su, sıcaklık, nem, kafes yoğunluğu, temizlik, gürültü,
 * zenginleştirme, hastalık, stres, uygun personel, uygun taşıma.
 *
 * Ağırlıklar oyun dengesi kararıdır.
 */
export const WELFARE_WEIGHTS = {
  food: 0.14,
  water: 0.12,
  environment: 0.18,   // sıcaklık + nem + havalandırma + gürültü
  density: 0.14,
  cleanliness: 0.14,
  enrichment: 0.10,
  staffing: 0.10,
  health: 0.08
};

export class WelfareSystem {
  constructor(bus, state, husbandry) {
    this.bus = bus;
    this.state = state;
    this.husbandry = husbandry;
    this.lastBreakdown = null;
  }

  /** Bir hayvan için refah bileşenlerini hesaplar (0-1 ölçeğinde) */
  computeFactors(animal) {
    const st = this.state;
    const cage = st.cageById(animal.cageId);
    const room = st.roomById(animal.roomId);
    const sp = animal.speciesData;
    const coverage = this.husbandry.lastReport.coverage;

    const occupants = cage ? st.animalsInCage(cage.id).length : 1;
    const cap = cage ? Math.min(cage.capacity, sp.perCageCapacity) : 1;
    // Yoğunluk: kapasitenin üstü ceza; hamster/tavşan gibi tekil türlerde
    // tek başına barındırma cezalandırılmaz.
    let density;
    if (occupants > cap) density = clamp(1 - (occupants - cap) * 0.28, 0, 1);
    else if (sp.perCageCapacity > 2 && occupants === 1) density = 0.72; // sosyal izolasyon
    else density = 1;

    return {
      food: cage?.foodOk ? 1 : 0.35,
      water: cage?.waterOk ? 1 : 0.15,
      environment: room ? room.environmentScore(sp) : 0.5,
      density,
      cleanliness: cage ? cage.cleanliness / 100 : 0.5,
      enrichment: cage ? cage.enrichment / 100 : 0.2,
      staffing: clamp(coverage, 0, 1),
      health: animal.health / 100
    };
  }

  dailyTick() {
    const st = this.state;
    const animals = st.livingAnimals;
    if (!animals.length) return;

    const totals = Object.fromEntries(Object.keys(WELFARE_WEIGHTS).map((k) => [k, 0]));

    for (const animal of animals) {
      const f = this.computeFactors(animal);
      let target = 0;
      for (const [key, w] of Object.entries(WELFARE_WEIGHTS)) {
        target += f[key] * w * 100;
        totals[key] += f[key];
      }

      // Genetiği değiştirilmiş hatların ek bakım ihtiyacı
      if (animal.genetics !== 'wildtype') {
        const gmPenalty = st.hasRoom('genetics') ? 3 : 9;
        target -= gmPenalty;
      }
      // Deneye alınmış hayvanlarda ek yük
      if (animal.experimentalStatus === 'in_study') target -= 6;
      if (animal.diseased) target -= 18;
      // Yaşlılık
      if (animal.ageRatio > 0.8) target -= 6;

      target = clamp(target);
      // Refah kademeli değişir (ani sıçrama olmasın)
      animal.welfare = clamp(animal.welfare + (target - animal.welfare) * 0.35);

      // Stres refahın tersine hareket eder
      const stressTarget = clamp((100 - animal.welfare) * sp_sensitivity(animal));
      animal.stress = clamp(animal.stress + (stressTarget - animal.stress) * 0.3);

      // Sağlık refah ve stresten etkilenir
      let healthDelta = 0;
      if (animal.welfare > 70) healthDelta += 0.8;
      if (animal.welfare < 40) healthDelta -= 1.6;
      if (animal.stress > 70) healthDelta -= 1.2;
      if (animal.diseased) healthDelta -= 2.5;
      if (animal.ageRatio > 0.9) healthDelta -= 0.6;
      animal.health = clamp(animal.health + healthDelta);

      animal.ageOneDay();
    }

    // Tesis geneli refah istatistiği
    const facilityWelfare = avg(animals, (a) => a.welfare);
    st.animalWelfare = clamp(st.animalWelfare + (facilityWelfare - st.animalWelfare) * 0.4);

    const n = animals.length;
    this.lastBreakdown = Object.fromEntries(
      Object.entries(totals).map(([k, v]) => [k, v / n])
    );

    // Refah alarmı
    if (facilityWelfare < 40 && st.day % 4 === 0) {
      this.bus.emit('welfare:alarm', { level: facilityWelfare });
    }
  }
}

function sp_sensitivity(animal) {
  return animal.speciesData.stressSensitivity ?? 1;
}
