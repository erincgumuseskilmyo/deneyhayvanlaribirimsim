import { $, el, clear } from './dom.js';
import { SOURCE_LABELS, getKnowledge } from '../data/knowledge.js';

/**
 * Tek modal katmanı: olaylar, etik kurul, raporlar, quiz, bilgi kartları.
 */
export class Modal {
  constructor(bus, timeSystem) {
    this.bus = bus;
    this.time = timeSystem;
    this.layer = $('#modal-layer');
    this.box = $('#modal');
    this.queue = [];
    this.open = false;
    this.prevSpeed = 1;
  }

  /**
   * @param {object} cfg {title, body(Node|string), actions:[{label, primary, danger, onClick}], dismissable}
   */
  show(cfg) {
    if (this.open) { this.queue.push(cfg); return; }
    this.open = true;
    this.prevSpeed = this.time.speed;
    if (cfg.pauseGame !== false) this.time.pause();

    clear(this.box);
    this.box.append(el('h2', { text: cfg.title }));
    if (typeof cfg.body === 'string') this.box.append(el('div', { html: cfg.body }));
    else if (cfg.body) this.box.append(cfg.body);

    if (cfg.knowledge) this.box.append(this.knowledgeCard(cfg.knowledge));

    const actions = el('div', { class: 'modal-actions' });
    for (const a of cfg.actions ?? [{ label: 'Tamam', primary: true }]) {
      actions.append(el('button', {
        class: a.primary ? 'primary' : a.danger ? 'danger' : '',
        disabled: a.disabled ? 'disabled' : null,
        onClick: () => {
          if (a.keepOpen) { a.onClick?.(); return; }
          this.close();
          a.onClick?.();
        }
      }, a.label));
    }
    this.box.append(actions);
    this.layer.classList.remove('hidden');
  }

  /** Bilgi kartı — kaynak etiketi zorunlu */
  knowledgeCard(idOrObj) {
    const k = typeof idOrObj === 'string' ? getKnowledge(idOrObj) : idOrObj;
    if (!k) return el('div');
    return el('div', { class: 'knowledge' }, [
      el('strong', { text: `Bu neden önemli? — ${k.title}` }),
      el('p', { text: k.text }),
      el('span', { class: 'src', text: `Kaynak: ${SOURCE_LABELS[k.source]}` })
    ]);
  }

  close() {
    this.layer.classList.add('hidden');
    clear(this.box);
    this.open = false;
    if (this.queue.length) {
      const next = this.queue.shift();
      setTimeout(() => this.show(next), 60);
    } else {
      this.time.setSpeed(this.prevSpeed || 1);
    }
  }
}
