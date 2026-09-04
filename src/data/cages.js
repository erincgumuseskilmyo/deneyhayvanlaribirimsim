/**
 * KAFES TİPLERİ
 *
 * Tipler kaynak kitaptaki sınıflandırmadan alınmıştır (Bölüm 3, s. 54-58):
 *  - Yaşam kafesleri: tabanı kapalı "ayakkabı kutusu" tipi ve tabanı tel ızgara
 *    döşenmiş sürgülü tepsi tipi,
 *  - Mikroizolatör kapak sistemli kafesler,
 *  - Bireysel iklimlendirmeli kafes sistemleri (IVC),
 *  - Metabolizma kafesleri (tek bireylik).
 *
 * Kafeslerin cm² cinsinden taban alanı ve yüksekliği OYUN DEĞERİDİR; kitap
 * kafes modeli başına ölçü vermez, tür başına minimumları verir (Tablo 3.2-3.7).
 * Seçilen ölçüler bu minimumları karşılayacak biçimde belirlenmiştir.
 * Kapasite sabit değildir: tür ve canlı ağırlığa göre hesaplanır
 * (bkz. data/species.js -> capacityFor).
 */
export const CAGE_TYPES = {
  shoebox: {
    id: 'shoebox', name: 'Ayakkabı Kutusu Kafes (tabanı kapalı)',
    cost: 900, maintenance: 6,
    floorArea: 800, height: 18,       // cm² / cm (oyun değeri)
    cleaningDifficulty: 1.3,
    welfareBonus: 0, biosecurityBonus: 0,
    requiresRoom: null,
    desc:
      'Tabanı kapalı temel yaşam kafesi. İdrar ve dışkı altlık malzemesine karıştığı ' +
      'için koku ve hijyen sorunu doğurur; altlık sık değiştirilmek zorunda kalınır ' +
      've personelin iş yükünü artırır.',
    ref: 'Bölüm 3, s. 55'
  },
  grid_floor: {
    id: 'grid_floor', name: 'Izgara Tabanlı Sürgülü Tepsi Kafes',
    cost: 1600, maintenance: 9,
    floorArea: 800, height: 18,
    cleaningDifficulty: 0.8,
    welfareBonus: 2, biosecurityBonus: 5,
    requiresRoom: null,
    penaltySpecies: ['rat', 'rabbit', 'guinea_pig'],
    desc:
      'Tabanı tel ızgara, altında sürgülü tepsi bulunan kafes. Dışkı ve idrar tepsiye ' +
      'geçtiği için temizlik kolaydır ve koprofaji engellenir. Ancak özellikle sıçan ve ' +
      'tavşanlarda ayak yaralanmalarına yol açabilir; kobay yavrularında bacak ' +
      'kırıklarına sebep olabileceği için tehlikelidir.',
    ref: 'Bölüm 3, s. 57; Bölüm 6, s. 120'
  },
  microisolator: {
    id: 'microisolator', name: 'Mikroizolatör Kapaklı Kafes',
    cost: 3200, maintenance: 18,
    floorArea: 800, height: 18,
    cleaningDifficulty: 1.5,
    welfareBonus: 4, biosecurityBonus: 14,
    requiresRoom: null,
    desc:
      'Kafes içindeki ortamı dış ortamdan izole eden özel kapak sistemi içerir; ' +
      'kafesin kontamine olmasını engeller. İmmün sistemi baskılanmış hayvanlarla ' +
      'yapılan çalışmalarda kullanılır.',
    ref: 'Bölüm 3, s. 57'
  },
  ivc: {
    id: 'ivc', name: 'IVC (Bireysel İklimlendirmeli Kafes)',
    cost: 6500, maintenance: 42,
    floorArea: 800, height: 18,
    cleaningDifficulty: 1.8,
    welfareBonus: 8, biosecurityBonus: 26,
    requiresRoom: 'ivc',
    desc:
      'Havalandırması dış ortamdaki havadan bağımsız, nemi ve ortam ısısı ayarlanabilen ' +
      'kafes sistemi. Rutin çalışmalar yürüten tesisler için oldukça maliyetlidir; ' +
      'patojenden bağımsız özel modeller veya izole çalışmalar haricinde tercih edilmez.',
    ref: 'Bölüm 3, s. 57'
  },
  metabolism: {
    id: 'metabolism', name: 'Metabolizma Kafesi',
    cost: 4200, maintenance: 26,
    floorArea: 400, height: 18,
    cleaningDifficulty: 2.0,
    welfareBonus: -12, biosecurityBonus: 6,
    requiresRoom: null,
    singleOccupancy: true,
    desc:
      'Su ve yem tüketimi ile idrar ve dışkı miktarının ayrı ayrı ölçülebildiği ' +
      'tek bireylik özel kafes. Tabanı ızgaralıdır; idrar ve dışkı ayrı kanallarla ' +
      'ayrı haznelerde toplanır. Yalnızca metabolik ölçüm gerektiren çalışmalarda ' +
      've sınırlı süreyle kullanılmalıdır.',
    ref: 'Bölüm 3, s. 58'
  }
};

export const CAGE_LIST = Object.values(CAGE_TYPES);
export const getCageType = (id) => CAGE_TYPES[id];
