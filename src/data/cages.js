/**
 * KAFES TEKNOLOJİLERİ
 * Bonuslar oyun dengesi değerleridir.
 */
export const CAGE_TYPES = {
  standard: {
    id: 'standard', name: 'Standart Kafes', cost: 900, maintenance: 6,
    capacity: 5, cleaningDifficulty: 1.0,
    welfareBonus: 0, biosecurityBonus: 0,
    requiresRoom: null,
    desc: 'Açık üst ızgaralı temel kafes. Ucuz, ama biyogüvenlik katkısı yok.'
  },
  improved: {
    id: 'improved', name: 'Geliştirilmiş Kafes', cost: 1800, maintenance: 10,
    capacity: 6, cleaningDifficulty: 1.1,
    welfareBonus: 6, biosecurityBonus: 3,
    requiresRoom: null,
    desc: 'Daha geniş taban alanı ve zenginleştirme yuvaları. Refahı artırır.'
  },
  microisolator: {
    id: 'microisolator', name: 'Mikroizolatör Kafes', cost: 3200, maintenance: 18,
    capacity: 5, cleaningDifficulty: 1.5,
    welfareBonus: 4, biosecurityBonus: 14,
    requiresRoom: null,
    desc: 'Filtreli kapaklı kafes. Mikrobiyolojik bariyer sağlar, temizliği zahmetlidir.'
  },
  ivc: {
    id: 'ivc', name: 'IVC (Bireysel Havalandırmalı)', cost: 6500, maintenance: 42,
    capacity: 6, cleaningDifficulty: 1.8,
    welfareBonus: 10, biosecurityBonus: 26,
    requiresRoom: 'ivc',
    desc: 'Her kafese ayrı filtrelenmiş hava. En yüksek biyogüvenlik, en yüksek maliyet. IVC Odası gerekir.'
  },
  metabolism: {
    id: 'metabolism', name: 'Metabolizma Kafesi', cost: 4200, maintenance: 26,
    capacity: 1, cleaningDifficulty: 2.0,
    welfareBonus: -12, biosecurityBonus: 6,
    requiresRoom: null,
    desc: 'İdrar/dışkı ayrı toplanır. Metabolik çalışmalar için gerekli; refah maliyeti yüksektir.'
  }
};

export const CAGE_LIST = Object.values(CAGE_TYPES);
export const getCageType = (id) => CAGE_TYPES[id];
