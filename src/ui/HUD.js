import { $, el, clear, bar, tone } from './dom.js';
import { money, formatGameDate } from '../core/utils.js';

const STATS = [
  { key: 'money', label: 'MONEY', fmt: (v) => money(v), bar: false },
  { key: 'animalWelfare', label: 'ANIMAL_WELFARE' },
  { key: 'biosecurity', label: 'BIOSECURITY' },
  { key: 'ethics', label: 'ETHICS' },
  { key: 'scientificReputation', label: 'SCIENTIFIC_REPUTATION' },
  { key: 'staffMorale', label: 'STAFF_MORALE' },
  { key: 'facilityLevel', label: 'FACILITY_LEVEL', fmt: (v) => `Seviye ${v}`, bar: false }
];

export class HUD {
  constructor(state, time, bus) {
    this.state = state;
    this.time = time;
    this.bus = bus;
    this.row = $('#stat-row');
    this.dateLabel = $('#date-label');
    this.speedRoot = $('#speed-buttons');
    this.renderSpeeds();
  }

  renderSpeeds() {
    clear(this.speedRoot);
    const labels = { 0: '⏸', 1: '▶', 2: '▶▶', 4: '▶▶▶' };
    for (const s of this.time.speeds) {
      this.speedRoot.append(el('button', {
        class: this.time.speed === s ? 'active' : '',
        onClick: () => { this.time.setSpeed(s); this.renderSpeeds(); }
      }, labels[s]));
    }
  }

  update() {
    const st = this.state;
    clear(this.row);
    for (const s of STATS) {
      const v = st[s.key];
      const box = el('div', { class: 'stat' }, [
        el('span', { text: s.label }),
        el('b', { text: s.fmt ? s.fmt(v) : Math.round(v) })
      ]);
      if (s.bar !== false) {
        const b = bar(v);
        const fill = b.firstChild;
        const t = tone(v);
        fill.style.background = t === 'good' ? '#4f9d69' : t === 'bad' ? '#c1564f' : '#d79b3c';
        box.append(b);
      }
      if (s.key === 'money' && st.money < 0) box.querySelector('b').style.color = '#c1564f';
      this.row.append(box);
    }
    this.dateLabel.textContent = formatGameDate(st.day);
  }
}
