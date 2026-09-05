/**
 * ODA TİPLERİ
 *
 * Kaynak: Bölüm 3, s. 45-53 — "Deney hayvanı üretim, bakım ve barındırma
 * ruhsatına sahip bir tesiste bulunması gereken özel işlevli odalar" beş grupta
 * toplanır: idari birim/personel hizmet odaları, sistem kontrol odaları,
 * servis alanları, üretim ve barındırma odaları, operasyon odaları.
 * Ayrıca Bölüm 8, s. 175'te barınakta bulunması gereken bölümler listelenir.
 *
 * `group` alanı odanın kitaptaki hangi gruba ait olduğunu gösterir.
 * Maliyet, kapasite ve 0-1 arası kontrol katsayıları OYUN DEĞERİDİR.
 */
export const ROOM_GROUPS = {
  admin: 'İdari birim / personel hizmet odaları',
  system: 'Sistem kontrol odaları',
  service: 'Servis alanları',
  housing: 'Üretim ve barındırma odaları',
  operation: 'Operasyon odaları'
};

export const ROOM_TYPES = {
  // ---- İdari birim / personel hizmet odaları (s. 46-47) ----
  administration: {
    id: 'administration', name: 'İdari Birim', group: 'admin', tier: 1,
    cost: 22000, maintenanceCost: 90, size: [3, 3], color: 0xbfc8d4, capacity: 0,
    temperatureControl: 0.3, humidityControl: 0.2, ventilation: 0.3,
    hygiene: 0.4, biosecurity: 0.2, allowedSpecies: [],
    desc:
      'Sorumlu yönetici, sorumlu veteriner hekim ve hayvan teknikeri odaları ile eğitim ve ' +
      'toplantı odasını barındırır. Sorumlu veteriner hekim; tür, ırk, genetik ve ' +
      'mikrobiyolojik tanımlamaları yaparak aylık ve yıllık hayvan kayıtlarını tutar.',
    ref: 'Bölüm 3, s. 46'
  },
  staff: {
    id: 'staff', name: 'Personel Dinlenme Odası', group: 'admin', tier: 1,
    cost: 16000, maintenanceCost: 70, size: [3, 2], color: 0xc9d6c4, capacity: 0,
    temperatureControl: 0.3, humidityControl: 0.2, ventilation: 0.3,
    hygiene: 0.4, biosecurity: 0.2, allowedSpecies: [],
    desc:
      'İdari personel dışında kalan, hayvanların bakımından sorumlu personelin ' +
      'dinlenebileceği oda. Personelin yorgunluk toparlamasını iyileştirir.',
    ref: 'Bölüm 3, s. 47'
  },
  changing: {
    id: 'changing', name: 'Soyunma / Duş Odası', group: 'admin', tier: 1,
    cost: 18000, maintenanceCost: 80, size: [2, 3], color: 0xd6cfc0, capacity: 0,
    temperatureControl: 0.3, humidityControl: 0.3, ventilation: 0.5,
    hygiene: 0.8, biosecurity: 0.8, allowedSpecies: [],
    desc:
      'Personelin temiz çalışma kıyafeti giyebilmesi ve gerektiğinde duş alabilmesi için ' +
      'gereklidir; yeterli sayıda dolap bulunmalıdır. Bariyerli yetiştirmenin temelidir.',
    ref: 'Bölüm 3, s. 46-47, 52'
  },

  // ---- Sistem kontrol odaları (s. 47-49) ----
  utility: {
    id: 'utility', name: 'Sistem Kontrol (Mekanik) Odası', group: 'system', tier: 1,
    cost: 30000, maintenanceCost: 180, size: [3, 2], color: 0xb9b9c2, capacity: 0,
    temperatureControl: 0.9, humidityControl: 0.9, ventilation: 0.9,
    hygiene: 0.3, biosecurity: 0.4, allowedSpecies: [],
    desc:
      'Havalandırma, nem, ısıtma/soğutma, aydınlatma ve güç ünitesi için ayrılmış alan. ' +
      'Isıtma ve havalandırma sistemleri ile yangın tehlikesine karşı izleme cihazları ve ' +
      'alarmlarla donatılmalıdır. Arıza olaylarının etkisini azaltır.',
    ref: 'Bölüm 3, s. 47-49'
  },

  // ---- Servis alanları (s. 49-50) ----
  food_storage: {
    id: 'food_storage', name: 'Yem ve Altlık Deposu', group: 'service', tier: 1,
    cost: 20000, maintenanceCost: 100, size: [3, 2], color: 0xdcd0b0, capacity: 0,
    temperatureControl: 0.5, humidityControl: 0.6, ventilation: 0.5,
    hygiene: 0.6, biosecurity: 0.5, allowedSpecies: [],
    desc:
      'Serin, sıcaklığı 21 °C’yi geçmeyen, karanlık, nemsiz ve havalandırması iyi olmalıdır. ' +
      'Yem ve altlık birbirinden ayrı depolanır; kapılar haşere ve yabani kemirgen girişini ' +
      'engelleyecek şekilde düzenlenir. Yem maliyetini düşürür, pest riskini artırır.',
    ref: 'Bölüm 3, s. 49'
  },
  cleaning: {
    id: 'cleaning', name: 'Yıkama ve Sterilizasyon Odası', group: 'service', tier: 1,
    cost: 26000, maintenanceCost: 150, size: [3, 3], color: 0xc3d3d8, capacity: 0,
    temperatureControl: 0.3, humidityControl: 0.4, ventilation: 0.7,
    hygiene: 0.9, biosecurity: 0.7, allowedSpecies: [],
    desc:
      'Alet ve ekipmanın yıkandığı ve uygun bir sterilizatörle mikroplardan arındırıldığı oda. ' +
      'Kafes dezenfeksiyon odaları, hayvanların bulunduğu odalardan uzakta yer almalıdır.',
    ref: 'Bölüm 3, s. 49, 54; Bölüm 5, s. 95'
  },
  waste_store: {
    id: 'waste_store', name: 'Geçici Atık Deposu', group: 'service', tier: 1,
    cost: 17000, maintenanceCost: 110, size: [2, 2], color: 0xc8bfae, capacity: 0,
    temperatureControl: 0.4, humidityControl: 0.3, ventilation: 0.7,
    hygiene: 0.6, biosecurity: 0.7, allowedSpecies: [],
    desc:
      'Atıkların barınaktan uzaklaştırılmasına kadar geçici olarak toplandığı ve kokuşmanın ' +
      'önlendiği depo. Kirli altlık kesinlikle hayvan odalarında değiştirilmez; özel atık ' +
      'poşetlerine konarak burada depolanır.',
    ref: 'Bölüm 8, s. 175, 179'
  },

  // ---- Üretim ve barındırma odaları (s. 51-52) ----
  animal: {
    id: 'animal', name: 'Üretim ve Barındırma Odası', group: 'housing', tier: 1,
    cost: 45000, maintenanceCost: 260, size: [4, 4], color: 0xcfd9e6, capacity: 24,
    temperatureControl: 0.7, humidityControl: 0.6, ventilation: 0.6,
    hygiene: 0.6, biosecurity: 0.5,
    allowedSpecies: ['mouse', 'rat', 'gerbil', 'hamster'],
    desc:
      'Kafeslerin ve kolonilerin barındırıldığı ana oda. Her odanın üzerine barındırılan türle ' +
      'ilgili tabela asılır. Odalarda pencere olmamalı, kapı üzerinde açılır kapanır gözlem ' +
      'penceresi bulunmalıdır. Sıcaklık, nem ve havalandırma burada kritiktir.',
    ref: 'Bölüm 3, s. 51-52'
  },

  // ---- Operasyon odaları (s. 52-54) ----
  quarantine: {
    id: 'quarantine', name: 'Kabul ve Karantina Odası', group: 'operation', tier: 1,
    cost: 38000, maintenanceCost: 220, size: [3, 3], color: 0xe6d3c8, capacity: 8,
    temperatureControl: 0.7, humidityControl: 0.6, ventilation: 0.8,
    hygiene: 0.8, biosecurity: 0.95,
    allowedSpecies: ['mouse', 'rat', 'gerbil', 'hamster', 'guinea_pig', 'rabbit'],
    desc:
      'Tesise dışarıdan gelen hayvanların ilk kabulünün yapıldığı ve bakım odalarına ' +
      'alınmadan önce adaptasyonunun sağlandığı oda. Aynı zamanda sağlığı iyi durumda ' +
      'olmayan hayvanların takip edildiği odadır.',
    ref: 'Bölüm 3, s. 52'
  },
  simple_procedure: {
    id: 'simple_procedure', name: 'Basit Girişim Odası', group: 'operation', tier: 2,
    cost: 42000, maintenanceCost: 240, size: [3, 2], color: 0xd2dfe4, capacity: 0,
    temperatureControl: 0.7, humidityControl: 0.6, ventilation: 0.8,
    hygiene: 0.9, biosecurity: 0.8, allowedSpecies: [],
    desc:
      'Cerrahi uygulama yapılmayan, tanıya yönelik testlerin gerçekleştirildiği oda. ' +
      'En önemli kullanımlarından biri, meydana gelen ölümlerde otopsi işlemidir.',
    ref: 'Bölüm 3, s. 52'
  },
  operation: {
    id: 'operation', name: 'Operasyon Odası', group: 'operation', tier: 2,
    cost: 70000, maintenanceCost: 400, size: [3, 3], color: 0xc6dde0, capacity: 0,
    temperatureControl: 0.8, humidityControl: 0.7, ventilation: 0.9,
    hygiene: 0.95, biosecurity: 0.9, allowedSpecies: [],
    desc:
      'Operasyon masası, operasyon lambası, anestezi cihazı ve cerrahi set bulunur. ' +
      'Havalandırması HEPA filtrelerle yapılır. Cihazlar mümkün olduğunca mobil olmalıdır.',
    ref: 'Bölüm 3, s. 53'
  },
  post_op: {
    id: 'post_op', name: 'Reanimasyon / Post-operatif Bakım', group: 'operation', tier: 2,
    cost: 46000, maintenanceCost: 280, size: [3, 2], color: 0xd8e4e8, capacity: 6,
    temperatureControl: 0.8, humidityControl: 0.7, ventilation: 0.8,
    hygiene: 0.85, biosecurity: 0.8,
    allowedSpecies: ['mouse', 'rat', 'gerbil', 'hamster', 'guinea_pig', 'rabbit'],
    desc:
      'Anestezi altında işlem görmüş hayvanların uyanıncaya kadar sorumlu veteriner hekim ' +
      'gözetiminde tutulduğu ve sonrasında iyileşme sürecinde bakıldığı odalar. ' +
      'Uyanma sırasında acı durumuna göre ağrı kesici uygulanabilir.',
    ref: 'Bölüm 3, s. 53-54'
  },
  experimental: {
    id: 'experimental', name: 'Araştırma / Deney Odası', group: 'operation', tier: 2,
    cost: 60000, maintenanceCost: 350, size: [4, 3], color: 0xccd8e8, capacity: 6,
    temperatureControl: 0.8, humidityControl: 0.7, ventilation: 0.8,
    hygiene: 0.8, biosecurity: 0.8,
    allowedSpecies: ['mouse', 'rat', 'gerbil', 'hamster', 'guinea_pig', 'rabbit'],
    desc:
      'Barınak aynı zamanda deneyler için kullanılıyorsa, hayvanlar üzerinde araştırma, test ' +
      've operasyon gibi işlemlerin yapılabileceği ve gerekli donanımın hazır bulunduğu oda.',
    ref: 'Bölüm 8, s. 175'
  },

  // ---- Diğer (kitapta geçen özel amaçlı alanlar) ----
  classroom: {
    id: 'classroom', name: 'Eğitim Sınıfı', group: 'admin', tier: 2,
    cost: 48000, maintenanceCost: 200, size: [4, 3], color: 0xd9d2e6, capacity: 20,
    temperatureControl: 0.4, humidityControl: 0.3, ventilation: 0.5,
    hygiene: 0.5, biosecurity: 0.3, allowedSpecies: [],
    desc:
      'İdare katında yer alması gereken eğitim odası. Deney hayvanları kullanım sertifika ' +
      'programının teorik derslerinin verildiği sınıf.',
    ref: 'Bölüm 3, s. 46; Bölüm 2, s. 32'
  },
  genetics: {
    id: 'genetics', name: 'Genotiplendirme Laboratuvarı', group: 'operation', tier: 2,
    cost: 120000, maintenanceCost: 700, size: [4, 3], color: 0xcfe2d4, capacity: 0,
    temperatureControl: 0.8, humidityControl: 0.8, ventilation: 0.9,
    hygiene: 0.9, biosecurity: 0.9, allowedSpecies: [],
    desc:
      'Genotiplendirme ve genetiği değiştirilmiş hatların yönetimi. Genotiplendirme, ' +
      'çoğunlukla yavruların dokularından elde edilen DNA’nın analizi ile gerçekleştirilir.',
    ref: 'Bölüm 7, s. 143'
  },
  ivc: {
    id: 'ivc', name: 'IVC Odası', group: 'housing', tier: 2,
    cost: 140000, maintenanceCost: 900, size: [4, 4], color: 0xc4d6ea, capacity: 40,
    temperatureControl: 0.95, humidityControl: 0.9, ventilation: 0.98,
    hygiene: 0.9, biosecurity: 0.95, allowedSpecies: ['mouse', 'rat'],
    desc:
      'Bireysel iklimlendirmeli kafes (IVC) sistemleri için hazırlanmış oda. Havalandırması ' +
      'dış ortamdan bağımsızdır; nem ve ısı ayarlanabilir.',
    ref: 'Bölüm 3, s. 57'
  },
  specialized: {
    id: 'specialized', name: 'Özel Hayvan Odası', group: 'housing', tier: 2,
    cost: 95000, maintenanceCost: 560, size: [4, 3], color: 0xe2dcc8, capacity: 12,
    temperatureControl: 0.9, humidityControl: 0.85, ventilation: 0.85,
    hygiene: 0.85, biosecurity: 0.85,
    allowedSpecies: ['guinea_pig', 'rabbit', 'mouse', 'rat'],
    desc:
      'Kobay ve tavşan gibi daha geniş yaşam alanına ihtiyaç duyan türler için ayrılmış oda. ' +
      'Tavşanlarda ortam sıcaklığı 11-21 °C aralığında tutulmalıdır.',
    ref: 'Bölüm 3, s. 54, Tablo 3.1'
  }
};

export const ROOM_LIST = Object.values(ROOM_TYPES);
export const getRoomType = (id) => ROOM_TYPES[id];
