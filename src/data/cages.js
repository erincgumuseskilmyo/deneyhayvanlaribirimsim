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
    id: 'shoebox', maxOccupants: 10, slots: 1, name: 'Ayakkabı Kutusu Kafes (tabanı kapalı)',
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
    id: 'grid_floor', maxOccupants: 10, slots: 1, name: 'Izgara Tabanlı Sürgülü Tepsi Kafes',
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
    id: 'microisolator', maxOccupants: 10, slots: 1, name: 'Mikroizolatör Kapaklı Kafes',
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
    id: 'ivc', maxOccupants: 10, slots: 1, name: 'IVC (Bireysel İklimlendirmeli Kafes)',
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
  breeding_cage: {
    id: 'breeding_cage', maxOccupants: 8, slots: 2, name: 'Damızlık Kafesi (geniş)',
    cost: 2400, maintenance: 13,
    floorArea: 1300, height: 18,
    cleaningDifficulty: 1.2,
    welfareBonus: 5, biosecurityBonus: 2,
    requiresRoom: null,
    desc:
      'Damızlık bir çiftin yavrularıyla birlikte barındırılabileceği geniş kafes. ' +
      'Kitap, gerbillerde damızlık çiftin yavrularıyla birlikte olacağı kafesin ' +
      '1300 cm² olması ve bir köşesine yuva kutusu konulması gerektiğini belirtir. ' +
      'Fare, sıçan ve hamster için de kullanılabilir.',
    ref: 'Bölüm 6, s. 123'
  },
  wire_pen: {
    id: 'wire_pen', maxOccupants: 8, slots: 4, name: 'Tel Örgü Kafes (75×75 cm)',
    cost: 5200, maintenance: 30,
    floorArea: 5625, height: 45,
    cleaningDifficulty: 1.6,
    welfareBonus: 8, biosecurityBonus: 2,
    requiresRoom: null,
    penaltySpecies: ['guinea_pig'],
    desc:
      'Kitapta "en büyük boyuttaki tel örgü kafesleri 75’er cm’lik kenarları olan ' +
      'kafeslerdir" denir; bu boyutta bir kafeste 4 damızlık dişi, 1 erkek ve ' +
      '2-3 haftalık yavruları birlikte barındırılabilir. Kobay ve tavşan gibi daha ' +
      'geniş yaşam alanına ihtiyaç duyan türler için gereklidir. ' +
      'Tel örgü taban kobay yavrularında bacak kırığına yol açabilir.',
    ref: 'Bölüm 3, s. 54; Bölüm 6, s. 120'
  },
  metabolism: {
    id: 'metabolism', maxOccupants: 1, slots: 1, name: 'Metabolizma Kafesi',
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

/**
 * NOT: `maxOccupants`, taban alanı hesabının üstüne konan bir OYUN SINIRIDIR.
 * Kitaptaki tablolar bir kafese kaç hayvanın SIĞABİLECEĞİNİ verir; pratikte
 * grup büyüklüğü ayrıca sınırlıdır. Tel örgü kafes için kitaptaki tanım
 * esas alınmıştır: "4 damızlık dişi, 1 erkek ve 2-3 haftalık yavruları"
 * (Bölüm 6, s. 120).
 */
export const CAGE_LIST = Object.values(CAGE_TYPES);
export const getCageType = (id) => CAGE_TYPES[id];
