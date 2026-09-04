/**
 * TEKNOLOJİ AĞACI
 * Koloni statüsü, IVC, genetik birim ve SPF/germ-free basamakları.
 */
export const TECH = {
  standard_colony: {
    id: 'standard_colony', name: 'Standart Koloni', cost: 0,
    requires: [], requiresRoom: null, upkeep: 0,
    effects: {},
    desc: 'Konvansiyonel barındırma. Başlangıç durumu.'
  },
  ivc_system: {
    id: 'ivc_system', name: 'IVC Sistemi', cost: 60000,
    requires: ['standard_colony'], requiresRoom: 'ivc', upkeep: 300,
    effects: { biosecurity: 8 },
    desc: 'Bireysel havalandırmalı kafes altyapısı. IVC kafeslerinin kullanımını açar.'
  },
  spf_facility: {
    id: 'spf_facility', name: 'SPF Tesisi', cost: 220000,
    requires: ['ivc_system'], requiresRoom: 'ivc', upkeep: 1400,
    effects: { biosecurity: 18, scientificReputation: 8 },
    setsColonyStatus: 'spf',
    desc: 'Belirli patojenlerden ari (SPF) koloni. Yüksek yatırım ve yüksek işletme maliyeti; hayvan satış değerini yükseltir.'
  },
  germ_free: {
    id: 'germ_free', name: 'Germ-Free Ünitesi', cost: 420000,
    requires: ['spf_facility'], requiresRoom: 'ivc', upkeep: 3200,
    effects: { biosecurity: 24, scientificReputation: 14 },
    setsColonyStatus: 'germ_free',
    desc: 'İzolatör temelli germ-free barındırma. En yüksek bilimsel değer, en yüksek risk ve maliyet.'
  },
  genetics_unit: {
    id: 'genetics_unit', name: 'Genetik Birim', cost: 90000,
    requires: [], requiresRoom: 'genetics', upkeep: 600,
    effects: { scientificReputation: 6 },
    desc: 'Genotiplendirme ve genetiği değiştirilmiş hat yönetimini açar.'
  },
  transgenic: {
    id: 'transgenic', name: 'Transgenik Hat Üretimi', cost: 130000,
    requires: ['genetics_unit'], requiresRoom: 'genetics', upkeep: 500,
    effects: { scientificReputation: 8 },
    desc: 'Transgenik hatların üretimi ve idamesi (oyun içinde stratejik/soyut modellenir).'
  },
  knockout: {
    id: 'knockout', name: 'Knockout Hat', cost: 160000,
    requires: ['transgenic'], requiresRoom: 'genetics', upkeep: 650,
    effects: { scientificReputation: 10 },
    desc: 'Hedef genin işlevini kaybettiği hatlar. Yüksek katma değer, yüksek bakım ihtiyacı.'
  },
  knockin: {
    id: 'knockin', name: 'Knockin Hat', cost: 190000,
    requires: ['knockout'], requiresRoom: 'genetics', upkeep: 750,
    effects: { scientificReputation: 12 },
    desc: 'Hedeflenmiş dizi eklenmiş hatlar. En değerli özel modeller.'
  }
};

export const TECH_LIST = Object.values(TECH);
