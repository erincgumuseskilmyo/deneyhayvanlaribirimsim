/** Küçük DOM yardımcıları — çerçeve kullanılmadan okunabilir UI için. */

export const $ = (sel) => document.querySelector(sel);

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v !== null && v !== undefined && v !== false) {
      node.setAttribute(k, v);
    }
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue;
    node.append(typeof c === 'string' || typeof c === 'number' ? String(c) : c);
  }
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

export function kv(label, value) {
  return el('div', { class: 'kv' }, [el('span', { text: label }), el('span', { text: String(value) })]);
}

export function bar(value, max = 100) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return el('div', { class: 'bar' }, [el('i', { style: `width:${pct}%` })]);
}

/** Sayısal değere göre renk sınıfı */
export function tone(v, goodAbove = 65, badBelow = 40) {
  if (v >= goodAbove) return 'good';
  if (v <= badBelow) return 'bad';
  return 'warn';
}
