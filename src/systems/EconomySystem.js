import { TECH } from '../data/tech.js';

/**
 * EKONOMİ SİSTEMİ
 * Gelir: hayvan satışı, araştırma projeleri, tesis kullanımı,
 *        sertifika kursları, özel hayvan üretimi.
 * Gider: inşaat, kafes, yem, altlık, su, elektrik, bakım,
 *        maaş, veteriner, biyogüvenlik, eğitim.
 */
export class EconomySystem {
  constructor(bus, state) {
    this.bus = bus;
    this.state = state;
    this.foodPriceIndex = 1.0;   // olaylarla değişir
    this.energyPriceIndex = 1.0;
    this.today = null;
  }

  dailyCosts() {
    const st = this.state;
    let food = 0; let water = 0;
    for (const a of st.livingAnimals) {
      food += a.speciesData.dailyFoodCost;
      water += a.speciesData.dailyWaterCost;
    }
    food *= this.foodPriceIndex;
    if (st.hasRoom('food_storage')) food *= 0.85; // toplu alım avantajı

    const bedding = st.cages.length * 2.2;
    const maintenance = st.rooms.reduce((s, r) => s + r.def.maintenanceCost, 0) / 30;
    const cageMaint = st.cages.reduce((s, c) => s + c.def.maintenance, 0) / 30;
    const electricity = (st.rooms.reduce((s, r) => s + r.area * 3.2, 0)) * this.energyPriceIndex;
    const vet = st.staffOfRole('veterinarian').length ? st.livingAnimals.length * 0.25 : 0;
    const biosec = st.biosecurity > 0 ? st.rooms.length * 6 : 0;
    const techUpkeep = [...st.unlockedTech]
      .reduce((s, id) => s + (TECH[id]?.upkeep ?? 0), 0) / 30;

    return {
      food, water, bedding, maintenance: maintenance + cageMaint,
      electricity, vet, biosecurity: biosec, tech: techUpkeep
    };
  }

  dailyTick() {
    const st = this.state;
    const c = this.dailyCosts();
    const total = Object.values(c).reduce((s, v) => s + v, 0);
    st.spend(Math.round(total), 'Günlük işletme gideri', 'operating');
    this.today = c;

    // Fiyat endeksleri normale döner
    this.foodPriceIndex += (1 - this.foodPriceIndex) * 0.02;
    this.energyPriceIndex += (1 - this.energyPriceIndex) * 0.02;

    if (st.money < -50000 && !st.gameOver) {
      this.bus.emit('economy:bankrupt');
    }
  }

  /** Stok hayvan satışı — refah ve statü fiyatı belirler */
  sellAnimals(animalIds, buyerLabel = 'Kurum dışı talep') {
    const st = this.state;
    let total = 0; let count = 0;
    for (const id of animalIds) {
      const a = st.animalById(id);
      if (!a || !a.alive || a.experimentalStatus !== 'stock') continue;
      total += a.marketValue();
      a.alive = false;
      a.causeOfDeath = 'devredildi';
      a.experimentalStatus = 'transferred';
      count += 1;
    }
    if (count === 0) return { ok: false, reason: 'Satılabilir stok hayvan yok.' };
    st.earn(Math.round(total), `${buyerLabel}: ${count} hayvan`, 'animal_sales');
    // Taşıma refah riski taşır (kayıt ve taşıma başlığı)
    st.adjust('animalWelfare', -1);
    st.addLog(`${count} hayvan devredildi. Gelir: ${Math.round(total)} ₺`);
    return { ok: true, amount: Math.round(total), count };
  }

  /** Tesis kullanım geliri — dış araştırmacılara alan/kafes kirası */
  facilityUsageIncome() {
    const st = this.state;
    if (!st.hasRoom('experimental')) return 0;
    const running = st.projects.filter((p) => p.status === 'running').length;
    const base = running * 260;
    const quality = 0.6 + (st.biosecurity / 100) * 0.4;
    return Math.round(base * quality);
  }

  weeklyTick() {
    const st = this.state;
    const usage = this.facilityUsageIncome() * 7;
    if (usage > 0) st.earn(usage, 'Tesis kullanım geliri', 'facility_usage');
  }
}
