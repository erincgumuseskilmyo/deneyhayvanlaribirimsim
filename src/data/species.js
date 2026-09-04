/**
 * TÜR VERİLERİ
 *
 * ÖNEMLİ AYRIM:
 *  - `facts`  : genel laboratuvar hayvanı literatüründe yaygın olarak bilinen,
 *               kaynak kitapla doğrulanması gereken bilgiler. Oyun içinde
 *               "kaynak doğrulaması bekliyor" etiketiyle gösterilir.
 *  - diğer sayısal alanlar : OYUN DENGESİ için seçilmiş soyut değerlerdir.
 *               Bilimsel referans değeri DEĞİLDİR.
 */

export const SPECIES = {
  mouse: {
    id: 'mouse',
    name: 'Fare',
    latin: 'Mus musculus',
    color: 0xdcd6cc,
    scale: 0.26,
    unlockCost: 0,
    unlockRequirement: null,
    // --- Oyun dengesi parametreleri (soyut) ---
    lifespanDays: 720,
    maturityDays: 50,
    gestationDays: 20,
    litterSizeRange: [4, 10],
    weaningDays: 21,
    dailyFoodCost: 0.35,
    dailyWaterCost: 0.05,
    salePrice: 180,
    perCageCapacity: 5,
    stressSensitivity: 1.0,
    tempOptimum: [20, 24],
    humidityOptimum: [45, 65],
    facts: [
      'Fare, biyomedikal araştırmalarda en yaygın kullanılan laboratuvar hayvanı türlerinden biridir.',
      'Genetiği değiştirilmiş model üretimi ağırlıklı olarak fare üzerinde geliştirilmiştir.'
    ]
  },

  rat: {
    id: 'rat',
    name: 'Sıçan',
    latin: 'Rattus norvegicus',
    color: 0xc9bfb3,
    scale: 0.36,
    unlockCost: 40000,
    unlockRequirement: { facilityLevel: 2 },
    lifespanDays: 1000,
    maturityDays: 65,
    gestationDays: 22,
    litterSizeRange: [6, 12],
    weaningDays: 21,
    dailyFoodCost: 0.7,
    dailyWaterCost: 0.1,
    salePrice: 260,
    perCageCapacity: 3,
    stressSensitivity: 0.9,
    tempOptimum: [20, 24],
    humidityOptimum: [45, 65],
    facts: [
      'Sıçan, fareye göre daha büyük bir kemirgendir; davranış ve fizyoloji çalışmalarında sık kullanılır.',
      'Vücut büyüklüğü nedeniyle fareye göre daha geniş kafes alanı gerektirir.'
    ]
  },

  guinea_pig: {
    id: 'guinea_pig',
    name: 'Kobay',
    latin: 'Cavia porcellus',
    color: 0xd8c0a8,
    scale: 0.45,
    unlockCost: 55000,
    unlockRequirement: { facilityLevel: 2 },
    lifespanDays: 1800,
    maturityDays: 90,
    gestationDays: 66,
    litterSizeRange: [1, 4],
    weaningDays: 21,
    dailyFoodCost: 1.2,
    dailyWaterCost: 0.2,
    salePrice: 520,
    perCageCapacity: 2,
    stressSensitivity: 1.2,
    tempOptimum: [18, 22],
    humidityOptimum: [45, 65],
    facts: [
      'Kobay, C vitaminini kendi sentezleyemeyen türlerdendir; beslenmesinde bu husus önem taşır.',
      'Gebelik süresi kemirgenler arasında uzun sayılır ve yavrular görece gelişmiş doğar.'
    ]
  },

  gerbil: {
    id: 'gerbil',
    name: 'Gerbil',
    latin: 'Meriones unguiculatus',
    color: 0xd0b48c,
    scale: 0.3,
    unlockCost: 45000,
    unlockRequirement: { facilityLevel: 2 },
    lifespanDays: 1100,
    maturityDays: 70,
    gestationDays: 25,
    litterSizeRange: [3, 7],
    weaningDays: 24,
    dailyFoodCost: 0.5,
    dailyWaterCost: 0.04,
    salePrice: 340,
    perCageCapacity: 4,
    stressSensitivity: 1.1,
    tempOptimum: [20, 24],
    humidityOptimum: [35, 55],
    facts: [
      'Gerbil, kurak bölge kökenli bir kemirgendir; barındırma koşullarında düşük nem tercih edilir.',
      'Kazma davranışı belirgindir; altlık derinliği zenginleştirme açısından önemlidir.'
    ]
  },

  hamster: {
    id: 'hamster',
    name: 'Hamster',
    latin: 'Mesocricetus auratus',
    color: 0xe0c39a,
    scale: 0.31,
    unlockCost: 45000,
    unlockRequirement: { facilityLevel: 2 },
    lifespanDays: 900,
    maturityDays: 60,
    gestationDays: 16,
    litterSizeRange: [4, 9],
    weaningDays: 21,
    dailyFoodCost: 0.55,
    dailyWaterCost: 0.05,
    salePrice: 330,
    perCageCapacity: 1, // yetişkinlerde bireysel barındırma eğilimi
    stressSensitivity: 1.3,
    tempOptimum: [20, 24],
    humidityOptimum: [40, 60],
    facts: [
      'Hamsterlarda yetişkin bireyler arasında saldırganlık görülebildiğinden barındırma planı buna göre yapılır.',
      'Yanak keseleri ve depolama davranışı türe özgü davranışsal ihtiyaçlar arasındadır.'
    ]
  },

  rabbit: {
    id: 'rabbit',
    name: 'Tavşan',
    latin: 'Oryctolagus cuniculus',
    color: 0xe8e2da,
    scale: 0.6,
    unlockCost: 90000,
    unlockRequirement: { facilityLevel: 3 },
    lifespanDays: 2900,
    maturityDays: 150,
    gestationDays: 31,
    litterSizeRange: [4, 9],
    weaningDays: 35,
    dailyFoodCost: 2.4,
    dailyWaterCost: 0.5,
    salePrice: 1100,
    perCageCapacity: 1,
    stressSensitivity: 1.4,
    tempOptimum: [16, 20],
    humidityOptimum: [45, 65],
    facts: [
      'Tavşan kemirgen değildir (Lagomorpha); barındırma ve beslenme ihtiyaçları kemirgenlerden farklıdır.',
      'Sıcaklık toleransı kemirgenlere göre daha düşüktür; serin ortam tercih edilir.'
    ]
  }
};

export const SPECIES_LIST = Object.values(SPECIES);
export const getSpecies = (id) => SPECIES[id];
