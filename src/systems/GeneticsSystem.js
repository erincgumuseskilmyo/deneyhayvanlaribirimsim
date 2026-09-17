import { clamp } from '../core/utils.js';
import { TECH } from '../data/tech.js';

/**
 * GENETİK SİSTEM
 * DİKKAT: Bu sistem gerçek bir laboratuvar protokolü öğretmez.
 * Hat kurma, genotiplendirme ve idame maliyetleri stratejik/soyut modellenmiştir.
 */
export class GeneticsSystem {
  constructor(bus, state, rng) {
    this.bus = bus;
    this.state = state;
    this.rng = rng;
    this.genotypingBacklog = 0;
  }

  availableLines() {
    const st = this.state;
    const lines = [];
    if (st.unlockedTech.has('transgenic')) lines.push('transgenic');
    if (st.unlockedTech.has('knockout')) lines.push('knockout');
    if (st.unlockedTech.has('knockin')) lines.push('knockin');
    return lines;
  }

  /** Bir kafesteki hayvanları belirli bir hatta dönüştürerek yeni hat kurar (soyut). */
  establishLine(cageId, lineType) {
    const st = this.state;
    if (!this.availableLines().includes(lineType)) {
      return { ok: false, reason: 'Bu hat için gerekli teknoloji açık değil.' };
    }
    if (!st.hasRoom('genetics')) return { ok: false, reason: 'Genetik Laboratuvarı gerekli.' };
    const animals = st.animalsInCage(cageId).filter((a) => a.experimentalStatus === 'stock');
    if (!animals.length) return { ok: false, reason: 'Kafeste uygun stok hayvan yok.' };

    const cost = { transgenic: 45000, knockout: 70000, knockin: 95000 }[lineType];
    if (!st.canAfford(cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    st.spend(cost, `${TECH[lineType].name} hat kurulumu`, 'genetics');

    // Başarı olasılığı, tesis kalitesine bağlıdır
    const successRate = clamp(0.35 + st.biosecurity / 250 + st.scientificReputation / 300, 0.2, 0.85);
    let converted = 0;
    for (const a of animals) {
      if (this.rng.chance(successRate)) { a.genetics = lineType; converted += 1; }
    }
    this.genotypingBacklog += animals.length;

    if (converted === 0) {
      st.adjust('scientificReputation', -2);
      return { ok: true, converted: 0, message: 'Hat kurulumu bu denemede başarısız oldu.' };
    }
    st.adjust('scientificReputation', 4);
    st.addLog(`${TECH[lineType].name}: ${converted} birey ile hat kuruldu.`, 'good');
    return { ok: true, converted, message: `${converted} birey hatta dahil edildi.` };
  }

  /** Genotiplendirme — kayıt doğruluğunu ve satış değerini korur */
  runGenotyping() {
    const st = this.state;
    if (!st.hasRoom('genetics')) return { ok: false, reason: 'Genetik Laboratuvarı gerekli.' };
    if (this.genotypingBacklog <= 0) return { ok: false, reason: 'Bekleyen örnek yok.' };
    const cost = this.genotypingBacklog * 140;
    if (!st.canAfford(cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    st.spend(cost, 'Genotiplendirme', 'genetics');
    const n = this.genotypingBacklog;
    this.genotypingBacklog = 0;
    st.adjust('scientificReputation', 3);
    st.addLog(`${n} örnek genotiplendirildi.`, 'good');
    return { ok: true, count: n, cost };
  }

  dailyTick() {
    const st = this.state;
    const gm = st.livingAnimals.filter((a) => a.genetics !== 'wildtype');
    if (!gm.length) return;

    // GD hatların ek idame maliyeti
    const upkeep = gm.length * 1.8;
    st.spend(Math.round(upkeep), 'GD hat idamesi', 'genetics');

    // Genotiplendirme birikirse kayıt güvenilirliği düşer
    if (this.genotypingBacklog > 60) {
      st.adjust('scientificReputation', -0.05);
      if (st.day % 10 === 0) {
        this.bus.emit('notify', {
          text: 'Genotiplendirme birikmiş durumda — kayıt güvenilirliği düşüyor.', level: 'warn'
        });
      }
    }
    // Yeni doğan GD bireyler örnek kuyruğuna eklenir
    this.genotypingBacklog += gm.filter((a) => a.age === 21).length;
  }
}
