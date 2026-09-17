import { $, el, clear, section } from './dom.js';
import { ROOM_LIST, ROOM_GROUPS } from '../data/rooms.js';
import { CORRIDOR } from '../data/corridors.js';
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
    this.selectedKind = 'room';   // room | corridor
    this.mode = 'select'; // select | build | demolish
    // Uzun oda listesi katlanır gruplara bölünür; hangi grubun açık olduğu
    // panel her yeniden çizildiğinde korunur.
    this.openGroups = new Set(['housing']);
    bus.on('facility:changed', () => this.render());
    bus.on('build:modeChanged', () => this.render());
    this.render();
  }

  setType(typeId, kind = 'room') {
    const same = this.selectedType === typeId && this.selectedKind === kind;
    this.selectedType = same ? null : typeId;
    this.selectedKind = kind;
    this.mode = this.selectedType ? 'build' : 'select';
    this.bus.emit('build:modeChanged', {
      mode: this.mode, type: this.selectedType, kind
    });
    this.render();
  }

  setMode(mode) {
    this.mode = mode;
    if (mode !== 'build') this.selectedType = null;
    this.bus.emit('build:modeChanged', { mode, type: this.selectedType, kind: this.selectedKind });
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

    // Koridor en sık kullanılan öğedir; grupların üstünde tek düğme olarak durur
    // (Bölüm 3, s. 49 — koridorlar da servis alanlarındandır).
    const corridorActive = this.selectedKind === 'corridor';
    this.root.append(el('button', {
      class: `wide build-item ${corridorActive ? 'active' : ''}`,
      title: `${CORRIDOR.desc} (${CORRIDOR.ref})`,
      onClick: () => this.setType(CORRIDOR.id, 'corridor')
    }, [
      el('span', { text: `${CORRIDOR.name}${st.corridors.length ? ` ×${st.corridors.length}` : ''}` }),
      el('small', {
        text: `${money(CORRIDOR.cost)} · 1×1${st.canAfford(CORRIDOR.cost) ? '' : ' · bütçe yetersiz'}`
      })
    ]));

    // Odalar, kaynak kitaptaki işlev gruplarına göre listelenir (Bölüm 3, s. 46).
    // Her grup katlanır; böylece panelde aynı anda tek liste görünür.
    for (const [key, title] of Object.entries(ROOM_GROUPS)) {
      const rooms = ROOM_LIST.filter((r) => r.group === key);
      if (!rooms.length) continue;
      const built = rooms.reduce((n, def) => n + st.roomsOfType(def.id).length, 0);
      const open = this.openGroups.has(key)
        || rooms.some((def) => def.id === this.selectedType);
      const items = rooms.map((def) => {
        const locked = def.tier > 1 && st.facilityLevel < 2;
        const affordable = st.canAfford(def.cost);
        const count = st.roomsOfType(def.id).length;
        return el('button', {
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
        ]);
      });
      this.root.append(section(`${title}${built ? ` · ${built}` : ''}`, items, {
        open,
        onToggle: (isOpen) => {
          if (isOpen) this.openGroups.add(key);
          else this.openGroups.delete(key);
        }
      }));
    }

    this.hint.textContent = this.mode === 'build'
      ? (this.selectedKind === 'corridor'
          ? 'Koridor karosunu zemine tıklayarak döşe. Sürükleyerek sıra döşeyebilirsin. Sağ tık ile iptal.'
          : 'Zemine tıklayarak yerleştir. Sağ tık ile iptal.')
      : this.mode === 'demolish'
        ? 'Yıkmak istediğin odaya ya da koridor karosuna tıkla (hayvanlar boşaltılmış olmalı).'
        : 'Bir oda seç, sonra zemine tıkla. Odaya tıklayarak detay panelini aç.';
  }
}
