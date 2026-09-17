export const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const round = (v, d = 1) => {
  const f = 10 ** d;
  return Math.round(v * f) / f;
};
export const sum = (arr, fn = (x) => x) => arr.reduce((s, x) => s + fn(x), 0);
export const avg = (arr, fn = (x) => x) => (arr.length ? sum(arr, fn) / arr.length : 0);

/** 12500 -> "12.500 ₺" */
export const money = (v) =>
  `${Math.round(v).toLocaleString('tr-TR')} ₺`;

/** Oyun gününü "Yıl 1 · Ay 3 · Gün 12" biçiminde yazar (30 günlük ay). */
export function formatGameDate(day) {
  const y = Math.floor(day / 360) + 1;
  const m = Math.floor((day % 360) / 30) + 1;
  const d = (day % 30) + 1;
  return `Yıl ${y} · Ay ${m} · Gün ${d}`;
}
