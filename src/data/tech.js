/**
 * TEKNOLOJİ / YETKİNLİK AĞACI
 *
 * Basamaklar kaynak kitaptaki kavramlara dayandırılmıştır:
 *  - Mikroizolatör ve IVC sistemleri (Bölüm 3, s. 57)
 *  - Bariyerli yetiştirme; temiz/kirli koridor ayrımı (Bölüm 3, s. 52)
 *  - Biyogüvenlik seviyeleri BGS-1…BGS-4 (Bölüm 8, s. 175-176)
 *  - Hayvan refahı birimi (Bölüm 2, s. 28)
 *  - Genetiği değiştirilmiş hayvanlar: transgenik, knockout, knockin,
 *    genotiplendirme (Bölüm 7, s. 139-143)
 *
 * NOT: Kaynak kitapta SPF (specific pathogen free) ve germ-free koloniler
 * geçmediği için bu basamaklar oyuna dâhil edilmemiştir.
 *
 * Maliyet ve aylık gider değerleri oyun dengesi kararıdır.
 */
export const TECH = {
  standard_colony: {
    id: 'standard_colony', name: 'Konvansiyonel Barındırma', cost: 0,
    requires: [], requiresRoom: null, upkeep: 0, effects: {},
    desc: 'Başlangıç durumu. Bariyer uygulaması yoktur.',
    ref: null
  },

  welfare_unit: {
    id: 'welfare_unit', name: 'Hayvan Refahı Birimi', cost: 40000,
    requires: [], requiresRoom: 'administration', upkeep: 400,
    requiresStaff: 'veterinarian',
    effects: { ethics: 6, animalWelfare: 4 },
    setsWelfareUnit: true,
    desc:
      'Hayvan deneylerinin yapılabilmesi için sadece HADYEK değil, hayvan refahı biriminin ' +
      'de bulunması zorunludur; aksi hâlde etik kurul izni olsa bile çalışmalara yasal ' +
      'olarak izin verilmez. Birim, kullanılan tüm hayvanlara ilişkin kayıtları tutar ve ' +
      '"şartlı olarak uygun" bulunan projelerin ön deneylerini izler.',
    ref: 'Bölüm 2, s. 28, 30'
  },

  microisolator: {
    id: 'microisolator', name: 'Mikroizolatör Kafes Sistemi', cost: 55000,
    requires: [], requiresRoom: 'cleaning', upkeep: 250,
    effects: { biosecurity: 6 },
    desc:
      'Kafes içindeki ortamı dış ortamdan izole eden özel kapak sistemli kafeslerin ' +
      'kullanımını açar. Kafesin kontamine olmasını engeller.',
    ref: 'Bölüm 3, s. 57'
  },

  ivc_system: {
    id: 'ivc_system', name: 'IVC Sistemi', cost: 90000,
    requires: ['microisolator'], requiresRoom: 'ivc', upkeep: 600,
    effects: { biosecurity: 8 },
    desc:
      'Havalandırması dış ortamdaki havadan bağımsız, nemi ve ısısı ayarlanabilen ' +
      'bireysel iklimlendirmeli kafes sistemleri. Maliyetlidir; patojenden bağımsız ' +
      'özel modeller veya izole çalışmalar için tercih edilir.',
    ref: 'Bölüm 3, s. 57'
  },

  barrier_housing: {
    id: 'barrier_housing', name: 'Bariyerli Yetiştirme', cost: 160000,
    requires: ['ivc_system'], requiresRoom: 'changing', upkeep: 900,
    // Kitabın koşulu: odanın bir kapısı temiz, diğeri kirli koridora açılmalı (s. 52)
    requiresBarrierCorridors: true,
    effects: { biosecurity: 14, scientificReputation: 6 },
    setsColonyStatus: 'barrier',
    desc:
      'Odanın her iki tarafında kapı bulunur; kapılardan biri kirli, diğeri temiz koridora ' +
      'açılır. Personel temiz çalışma kıyafetiyle çalışır, gerektiğinde duş alır. ' +
      'Tesise giriş-çıkış yönü kontrol altına alınır.',
    ref: 'Bölüm 3, s. 46, 52'
  },

  bgs2: {
    id: 'bgs2', name: 'BGS-2 Laboratuvar', cost: 120000,
    requires: [], requiresRoom: 'experimental', upkeep: 700,
    effects: { biosecurity: 8 },
    setsBiosafetyLevel: 2,
    desc:
      'İnsan ve çevreye orta derecede tehlike oluşturabilecek etkenlerle enfekte laboratuvar ' +
      'hayvanlarını içeren çalışmalar için temel laboratuvar. BGS-1 gereksinimlerine ek ' +
      'olarak biyolojik tehlike uyarı işareti, kesici-delici alet önlemi, biyogüvenlik ' +
      'el kitabı, kafes yıkayıcı ve sınıf I ya da II biyogüvenlik kabini gerekir.',
    ref: 'Bölüm 8, s. 176'
  },

  bgs3: {
    id: 'bgs3', name: 'BGS-3 Laboratuvar', cost: 280000,
    requires: ['bgs2', 'barrier_housing'], requiresRoom: 'operation', upkeep: 2200,
    effects: { biosecurity: 14, scientificReputation: 10 },
    setsBiosafetyLevel: 3,
    desc:
      'Aerosol yoluyla bulaşan, ölümcül hastalığa neden olabilecek potansiyeldeki ajanlarla ' +
      'enfekte hayvan çalışmaları için uygundur. Giriş-çıkış iki ayrı kapıdan kontrollü ' +
      'yapılır, kıyafetler tüm atıklarla birlikte otoklavda dezenfekte edilir, sınıf II ' +
      'biyogüvenlik kabini kullanılır ve ortam negatif basınçlıdır.',
    ref: 'Bölüm 8, s. 176'
  },

  bgs4: {
    id: 'bgs4', name: 'BGS-4 İzolasyon Laboratuvarı', cost: 520000,
    requires: ['bgs3'], requiresRoom: 'operation', upkeep: 4200,
    effects: { biosecurity: 18, scientificReputation: 16 },
    setsBiosafetyLevel: 4,
    desc:
      'İnsan ve hayvanlarda aşısı ve tedavisi olmayan, aerosol yolla bulaşma riski çok ' +
      'yüksek ekzotik ve tehlikeli ajanlarla yapılan çalışmalar için üst düzey izolasyon ' +
      'laboratuvarı. Giriş-çıkışta kıyafet değişimi ve duş, pozitif basınçlı kendiliğinden ' +
      'solunum cihazlı elbise, sınıf III biyogüvenlik kabini ve ayrı havalandırma tesisatı ' +
      'gerekir.',
    ref: 'Bölüm 8, s. 176'
  },

  genetics_unit: {
    id: 'genetics_unit', name: 'Genotiplendirme Birimi', cost: 90000,
    requires: [], requiresRoom: 'genetics', upkeep: 600,
    effects: { scientificReputation: 6 },
    desc:
      'Genotiplendirme, bir türün DNA dizisindeki farklılıkların referans bir dizi ile ' +
      'karşılaştırılarak tespit edilmesi işlemidir; çoğunlukla yavruların dokularından ' +
      'elde edilen DNA analizi ile yapılır.',
    ref: 'Bölüm 7, s. 143'
  },
  transgenic: {
    id: 'transgenic', name: 'Transgenik Hat Üretimi', cost: 130000,
    requires: ['genetics_unit'], requiresRoom: 'genetics', upkeep: 500,
    effects: { scientificReputation: 8 },
    desc:
      'Transgenik hayvan, başka bir organizmaya ya da türe ait geni kendi genomunda taşır ' +
      've oluşan yeni genom, olması gereken genetik aktivite dışında bir aktivite sergiler.',
    ref: 'Bölüm 7, s. 139'
  },
  knockout: {
    id: 'knockout', name: 'Knockout Hat', cost: 160000,
    requires: ['transgenic'], requiresRoom: 'genetics', upkeep: 650,
    effects: { scientificReputation: 10 },
    desc:
      'Hedeflenmiş mutasyona sahip, belirli bir geni susturulmuş hayvanlar. Elde edilen ' +
      'homozigot fareler kendi aralarında çiftleştirilerek saf knockout kolonileri elde edilir.',
    ref: 'Bölüm 7, s. 141'
  },
  knockin: {
    id: 'knockin', name: 'Knockin Hat', cost: 190000,
    requires: ['knockout'], requiresRoom: 'genetics', upkeep: 750,
    effects: { scientificReputation: 12 },
    desc:
      'Belirli bir geni aktif hâle getirilmiş, hedeflenmiş mutasyona sahip hayvanlar. ' +
      'Knockout hatlara göre daha az tercih edilir.',
    ref: 'Bölüm 7, s. 141'
  }
};

export const TECH_LIST = Object.values(TECH);
