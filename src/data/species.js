/**
 * TÜR VERİLERİ
 *
 * Kaynak: "Laboratuvar Hayvanları Yetiştirme ve Sağlığı",
 * Anadolu Üniversitesi AÖF Yayını No: 2460, 2019.
 *
 * ALAN KAYNAKLARI:
 *  - `book`  ile işaretli alanlar doğrudan kaynak kitaptan alınmıştır (`ref` bkz.).
 *  - `game`  ile işaretli alanlar yalnızca oyun dengesi içindir; kitapta karşılığı
 *            yoktur ve bilimsel değer olarak sunulmaz.
 *
 * Kafes ölçüleri Bölüm 3, Tablo 3.2-3.7'den alınmıştır. Kapasite artık sabit bir
 * sayı değildir: kafesin taban alanı, hayvanın canlı ağırlığına düşen taban alanına
 * bölünerek hesaplanır (bkz. capacityFor()).
 */

export const SPECIES = {
  mouse: {
    id: 'mouse',
    name: 'Fare',
    latin: 'Mus musculus',
    // Albino (beyaz) fare. Kitap, hayvan deneylerinde çoğunlukla albino
    // bireylerin tercih edildiğine dikkat çeker (Bölüm 5, s. 107).
    // Harici GLB modeliyle aynı ton, modelsiz oynanışta da tutarlı görünsün.
    color: 0xf2efe9,
    scale: 0.26,

    // --- Kitaptan (Bölüm 5, s. 96) ---
    maturityDays: 52,            // 7-8 hafta
    maturityText: '7-8 hafta',
    gestationDays: 20,           // 19-21 gün
    gestationText: '19-21 gün',
    litterSizeRange: [6, 12],    // bir seferde 6-12 yavru
    weaningDays: 21,             // 21. günden itibaren ayrılır
    estrusCycleDays: [4, 5],

    // --- Kitaptan (Bölüm 3, s. 47-48, Tablo 3.1) ---
    tempOptimum: [20, 24],
    humidityOptimum: [45, 65],

    // --- Kitaptan (Bölüm 3, Tablo 3.2) ---
    housing: {
      minCompartmentArea: 330,   // cm²
      minHeight: 12,             // cm
      // canlı ağırlığa (gr) göre hayvan başına taban alanı (cm²)
      areaPerAnimal: [
        { maxWeight: 20, area: 60 },
        { maxWeight: 25, area: 70 },
        { maxWeight: 30, area: 80 },
        { maxWeight: Infinity, area: 100 }
      ]
    },

    // --- Oyun dengesi (kitapta yoktur) ---
    lifespanDays: 720,
    adultWeight: 28,
    birthWeight: 1.5,
    dailyFoodCost: 0.35,
    dailyWaterCost: 0.05,
    salePrice: 180,
    stressSensitivity: 1.0,
    unlockCost: 0,
    unlockRequirement: null,

    facts: [
      { text: 'Fareler 7-8 haftalıkken erginliğe erişir; hamilelik süresi 19-21 gün olup bir seferde 6-12 yavru verebilirler.', ref: 'Bölüm 5, s. 96' },
      { text: 'Yavrular tüysüz, gözleri ve kulakları kapalı doğar; 14. günde gözlerini açar, 21. günden itibaren annelerinden ayrılır.', ref: 'Bölüm 5, s. 96' },
      { text: 'Üreme dönemlerinde Bruce, Whitten ve Lee-Boot etkileri görülür.', ref: 'Bölüm 5, s. 110' },
      { text: 'Fareler yüksek sıcaklıkları tolere edemezler; sindirim sistemlerinde apandis, lenf sisteminde bademcik bulunmaz.', ref: 'Bölüm 5, s. 110' }
    ]
  },

  rat: {
    id: 'rat',
    name: 'Sıçan',
    latin: 'Rattus norvegicus',
    color: 0xc9bfb3,
    scale: 0.36,

    maturityDays: 70,            // tam sperm üretimi ~70. gün
    maturityText: 'yaklaşık 70. gün',
    gestationDays: 22,           // 21-23 gün
    gestationText: '21-23 gün',
    litterSizeRange: [8, 16],
    weaningDays: 21,
    estrusCycleDays: [4, 5],

    tempOptimum: [20, 24],
    humidityOptimum: [45, 65],

    housing: {                   // Tablo 3.3
      minCompartmentArea: 800,
      minHeight: 18,
      areaPerAnimal: [
        { maxWeight: 200, area: 200 },
        { maxWeight: 300, area: 250 },
        { maxWeight: 400, area: 350 },
        { maxWeight: 600, area: 450 },
        { maxWeight: Infinity, area: 600 }
      ]
    },

    lifespanDays: 1000,
    adultWeight: 320,
    birthWeight: 5,
    dailyFoodCost: 0.7,
    dailyWaterCost: 0.1,
    salePrice: 260,
    stressSensitivity: 0.9,
    unlockCost: 40000,
    unlockRequirement: { facilityLevel: 2 },

    facts: [
      { text: 'Sıçanlarda gebelik süresi 21-23 gündür ve genellikle 8-16 arasında yavru verirler.', ref: 'Bölüm 5, s. 105-106' },
      { text: 'Çiftleşme sonrası dişiler ayrı kafeslere alınmalıdır; yavrular doğduktan sonra kafeste kalan erkek sıçan yavruları yiyebilir.', ref: 'Bölüm 5, s. 105' },
      { text: 'Ortam neminin düşük olması yavru sıçanlarda "ring-tail" oluşumuna yol açar.', ref: 'Bölüm 3, s. 48' },
      { text: 'Ultrasonik seslerle iletişim kurarlar: stres ve kaçma durumunda 22 kHz, yalnız kalan yavrular 40 kHz, olumlu durumda 50 kHz.', ref: 'Bölüm 5, s. 106' }
    ]
  },

  guinea_pig: {
    id: 'guinea_pig',
    name: 'Kobay',
    latin: 'Cavia porcellus',
    color: 0xd8c0a8,
    scale: 0.45,

    maturityDays: 60,
    maturityText: '30 günlük dişilerde östrus görülebilir',
    gestationDays: 65,           // 59-72 gün (ortalama 9 hafta)
    gestationText: '59-72 gün (ort. 9 hafta)',
    litterSizeRange: [2, 5],
    weaningDays: 21,             // kitapta net gün verilmez — oyun değeri
    weaningSource: 'game',
    estrusCycleDays: [15, 17],

    tempOptimum: [20, 24],
    humidityOptimum: [45, 65],

    housing: {                   // Tablo 3.6
      minCompartmentArea: 1800,
      minHeight: 23,
      areaPerAnimal: [
        { maxWeight: 200, area: 200 },
        { maxWeight: 300, area: 350 },
        { maxWeight: 450, area: 500 },
        { maxWeight: 700, area: 700 },
        { maxWeight: Infinity, area: 900 }
      ]
    },

    lifespanDays: 1800,
    adultWeight: 850,
    birthWeight: 90,
    dailyFoodCost: 1.2,
    dailyWaterCost: 0.2,
    salePrice: 520,
    stressSensitivity: 1.2,
    unlockCost: 55000,
    unlockRequirement: { facilityLevel: 2 },

    facts: [
      { text: 'Kobayların gebelik süreleri 59-72 gün (ortalama 9 hafta), östrus döngüleri 15-17 gündür; bu süreler diğer laboratuvar hayvanlarına göre daha uzundur.', ref: 'Bölüm 6, s. 119' },
      { text: 'Her doğumda ortalama yavru sayısı 2 ile 5 arasında değişir.', ref: 'Bölüm 6, s. 119' },
      { text: '2-3 günlük kobay yavrularının anne sütüne ek olarak katı yem ve su alması sağlanmalıdır.', ref: 'Bölüm 6, s. 119' },
      { text: 'Tel örgü tabanlı kafesler yavruların bacaklarının kırılmasına sebep olabileceği için tehlikelidir.', ref: 'Bölüm 6, s. 120' }
    ]
  },

  gerbil: {
    id: 'gerbil',
    name: 'Gerbil',
    latin: 'Meriones unguiculatus',
    color: 0xd0b48c,
    scale: 0.3,

    maturityDays: 70,
    maturityText: 'oyun değeri',
    maturitySource: 'game',
    gestationDays: 22,           // 21-24 gün
    gestationText: '21-24 gün',
    litterSizeRange: [4, 6],
    weaningDays: 25,             // kitapta 20-30 gün aralığı verilir
    estrusCycleDays: [4, 6],

    tempOptimum: [20, 24],
    humidityOptimum: [45, 65],

    housing: {                   // Tablo 3.4
      minCompartmentArea: 1200,
      minHeight: 18,
      areaPerAnimal: [{ maxWeight: Infinity, area: 150 }]
    },

    lifespanDays: 1100,
    adultWeight: 75,
    birthWeight: 3,
    dailyFoodCost: 0.5,
    dailyWaterCost: 0.04,
    salePrice: 340,
    stressSensitivity: 1.1,
    unlockCost: 45000,
    unlockRequirement: { facilityLevel: 2 },

    facts: [
      { text: 'Gerbillerde östrus döngüsü 4-6 gün, gebelik süresi 21-24 gündür; bir doğumda 4-6 kadar yavru meydana gelir.', ref: 'Bölüm 6, s. 122-123' },
      { text: 'Yavruların kulakları 3-7 günlükken, gözleri ise 15. günde açılır.', ref: 'Bölüm 6, s. 121' },
      { text: 'Ergin tek bir gerbil için kafes alanı en az 200 cm², damızlık bir çift için en az 700 cm², yavrularıyla birlikte 1300 cm² olmalıdır.', ref: 'Bölüm 6, s. 123' },
      { text: 'Erkek ve dişi gerbiller aynı kafeste barındırılacaksa sabah saatlerinde bir araya getirilmeli, aşırı saldırganlık görülürse çiftler ayrılmalıdır.', ref: 'Bölüm 6, s. 123' }
    ]
  },

  hamster: {
    id: 'hamster',
    name: 'Hamster',
    latin: 'Mesocricetus auratus',
    color: 0xe0c39a,
    scale: 0.31,

    maturityDays: 60,
    maturityText: 'oyun değeri',
    maturitySource: 'game',
    gestationDays: 16,
    gestationText: '16 gün',
    litterSizeRange: [6, 8],
    weaningDays: 21,             // 20-22 gün
    estrusCycleDays: [4, 4],

    tempOptimum: [20, 24],
    humidityOptimum: [45, 65],

    housing: {                   // Tablo 3.5
      minCompartmentArea: 800,
      minHeight: 14,
      areaPerAnimal: [
        { maxWeight: 60, area: 150 },
        { maxWeight: 100, area: 200 },
        { maxWeight: Infinity, area: 250 }
      ]
    },

    lifespanDays: 900,
    adultWeight: 120,
    birthWeight: 2.5,
    dailyFoodCost: 0.55,
    dailyWaterCost: 0.05,
    salePrice: 330,
    stressSensitivity: 1.3,
    unlockCost: 45000,
    unlockRequirement: { facilityLevel: 2 },

    facts: [
      { text: 'Hamsterlerin dişilerinde östrus döngüsü 4 gün, gebelik süreleri ise 16 gündür; bir doğumda ortalama 6-8 yavru meydana gelir.', ref: 'Bölüm 6, s. 124-125' },
      { text: 'Yavrular 20-22 günlük sütten kesilme süresi sonuna kadar anneleriyle aynı kafesi paylaşır.', ref: 'Bölüm 6, s. 125' },
      { text: 'Gebelik sürelerinin kısa olması teratojenik çalışmalarda tercih edilme nedenlerindendir.', ref: 'Bölüm 6, s. 124' },
      { text: 'Ergin bir hamster için ortalama 65-80 cm²’den az olmayacak biçimde bireysel barınma alanı oluşturulmalıdır.', ref: 'Bölüm 6, s. 125' }
    ]
  },

  rabbit: {
    id: 'rabbit',
    name: 'Tavşan',
    latin: 'Oryctolagus cuniculus',
    color: 0xe8e2da,
    scale: 0.6,

    maturityDays: 150,
    maturityText: 'oyun değeri',
    maturitySource: 'game',
    gestationDays: 31,           // 31-32 gün
    gestationText: '31-32 gün',
    litterSizeRange: [7, 8],
    weaningDays: 49,             // 6-8 hafta / 1,5-2 ay
    estrusCycleDays: null,

    tempOptimum: [11, 21],       // Tablo 3.1
    humidityOptimum: [45, 75],   // Tablo 3.1: "en az %45"
    humidityNote: 'Kitapta tavşan için "en az %45" denmektedir; üst sınır oyun değeridir.',

    housing: {                   // Tablo 3.7 — 10 haftalıktan büyük tavşanlar
      minCompartmentArea: 3500,
      minHeight: 45,
      // "bir veya iki adet sosyal uyumlu hayvan için minimum taban alanı"
      areaPerPair: [
        { maxWeightKg: 3, area: 3500, height: 45 },
        { maxWeightKg: 5, area: 4200, height: 45 },
        { maxWeightKg: Infinity, area: 5400, height: 60 }
      ],
      areaPerAnimal: [{ maxWeight: Infinity, area: 1750 }]
    },

    lifespanDays: 2900,
    adultWeight: 3200,
    birthWeight: 60,
    dailyFoodCost: 2.4,
    dailyWaterCost: 0.5,
    salePrice: 1100,
    stressSensitivity: 1.4,
    unlockCost: 90000,
    unlockRequirement: { facilityLevel: 3 },

    facts: [
      { text: 'Gebelik süresi 31-32 gün olan tavşanlar yılda 6-9 kez doğum yapabilir ve her doğumda 7 ya da 8 yavru meydana getirebilir.', ref: 'Bölüm 6, s. 128' },
      { text: 'Yeni doğan yavrular 6-8 haftalık (1,5-2 aylık) olduklarında sütten kesilirler.', ref: 'Bölüm 6, s. 128' },
      { text: 'Tavşan yavruları 10-12 haftalık oluncaya kadar cinsiyet belirlenerek birbirlerinden ayrılmalıdır; bu yaştaki erkekler bir arada olduklarında ciddi yaralanmalara neden olabilir.', ref: 'Bölüm 6, s. 128' },
      { text: 'Tavşanlar için ortam sıcaklığı 11-21 °C, nem en az %45 olarak verilmiştir.', ref: 'Bölüm 3, Tablo 3.1' }
    ]
  }
};

