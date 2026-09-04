/**
 * Minimal yayın/abone (pub-sub) veri yolu.
 * Sistemler birbirini doğrudan import etmeden haberleşsin diye kullanılır.
 */
export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(topic, fn) {
    if (!this.listeners.has(topic)) this.listeners.set(topic, new Set());
    this.listeners.get(topic).add(fn);
    return () => this.off(topic, fn);
  }

  off(topic, fn) {
    this.listeners.get(topic)?.delete(fn);
  }

  emit(topic, payload) {
    const set = this.listeners.get(topic);
    if (!set) return;
    for (const fn of [...set]) {
      try {
        fn(payload);
      } catch (err) {
        console.error(`[EventBus] "${topic}" dinleyicisinde hata:`, err);
      }
    }
  }
}
