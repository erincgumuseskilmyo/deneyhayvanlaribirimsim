import { clamp, avg } from '../core/utils.js';
import { getSpecies } from '../data/species.js';

/**
 * HAYVAN REFAHI SİSTEMİ
 *
 * İKİ KATMAN VARDIR — bunlar bilinçli olarak ayrılmıştır:
 *
 * 1) FAKTÖRLER (oyun modeli): refah puanını sürükleyen ağırlıklı bileşenler.
 *    Ağırlıklar OYUN DENGESİ kararıdır, kaynak kitaptan gelmez. Ancak her
 *    faktörün kendisi kitapta refahı etkileyen bir unsur olarak geçer
 *    (yem, su, sıcaklık/nem/havalandırma/gürültü, kafes alanı, temizlik,
 *    zenginleştirme, personel yeterliliği, sağlık).
 *
 * 2) BELİRTEÇLER (kitap): Bölüm 4, s. 73-74'te tanımlanan dört belirteç grubu
 *    — genel, fizyolojik, davranış ve özel belirteçler. Bunlar raporda
 *    gösterilir ve oyuncuya refahın kitaptaki çerçevesini öğretir.
 */
export const WELFARE_WEIGHTS = {
  food: 0.14,
  water: 0.12,
  environment: 0.18,   // sıcaklık + nem + havalandırma + gürültü
  density: 0.14,       // kafes taban alanı (Tablo 3.2-3.7)
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
    this.lastIndicators = null;
  }

  /** Bir hayvan için refah bileşenlerini hesaplar (0-1 ölçeğinde) */
  computeFactors(animal) {
    const st = this.state;
    const cage = st.cageById(animal.cageId);
    const room = st.roomById(animal.roomId);
    const sp = animal.speciesData;
    const coverage = this.husbandry.lastReport.coverage;

    const occupants = cage ? st.animalsInCage(cage.id).length : 1;
    const cap = cage ? cage.capacityForSpecies(animal.species, animal.weight) : 1;

    // --- Yoğunluk: kitaptaki taban alanı tablolarına göre ---
    let density;
    if (cap === 0) {
      // Kafes türün minimum bölme büyüklüğünü/yüksekliğini karşılamıyor
      density = 0.25;
    } else if (occupants > cap) {
      density = clamp(1 - (occupants - cap) / cap, 0, 1);
    } else {
      density = 1;
    }
    // Sosyal türlerde tek başına barındırma: fare ve sıçan sosyal hayvanlardır
    // (Bölüm 5, s. 97 ve s. 106: "Sıçanlar doğaları gereği sosyal hayvanlardır.
    // Tek yaşadıklarında ise oldukça hassastırlar.")
    if (['mouse', 'rat'].includes(animal.species) && occupants === 1) {
      density = Math.min(density, 0.72);
    }

    // --- Izgara tabanlı kafeslerde ayak yaralanması riski ---
    // (Bölüm 3, s. 57: özellikle sıçan ve tavşanlarda; Bölüm 6, s. 120: kobay yavruları)
    let cageTypePenalty = 0;
    if (cage?.def.penaltySpecies?.includes(animal.species)) cageTypePenalty = 0.12;

    return {
      food: cage?.foodOk ? 1 : 0.35,
      water: cage?.waterOk ? 1 : 0.15,
      environment: room ? room.environmentScore(sp) : 0.5,
      density: clamp(density - cageTypePenalty, 0, 1),
      cleanliness: cage ? cage.cleanliness / 100 : 0.5,
      enrichment: cage ? cage.enrichment / 100 : 0.2,
      staffing: clamp(coverage, 0, 1),
      health: animal.health / 100
    };
  }

  dailyTick() {
    const st = this.state;
    const animals = st.livingAnimals;
    if (!animals.length) { this.lastIndicators = null; return; }

    const totals = Object.fromEntries(Object.keys(WELFARE_WEIGHTS).map((k) => [k, 0]));

    for (const animal of animals) {
      const f = this.computeFactors(animal);
      let target = 0;
      for (const [key, w] of Object.entries(WELFARE_WEIGHTS)) {
        target += f[key] * w * 100;
        totals[key] += f[key];
      }

      // Genetiği değiştirilmiş hayvanlar ek özel yaklaşım gerektirir
      // (Bölüm 7, s. 150)
      if (animal.genetics !== 'wildtype') {
        target -= st.hasRoom('genetics') ? 3 : 9;
      }
      if (animal.experimentalStatus === 'in_study') target -= 6;
      if (animal.diseased) target -= 18;
      if (animal.ageRatio > 0.8) target -= 6;

      target = clamp(target);
      animal.welfare = clamp(animal.welfare + (target - animal.welfare) * 0.35);

      const stressTarget = clamp((100 - animal.welfare) * (animal.speciesData.stressSensitivity ?? 1));
      animal.stress = clamp(animal.stress + (stressTarget - animal.stress) * 0.3);

      let healthDelta = 0;
      if (animal.welfare > 70) healthDelta += 0.8;
      if (animal.welfare < 40) healthDelta -= 1.6;
      if (animal.stress > 70) healthDelta -= 1.2;
      if (animal.diseased) healthDelta -= 2.5;
      if (animal.ageRatio > 0.9) healthDelta -= 0.6;
      animal.health = clamp(animal.health + healthDelta);

      animal.ageOneDay();
    }

    const facilityWelfare = avg(animals, (a) => a.welfare);
    st.animalWelfare = clamp(st.animalWelfare + (facilityWelfare - st.animalWelfare) * 0.4);

    const n = animals.length;
    this.lastBreakdown = Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, v / n]));
    this.lastIndicators = this.computeIndicators(animals);

    if (facilityWelfare < 40 && st.day % 4 === 0) {
      this.bus.emit('welfare:alarm', { level: facilityWelfare, indicators: this.lastIndicators });
    }
  }

  /**
   * HAYVAN REFAHININ BELİRTEÇLERİ — Bölüm 4, s. 73-74.
   * Her belirteç için 0-1 arası bir "iyilik" değeri ve gözlem notu üretilir.
   */
  computeIndicators(animals) {
    const st = this.state;

    // --- Genel belirteçler ---
    // "Ortalama bir yaşam süresi vardır. Bu sürenin kısalmış olması"
    const recentDeaths = st.animals.filter(
      (a) => !a.alive && a.causeOfDeath && !['devredildi', 'çalışma sonu'].includes(a.causeOfDeath)
    );
    const earlyDeaths = recentDeaths.filter((a) => a.age < a.speciesData.lifespanDays * 0.5).length;
    const lifespanScore = clamp(1 - earlyDeaths / Math.max(10, st.animals.length), 0, 1);

    // "Zamana göre büyüme ve gelişim grafiği vardır. Bu grafiğin altına inilmiş olması"
    const growth = avg(animals, (a) => {
      const sp = getSpecies(a.species);
      const expected = a.expectedWeight();
      return expected > 0 ? clamp(a.weight / expected, 0, 1) : 1;
    });

    // "Bir üreme yaşı, zamanı ve meydana getirebileceği ortalama yavru sayısı vardır"
    const mature = animals.filter((a) => a.isMature && a.sex === 'F');
    const breeding = mature.length
      ? clamp(animals.filter((a) => ['pregnant', 'nursing'].includes(a.reproductiveStatus)).length /
              Math.max(1, mature.length) * 3, 0, 1)
      : 1;

    // "hastalık sıklığının artması"
    const diseaseFreq = clamp(1 - animals.filter((a) => a.diseased).length / animals.length * 4, 0, 1);

    // --- Fizyolojik belirteçler (oyun soyutlaması: sağlık ve stresten türetilir) ---
    const physiological = clamp(avg(animals, (a) => (a.health / 100) * (1 - a.stress / 200)), 0, 1);

    // --- Davranış belirteçleri: doğal davranışları sergileyebilme ---
    const behaviour = clamp(avg(animals, (a) => {
      const cage = st.cageById(a.cageId);
      const enr = cage ? cage.enrichment / 100 : 0.2;
      const f = this.computeFactors(a);
      return enr * 0.5 + f.density * 0.5;
    }), 0, 1);

    // --- Özel belirteçler: ağrı, stres, eziyet, acı çekme, kontrol kaybı ---
    const special = clamp(1 - avg(animals, (a) => a.stress) / 100, 0, 1);

    return {
      genel: {
        label: 'Genel belirteçler',
        value: (lifespanScore + growth + breeding + diseaseFreq) / 4,
        parts: {
          'Yaşam süresi (erken ölüm yok)': lifespanScore,
          'Büyüme-gelişim grafiği': growth,
          'Üreme başarısı': breeding,
          'Hastalık sıklığı (düşük)': diseaseFreq
        }
      },
      fizyolojik: {
        label: 'Fizyolojik belirteçler',
        value: physiological,
        note: 'Nabız, vücut sıcaklığı, solunum hızı ve kan parametreleri oyunda ' +
              'sağlık ve stres üzerinden soyutlanmıştır.'
      },
      davranis: {
        label: 'Davranış belirteçleri',
        value: behaviour,
        note: 'Doğal davranışların sergilenebilmesi: zenginleştirme ve kafes alanı.'
      },
      ozel: {
        label: 'Özel belirteçler',
        value: special,
        note: 'Ağrı, stres, eziyet, acı çekme ve kontrol kaybı.'
      }
    };
  }
}
