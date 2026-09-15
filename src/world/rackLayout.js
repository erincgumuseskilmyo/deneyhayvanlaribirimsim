/**
 * KAFES RAFI YERLEŞİMİ
 *
 * Kaynak kitap, tesis ekipmanı arasında kafes raflarını ve kafes taşıyıcılarını
 * sayar: "Zeminler; kafesler, raflar, kafes taşıyıcıları, diğer taşıma arabaları
 * ve ekipmanların taşınması sırasında meydana gelebilecek yıpranma ve aşınmaya
 * karşı dayanıklı olmalıdır." (Bölüm 8, s. 175)
 *
 * Tavşanlar rafa konmaz: kitap tavşanı 75x75 cm tel örgü kafeste, zeminde
 * barındırır (Bölüm 6, s. 120). Bu yüzden tavşan odasında raf çizilmez.
 *
 * Rafın kaç kafes taşıdığı, kaç raf kurulacağı ve ölçüler oyun kararıdır;
 * kitapta sayı verilmez.
 *
 * Saf fonksiyonlar: Three.js'e bağlı değildir, tarayıcısız test edilir.
 */

export const RACK_W = 1.10;          // rafın genişliği (grid birimi)
export const RACK_D = 0.50;          // rafın derinliği
export const RACK_GAP = 0.12;        // iki raf arası boşluk
export const CAGES_PER_RACK = 12;    // bir rafın taşıdığı kafes sayısı
export const MAX_RACKS = 4;

/** Bu oda kafeslerini rafta taşır mı? (tavşan hariç) */
export function usesRacks(room) {
  return (room.def?.capacity ?? 0) > 0 && room.species !== 'rabbit';
}

/** Odadaki kafes sayısına göre kaç raf çizilir? */
export function rackCount(room, cageCount) {
  if (!usesRacks(room) || cageCount <= 0) return 0;
  const byCages = Math.ceil(cageCount / CAGES_PER_RACK);
  const byWidth = Math.max(1, Math.floor((room.w - 0.3) / (RACK_W + RACK_GAP)));
  return Math.min(byCages, byWidth, MAX_RACKS);
}

/** Rafların oda içindeki yerel konumları — arka duvara sırtını verir. */
export function rackPositions(room, count) {
  if (count <= 0) return [];
  const total = count * RACK_W + (count - 1) * RACK_GAP;
  const z = room.d / 2 - RACK_D / 2 - 0.22;
  return Array.from({ length: count }, (_, i) => ({
    x: -total / 2 + RACK_W / 2 + i * (RACK_W + RACK_GAP),
    z
  }));
}

/**
 * Kafeslerin dizileceği en arka yerel z. Raf varsa arka şerit rafa ayrılır,
 * yoksa oda sonuna kadar kullanılabilir.
 */
export function cageZLimit(room, count) {
  if (count <= 0) return room.d / 2;
  return room.d / 2 - RACK_D - 0.34;
}
