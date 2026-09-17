import { clamp } from '../core/utils.js';

/**
 * PUANLAMA VE OYUN SONU
 * Beş boyut: Economic, Welfare, Ethics, Biosecurity, Scientific Reputation.
 * Ağırlıklar oyun tasarımı kararıdır — para tek başına yeterli değildir.
 */
export const SCORE_WEIGHTS = {
  economic: 0.2,
  welfare: 0.25,
  ethics: 0.25,
  biosecurity: 0.15,
  reputation: 0.15
};

export class ScoringSystem {
  constructor(state) {
    this.state = state;
    this.welfareSamples = [];
    this.ethicsSamples = [];
  }

  /** Her gün örnekleme: anlık değil, süreç boyunca ortalama önemlidir */
  dailyTick() {
    const st = this.state;
    this.welfareSamples.push(st.animalWelfare);
    this.ethicsSamples.push(st.ethics);
    if (this.welfareSamples.length > 3600) this.welfareSamples.shift();
    if (this.ethicsSamples.length > 3600) this.ethicsSamples.shift();
  }

  economicScore() {
    const st = this.state;
    // 0 ₺ -> 0 puan, 1.000.000 ₺ -> 100 puan (logaritmik yumuşatma)
    const cash = Math.max(0, st.money);
    const assets = st.rooms.reduce((s, r) => s + r.def.cost, 0) * 0.5 +
                   st.cages.reduce((s, c) => s + c.def.cost, 0) * 0.4;
    const net = cash + assets;
    return clamp(Math.log10(Math.max(1, net / 1000)) * 33);
  }

  breakdown() {
    const st = this.state;
    const meanWelfare = this.welfareSamples.length
      ? this.welfareSamples.reduce((a, b) => a + b, 0) / this.welfareSamples.length
      : st.animalWelfare;
    const meanEthics = this.ethicsSamples.length
      ? this.ethicsSamples.reduce((a, b) => a + b, 0) / this.ethicsSamples.length
      : st.ethics;

    return {
      economic: clamp(this.economicScore()),
      welfare: clamp(meanWelfare),
      ethics: clamp(meanEthics),
      biosecurity: clamp(st.biosecurity),
      reputation: clamp(st.scientificReputation)
    };
  }

  totalScore() {
    const b = this.breakdown();
    return Object.entries(SCORE_WEIGHTS).reduce((s, [k, w]) => s + b[k] * w, 0);
  }

  grade() {
    const t = this.totalScore();
    if (t >= 85) return 'S';
    if (t >= 72) return 'A';
    if (t >= 58) return 'B';
    if (t >= 44) return 'C';
    return 'D';
  }

  /** Oyun sonu değerlendirmesi + eğitsel geri bildirim */
  finalReport() {
    const b = this.breakdown();
    const total = this.totalScore();
    const grade = this.grade();
    const advice = [];

    if (b.welfare < 55) advice.push('Hayvan refahı düşük kaldı. Kafes yoğunluğu, zenginleştirme ve temizlik sıklığını gözden geçirin.');
    if (b.ethics < 55) advice.push('Etik puanı düşük. Etik kurul kararlarında 3R ilkelerini daha tutarlı uygulayın.');
    if (b.biosecurity < 55) advice.push('Biyogüvenlik zayıf. Giyinme odası, karantina ve pest kontrolü yatırımlarını artırın.');
    if (b.reputation < 50) advice.push('Bilimsel itibar sınırlı. Kaliteli proje tamamlama ve sertifika programları itibarı yükseltir.');
    if (b.economic < 50) advice.push('Ekonomik sürdürülebilirlik zayıf. Gider kalemlerini ve gelir kaynaklarını dengeleyin.');
    if (!advice.length) advice.push('Beş boyutu birlikte dengelemeyi başardınız. Simülasyonun hedefi tam olarak budur.');

    return { breakdown: b, total, grade, advice, weights: SCORE_WEIGHTS };
  }
}
