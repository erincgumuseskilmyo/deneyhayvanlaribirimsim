import { $, el } from './dom.js';

export class Toasts {
  constructor(bus) {
    this.root = $('#toasts');
    bus.on('notify', ({ text, level = 'info' }) => this.push(text, level));
  }

  push(text, level = 'info') {
    const node = el('div', { class: `toast ${level}`, text });
    this.root.append(node);
    setTimeout(() => {
      node.style.transition = 'opacity .3s';
      node.style.opacity = '0';
      setTimeout(() => node.remove(), 320);
    }, 4200);
    while (this.root.children.length > 5) this.root.firstChild.remove();
  }
}
