/**
 * Deterministik sözde-rastgele üreteç (mulberry32).
 * Aynı tohum -> aynı oyun akışı. Testler ve tekrar oynanabilirlik için.
 */
export class RNG {
  constructor(seed = 1337) {
    this.seed = seed >>> 0;
    this._s = this.seed;
  }

  /** [0,1) */
  next() {
    this._s = (this._s + 0x6d2b79f5) >>> 0;
    let t = this._s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** [min,max) ondalık */
  range(min, max) {
    return min + this.next() * (max - min);
  }

  /** [min,max] tam sayı */
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  /** p olasılıkla true */
  chance(p) {
    return this.next() < p;
  }

  pick(arr) {
    if (!arr.length) return undefined;
    return arr[this.int(0, arr.length - 1)];
  }

  /** [{item, weight}] listesinden ağırlıklı seçim */
  weighted(entries) {
    const total = entries.reduce((s, e) => s + Math.max(0, e.weight), 0);
    if (total <= 0) return undefined;
    let r = this.next() * total;
    for (const e of entries) {
      r -= Math.max(0, e.weight);
      if (r <= 0) return e.item;
    }
    return entries[entries.length - 1].item;
  }

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

let idCounter = 0;
export function nextId(prefix = 'id') {
  idCounter += 1;
  return `${prefix}_${idCounter.toString(36)}`;
}
