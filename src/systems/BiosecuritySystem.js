import { clamp, avg } from '../core/utils.js';

/**
 * BİYOGÜVENLİK SİSTEMİ
 * Bariyer odaları, kafes teknolojisi, personel ve hijyenden hesaplanır.
 * Pest kontrolü ve atık yönetimi burada modellenir.
 */
export class BiosecuritySystem {
  constructor(bus, state, rng) {
    this.bus = bus;
    this.state = state;
    this.rng = rng;
    this.pestPressure = 10;   // 0-100
    this.wasteBacklog = 0;    // 0-100
  }

  computeScore() {
    const st = this.state;
    let score = 20;

    if (st.hasRoom('changing')) score += 14;
    if (st.hasRoom('quarantine')) score += 12;
    if (st.hasRoom('cleaning')) score += 8;
    if (st.hasRoom('utility')) score += 5;
    if (st.hasRoom('ivc')) score += 6;

    // Kafes teknolojisi ortalaması
    if (st.cages.length) {
      score += avg(st.cages, (c) => c.def.biosecurityBonus) * 0.8;
    }
    // Personel
    if (st.staffOfRole('biosecurity').length) score += 10;
    if (st.staffOfRole('veterinarian').length) score += 6;

    // Hijyen ve pest/atık baskısı
    score += (st.hygiene - 60) * 0.25;
    score -= this.pestPressure * 0.25;
    score -= this.wasteBacklog * 0.2;

    // Teknoloji
    if (st.unlockedTech.has('spf_facility')) score += 12;
    if (st.unlockedTech.has('germ_free')) score += 10;

    // Aktif hastalık varsa düşer
    const infected = st.rooms.filter((r) => r.diseaseLevel > 20).length;
    score -= infected * 8;

    return clamp(score);
  }

  dailyTick() {
    const st = this.state;

    // --- Pest baskısı ---
    let pestDelta = 0.9;
    if (st.hasRoom('food_storage')) pestDelta += 0.5;
    if (st.staffOfRole('biosecurity').length) pestDelta -= 1.6;
    if (st.hygiene > 75) pestDelta -= 0.9;
    if (st.hygiene < 45) pestDelta += 1.2;
    this.pestPressure = clamp(this.pestPressure + pestDelta);

    // --- Atık birikimi ---
    const wasteGen = st.cages.length * 0.35 + st.livingAnimals.length * 0.02;
    const wasteCap = (st.staffOfRole('cleaner').length * 6) +
                     (st.staffOfRole('biosecurity').length * 10) +
                     (st.hasRoom('cleaning') ? 8 : 0);
    this.wasteBacklog = clamp(this.wasteBacklog + wasteGen - wasteCap);

    const target = this.computeScore();
    st.biosecurity = clamp(st.biosecurity + (target - st.biosecurity) * 0.2);

    if (this.pestPressure > 70 && st.day % 6 === 0) {
      this.bus.emit('notify', { text: 'Pest baskısı yüksek — biyogüvenlik risk altında.', level: 'warn' });
    }
    if (this.wasteBacklog > 65 && st.day % 6 === 0) {
      this.bus.emit('notify', { text: 'Atık birikimi kritik seviyede.', level: 'warn' });
    }
  }

  runPestControl() {
    const st = this.state;
    const cost = 9000 + st.rooms.length * 900;
    if (!st.canAfford(cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    st.spend(cost, 'Pest kontrol uygulaması', 'biosecurity');
    this.pestPressure = clamp(this.pestPressure - 45);
    st.adjust('biosecurity', 4);
    st.addLog('Pest kontrol uygulaması yapıldı.', 'good');
    return { ok: true, cost };
  }

  clearWaste() {
    const st = this.state;
    const cost = 3000 + Math.round(this.wasteBacklog * 90);
    if (!st.canAfford(cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    st.spend(cost, 'Atık bertarafı', 'biosecurity');
    this.wasteBacklog = 0;
    st.adjust('biosecurity', 3);
    return { ok: true, cost };
  }
}
