/**
 * KAFES RAFI YERLEŞİMİ
 *
 * Tavşan dışındaki türler kafeslerini rafta bulur: oda zemininde ayrı kafes
 * kutusu çizilmez, her kafes rafın bir gözüne denk gelir ve hayvanlar o gözün
 * içinde durur.
 *
 * Kaynak kitap, tesis ekipmanı arasında kafes raflarını ve kafes taşıyıcılarını
 * sayar: "Zeminler; kafesler, raflar, kafes taşıyıcıları, diğer taşıma arabaları
 * ve ekipmanların taşınması sırasında meydana gelebilecek yıpranma ve aşınmaya
 * karşı dayanıklı olmalıdır." (Bölüm 8, s. 175)
 *
 * Tavşan rafa konmaz: kitap tavşanı 75x75 cm tel örgü kafeste, zeminde
 * barındırır (Bölüm 6, s. 120). Tavşan odasında raf çizilmez, kafesler eskisi
 * gibi zemine dizilir.
 *
 * Raf ölçüleri, göz sayısı ve bir rafa düşen kafes sayısı oyun kararıdır;
 * kitapta sayı verilmez.
 *
 * Saf fonksiyonlar: Three.js'e bağlı değildir, tarayıcısız test edilir.
 */

// --- Modelin (public/models/rack.glb) kendi ölçüleri, metre ---
const MODEL_H = 1.6339;          // yükseklik
const MODEL_W = 1.4159;          // genişlik
const MODEL_D = 0.6039;          // derinlik
const MODEL_SHELF_Z = [0.20, 0.50, 0.80, 1.10, 1.40];  // raf plakalarının yüksekliği
const MODEL_SHELF_W = 1.296;     // raf plakasının kullanılabilir genişliği
const MODEL_CAGE_W = 0.152;      // bir kafesin iç genişliği
const MODEL_CAGE_D = 0.28;       // bir kafesin derinliği
const MODEL_CAGE_H = 0.124;      // kafesin iç yüksekliği (taban - tel kapak)
// Kafes gövdesi plakanın 0,006 üstünde ve yarı yüksekliği 0,062: tabanı
// plakadan 0,056 aşağıda kalır. Hayvan kafes tabanına basar.
const MODEL_CAGE_FLOOR = -0.052;

/** Oyun içi raf yüksekliği — manifestteki `rack.fitHeight` ile aynı olmalı. */
export const RACK_H = 1.8;
const K = RACK_H / MODEL_H;      // model metresi -> oyun birimi

export const RACK_W = +(MODEL_W * K).toFixed(3);   // 1,560
export const RACK_D = +(MODEL_D * K).toFixed(3);   // 0,665
export const RACK_GAP = 0.14;
export const RACK_SHELVES = MODEL_SHELF_Z.length;  // 5
export const RACK_COLS = 7;                        // raf başına göz
export const RACK_SLOTS = RACK_SHELVES * RACK_COLS; // 35
export const CAGES_PER_RACK = 14;                  // bir rafa düşen kafes
export const MAX_RACKS = 4;

/** İki göz arası mesafe (raf plakası eşit bölünür) */
export const SLOT_PITCH = +(MODEL_SHELF_W / RACK_COLS * K).toFixed(3); // 0,204
/** Bir gözün iç ölçüleri (hayvanın sığacağı alan) */
export const SLOT_W = +(MODEL_CAGE_W * K).toFixed(3);              // 0,167
export const SLOT_D = +(MODEL_CAGE_D * K).toFixed(3);              // 0,308
export const SLOT_H = +(MODEL_CAGE_H * K).toFixed(3);              // 0,137

/**
 * Hayvanlar raf gözünde en çok bu oranda çizilir; gözün iç yüksekliğine
 * sığmayan türler (kobay gibi) ayrıca küçültülür — bu bir görsel kısaltmadır.
 */
export const RACK_ANIMAL_SCALE = 0.8;
/** Bir gözde en fazla kaç hayvan çizilir (kalanlar sayıda vardır, çizilmez). */
export const RACK_ANIMALS_PER_CAGE = 2;

/** Kafes tabanlarının oyun içi yükseklikleri */
export const SHELF_Y = MODEL_SHELF_Z.map((z) => +((z + MODEL_CAGE_FLOOR) * K).toFixed(4));

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
  const z = room.d / 2 - RACK_D / 2 - 0.18;
  return Array.from({ length: count }, (_, i) => ({
    x: -total / 2 + RACK_W / 2 + i * (RACK_W + RACK_GAP),
    z
  }));
}

/**
 * Odadaki `index` numaralı kafes hangi rafın hangi gözüne düşer?
 * Gözler alttaki raftan başlayarak soldan sağa doldurulur.
 */
export function cageSlot(index, rackTotal) {
  const rack = Math.min(Math.floor(index / CAGES_PER_RACK), Math.max(0, rackTotal - 1));
  const slot = Math.min(index - rack * CAGES_PER_RACK, RACK_SLOTS - 1);
  return {
    rack,
    shelf: Math.floor(slot / RACK_COLS),
    col: slot % RACK_COLS
  };
}

/** Gözün raf içindeki yerel konumu (rafın kendi ekseninde). */
export function slotPosition(shelf, col) {
  return {
    x: -(SLOT_PITCH * RACK_COLS) / 2 + SLOT_PITCH * (col + 0.5),
    y: SHELF_Y[Math.min(shelf, SHELF_Y.length - 1)],
    z: 0
  };
}