export const SPECIES_LIST = Object.values(SPECIES);
export const getSpecies = (id) => SPECIES[id];

/** Canlı ağırlığa (gr) göre hayvan başına gereken taban alanı (cm²) — Tablo 3.2-3.7 */
export function areaPerAnimal(speciesId, weightGr) {
  const sp = SPECIES[speciesId];
  if (!sp) return 100;
  for (const row of sp.housing.areaPerAnimal) {
    if (weightGr <= row.maxWeight) return row.area;
  }
  return sp.housing.areaPerAnimal.at(-1).area;
}

/**
 * Bir kafesin belirli bir tür ve ortalama ağırlık için alabileceği hayvan sayısı.
 * Kitaptaki iki koşul birlikte uygulanır:
 *   1) kafesin taban alanı, türün minimum bölme büyüklüğünden küçük olamaz,
 *   2) hayvan sayısı = taban alanı / hayvan başına taban alanı.
 */
export function capacityFor(speciesId, cageFloorArea, cageHeight, weightGr) {
  const sp = SPECIES[speciesId];
  if (!sp) return 0;
  const h = sp.housing;
  if (cageFloorArea < h.minCompartmentArea) return 0;
  if (cageHeight < h.minHeight) return 0;
  return Math.max(0, Math.floor(cageFloorArea / areaPerAnimal(speciesId, weightGr)));
}
