/**
 * KORİDORLAR
 *
 * Kaynak: Bölüm 3, s. 49-51.
 *  - Koridorlar tesisin servis alanları arasında sayılır (s. 49).
 *  - "Koridorlar, her türlü ihtiyaca cevap verecek, kolay geçişi sağlayacak
 *    şekilde (malzeme, kafes, hayvanların taşınması vb.) geniş olmalıdır." (s. 50)
 *  - "Yem, altlık malzemeleri kesinlikle koridorlarda, laboratuvarlarda ve
 *    deney hayvanı odalarında depolanmamalıdır." (s. 49)
 *
 * Kitap, bariyerli yetiştirme yapılan tesiste odanın her iki tarafında kapı
 * bulunmasını ve "bu kapılardan biri kirli, biri de temiz koridora" açılmasını
 * ister (s. 52). Oyun bu ayrımı tek tip koridorla basitleştirir: koridorun
 * temiz/kirli sınıfı modellenmez, bariyerli yetiştirme için odanın karşılıklı
 * iki kenarının koridora açılması (iki kapı) aranır. Bu bir oyun kararıdır.
 *
 * Maliyet ve bonus değerleri oyun dengesi kararıdır.
 */
export const CORRIDOR = {
  id: 'corridor',
  name: 'Koridor',
  cost: 2900,
  maintenanceCost: 11,
  color: 0xdfe7ef,
  desc:
    'Malzeme, kafes ve hayvanların taşınmasına elverecek genişlikte, kolay ' +
    'temizlenip dezenfekte edilebilen servis koridoru. Odaya bir kenarından ' +
    'değdiğinde o odaya kapı açar; yem ve altlık koridorda depolanmaz.',
  ref: 'Bölüm 3, s. 49-51'
};

export const CORRIDOR_LIST = [CORRIDOR];
export const getCorridorType = () => CORRIDOR;

/** Bağlı olmayan odada bakım kapsamı bu oranda düşer (oyun dengesi). */
export const UNCONNECTED_CARE_PENALTY = 0.45;
