/**
 * ODA TİPLERİ
 * Sayısal değerler oyun dengesi içindir; teknik şartname değildir.
 * `tier`: 1 = başlangıç, 2 = ileri seviye (facilityLevel ile açılır)
 */
export const ROOM_TYPES = {
  administration: {
    id: 'administration', name: 'İdari Oda', tier: 1, cost: 22000, maintenanceCost: 90,
    size: [3, 3], color: 0xbfc8d4, capacity: 0,
    temperatureControl: 0.3, humidityControl: 0.2, ventilation: 0.3,
    hygiene: 0.4, biosecurity: 0.2, allowedSpecies: [],
    desc: 'Kayıt, evrak ve yönetim işleri. Etik kurul (HADYEK) kurulumu için gereklidir.'
  },
  staff: {
    id: 'staff', name: 'Personel Odası', tier: 1, cost: 16000, maintenanceCost: 70,
    size: [3, 2], color: 0xc9d6c4, capacity: 0,
    temperatureControl: 0.3, humidityControl: 0.2, ventilation: 0.3,
    hygiene: 0.4, biosecurity: 0.2, allowedSpecies: [],
    desc: 'Personelin dinlenme alanı. Personel moralini ve yorgunluk toparlanmasını iyileştirir.'
  },
  changing: {
    id: 'changing', name: 'Giyinme / Geçiş Odası', tier: 1, cost: 18000, maintenanceCost: 80,
    size: [2, 3], color: 0xd6cfc0, capacity: 0,
    temperatureControl: 0.3, humidityControl: 0.3, ventilation: 0.5,
    hygiene: 0.8, biosecurity: 0.8, allowedSpecies: [],
    desc: 'Temiz/kirli alan ayrımının kurulduğu geçiş bölgesi. Biyogüvenliğin temel taşıdır.'
  },
  animal: {
    id: 'animal', name: 'Hayvan Odası', tier: 1, cost: 45000, maintenanceCost: 260,
    size: [4, 4], color: 0xcfd9e6, capacity: 24, // kafes kapasitesi
    temperatureControl: 0.7, humidityControl: 0.6, ventilation: 0.6,
    hygiene: 0.6, biosecurity: 0.5, allowedSpecies: ['mouse', 'rat', 'gerbil', 'hamster'],
    desc: 'Kafeslerin ve kolonilerin barındırıldığı ana oda. Sıcaklık, nem ve havalandırma burada kritiktir.'
  },
  food_storage: {
    id: 'food_storage', name: 'Yem Deposu', tier: 1, cost: 20000, maintenanceCost: 100,
    size: [3, 2], color: 0xdcd0b0, capacity: 0,
    temperatureControl: 0.5, humidityControl: 0.6, ventilation: 0.5,
    hygiene: 0.6, biosecurity: 0.5, allowedSpecies: [],
    desc: 'Yem ve altlık deposu. Yem maliyetini düşürür, pest kontrolü açısından risk noktasıdır.'
  },
  cleaning: {
    id: 'cleaning', name: 'Temizlik / Yıkama Alanı', tier: 1, cost: 26000, maintenanceCost: 150,
    size: [3, 3], color: 0xc3d3d8, capacity: 0,
    temperatureControl: 0.3, humidityControl: 0.4, ventilation: 0.7,
    hygiene: 0.9, biosecurity: 0.7, allowedSpecies: [],
    desc: 'Kafes ve ekipman yıkama. Hijyen puanını ve temizlik kapasitesini belirgin biçimde artırır.'
  },
  quarantine: {
    id: 'quarantine', name: 'Karantina Odası', tier: 1, cost: 38000, maintenanceCost: 220,
    size: [3, 3], color: 0xe6d3c8, capacity: 8,
    temperatureControl: 0.7, humidityControl: 0.6, ventilation: 0.8,
    hygiene: 0.8, biosecurity: 0.95, allowedSpecies: ['mouse', 'rat', 'gerbil', 'hamster', 'guinea_pig', 'rabbit'],
    desc: 'Yeni gelen ya da şüpheli hayvanların ayrı tutulduğu oda. Salgın yönetiminin merkezi.'
  },
  utility: {
    id: 'utility', name: 'Teknik Oda', tier: 1, cost: 30000, maintenanceCost: 180,
    size: [3, 2], color: 0xb9b9c2, capacity: 0,
    temperatureControl: 0.9, humidityControl: 0.9, ventilation: 0.9,
    hygiene: 0.3, biosecurity: 0.4, allowedSpecies: [],
    desc: 'Havalandırma, iklimlendirme ve su sistemleri. Arıza olaylarının etkisini azaltır.'
  },

  // --- İleri seviye ---
  operation: {
    id: 'operation', name: 'Operasyon Odası', tier: 2, cost: 70000, maintenanceCost: 400,
    size: [3, 3], color: 0xc6dde0, capacity: 0,
    temperatureControl: 0.8, humidityControl: 0.7, ventilation: 0.9,
    hygiene: 0.95, biosecurity: 0.9, allowedSpecies: [],
    desc: 'Girişimsel işlemler için ayrılmış oda. Refinement (iyileştirme) kapasitesini yükseltir.'
  },
  experimental: {
    id: 'experimental', name: 'Deney Odası', tier: 2, cost: 60000, maintenanceCost: 350,
    size: [4, 3], color: 0xccd8e8, capacity: 6,
    temperatureControl: 0.8, humidityControl: 0.7, ventilation: 0.8,
    hygiene: 0.8, biosecurity: 0.8, allowedSpecies: ['mouse', 'rat', 'gerbil', 'hamster', 'guinea_pig', 'rabbit'],
    desc: 'Onaylı projelerin yürütüldüğü oda. Proje kapasitesini artırır.'
  },
  classroom: {
    id: 'classroom', name: 'Eğitim Sınıfı', tier: 2, cost: 48000, maintenanceCost: 200,
    size: [4, 3], color: 0xd9d2e6, capacity: 20,
    temperatureControl: 0.4, humidityControl: 0.3, ventilation: 0.5,
    hygiene: 0.5, biosecurity: 0.3, allowedSpecies: [],
    desc: 'Deney hayvanları kullanım sertifika programının teorik derslerinin verildiği sınıf.'
  },
  genetics: {
    id: 'genetics', name: 'Genetik Laboratuvarı', tier: 2, cost: 120000, maintenanceCost: 700,
    size: [4, 3], color: 0xcfe2d4, capacity: 0,
    temperatureControl: 0.8, humidityControl: 0.8, ventilation: 0.9,
    hygiene: 0.9, biosecurity: 0.9, allowedSpecies: [],
    desc: 'Genotiplendirme ve genetiği değiştirilmiş hat yönetimi. Genetik teknoloji ağacını açar.'
  },
  ivc: {
    id: 'ivc', name: 'IVC Odası', tier: 2, cost: 140000, maintenanceCost: 900,
    size: [4, 4], color: 0xc4d6ea, capacity: 40,
    temperatureControl: 0.95, humidityControl: 0.9, ventilation: 0.98,
    hygiene: 0.9, biosecurity: 0.95, allowedSpecies: ['mouse', 'rat'],
    desc: 'Bireysel havalandırmalı kafes (IVC) sistemleri için hazırlanmış oda. SPF için önkoşuldur.'
  },
  specialized: {
    id: 'specialized', name: 'Özel Hayvan Odası', tier: 2, cost: 95000, maintenanceCost: 560,
    size: [4, 3], color: 0xe2dcc8, capacity: 12,
    temperatureControl: 0.9, humidityControl: 0.85, ventilation: 0.85,
    hygiene: 0.85, biosecurity: 0.85, allowedSpecies: ['guinea_pig', 'rabbit', 'mouse', 'rat'],
    desc: 'Kobay, tavşan ve özel hatlar için ayrılmış oda. Büyük türleri barındırabilir.'
  }
};

export const ROOM_LIST = Object.values(ROOM_TYPES);
export const getRoomType = (id) => ROOM_TYPES[id];
