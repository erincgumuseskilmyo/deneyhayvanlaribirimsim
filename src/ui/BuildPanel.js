import { $, el, clear } from './dom.js';
import { ROOM_LIST } from '../data/rooms.js';
import { money } from '../core/utils.js';

/**
 * Sol panel: oda seçimi ve yerleştirme modu.
 */
export class BuildPanel {
  constructor(state, facility, bus) {
    this.state = state;
    this.facility = facility;
    this.bus = bus;
    this.root = $('#build-list');
    this.hint = $('#build-hint');
    this.selectedType = null;
    this.mode = 'select'; // select | build | demolish
    bus.on('facility:changed', () => this.render());
    bus.on('build:modeChanged', () => this.render());
    this.render();
  }

  setType(typeId) {
    this.selectedType = this.selectedType === typeId ? null : typeId;
    this.mode = this.selectedType ? 'build' : 'select';
    this.bus.emit('build:modeChanged', { mode: this.mode, type: this.selectedType });
    this.render();
  }

  setMode(mode) {
    this.mode = mode;
    if (mode !== 'build') this.selectedType = null;
    this.bus.emit('build:modeChanged', { mode, type: this.selectedType });
    this.render();
  }

  render() {
    const st = this.state;
    clear(this.root);

    this.root.append(el('div', {}, [
      el('button', {
        class: this.mode === 'select' ? 'active wide' : 'wide',
        onClick: () => this.setMode('select')
      }, '🖱 Seçim modu'),
      el('button', {
        class: this.mode === 'demolish' ? 'active wide' : 'wide',
        onClick: () => this.setMode('demolish')
      }, '⛏ Yıkım modu')
    ]));

    const groups = [
      { title: 'Başlangıç Odaları', tier: 1 },
      { title: 'İleri Seviye Odalar', tier: 2 }
    ];

    for (const g of groups) {
      this.root.append(el('h3', { text: g.title }));
      for (const def of ROOM_LIST.filter((r) => r.tier === g.tier)) {
        const locked = def.tier > 1 && st.facilityLevel < 2;
        const affordable = st.canAfford(def.cost);
        const count = st.roomsOfType(def.id).length;
        this.root.append(el('button', {
          class: `wide build-item ${this.selectedType === def.id ? 'active' : ''}`,
          disabled: locked ? 'disabled' : null,
          title: def.desc,
          onClick: () => this.setType(def.id)
        }, [
          el('span', { text: `${def.name}${count ? ` ×${count}` : ''}` }),
          el('small', {
            text: locked
              ? 'Tesis seviyesi 2 gerekli'
              : `${money(def.cost)} · ${def.size[0]}×${def.size[1]}${affordable ? '' : ' · bütçe yetersiz'}`
          })
        ]));
      }
    }

    this.hint.textContent = this.mode === 'build'
      ? 'Zemine tıklayarak yerleştir. Sağ tık ile iptal.'
      : this.mode === 'demolish'
        ? 'Yıkmak istediğin odaya tıkla (hayvanlar boşaltılmış olmalı).'
        : 'Bir oda seç, sonra zemine tıkla. Odaya tıklayarak detay panelini aç.';
  }
}
