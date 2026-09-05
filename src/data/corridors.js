/**
 * KORİDORLAR
 *
 * Kaynak: Bölüm 3, s. 49-52.
 *  - Koridorlar tesisin servis alanları arasında sayılır (s. 49).
 *  - "Koridorlar, her türlü ihtiyaca cevap verecek, kolay geçişi sağlayacak
 *    şekilde (malzeme, kafes, hayvanların taşınması vb.) geniş olmalıdır." (s. 50)
 *  - "Tesis içerisinde bariyerli yetiştirme yapılıyorsa o zaman odanın her iki
 *    tarafında kapı bulunmalı ve bu kapılardan biri kirli, biri de temiz
 *    koridora açılmalıdır." (s. 52)
 *  - "Yem, altlık malzemeleri kesinlikle koridorlarda, laboratuvarlarda ve
 *    deney hayvanı odalarında depolanmamalıdır." (s. 49)
 *
 * Maliyet ve bonus değerleri oyun dengesi kararıdır.
 */
export const CORRIDOR_TYPES = {
  clean: {
    id: 'clean',
    name: 'Temiz Koridor',
    cost: 3200,
    maintenanceCost: 12,
    color: 0xdfe7ef,
    biosecurityBonus: 1.2,
    desc:
      'Temiz malzeme, yıkanmış kafes ve personelin bariyer sonrası geçişi için ' +
      'ayrılmış koridor. Bariyerli yetiştirmede odanın bir kapısı temiz koridora açılır.',
    ref: 'Bölüm 3, s. 52'
  },
  dirty: {
    id: 'dirty',
    name: 'Kirli Koridor',
    cost: 2600,
    maintenanceCost: 10,
    color: 0xe2d8c8,
    biosecurityBonus: 1.2,
    desc:
      'Kirli altlık, kullanılmış kafes ve atığın tesisten çıkarıldığı koridor. ' +
      'Bariyerli yetiştirmede odanın diğer kapısı kirli koridora açılır.',
    ref: 'Bölüm 3, s. 52'
  }
};

export const CORRIDOR_LIST = Object.values(CORRIDOR_TYPES);
export const getCorridorType = (id) => CORRIDOR_TYPES[id];

/** Bağlı olmayan odada bakım kapsamı bu oranda düşer (oyun dengesi). */
export const UNCONNECTED_CARE_PENALTY = 0.45;
