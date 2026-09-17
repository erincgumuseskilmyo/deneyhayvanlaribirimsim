import { $, el, clear } from './dom.js';
import { staffScreen } from './screens/StaffScreen.js';
import { ethicsScreen } from './screens/EthicsScreen.js';
import { techScreen } from './screens/TechScreen.js';
import { reportScreen } from './screens/ReportScreen.js';
import { educationScreen } from './screens/EducationScreen.js';

/**
 * Alt çubuk beş sekmeye indirildi: sertifika, quiz ve bilgi bankası tek
 * "Eğitim" penceresinde alt sekme olarak toplanır.
 */
const TABS = [
  { id: 'staff', label: '👥 Personel', title: 'Personel Yönetimi', render: staffScreen },
  { id: 'ethics', label: '⚖ Etik Kurul', title: 'HADYEK — Etik Kurul Değerlendirmesi', render: ethicsScreen },
  { id: 'education', label: '🎓 Eğitim', title: 'Eğitim — Sertifika, Quiz ve Bilgi Bankası', render: educationScreen },
  { id: 'tech', label: '🧬 Tür & Teknoloji', title: 'Türler ve Teknoloji Ağacı', render: techScreen },
  { id: 'report', label: '📊 Raporlar', title: 'Raporlar', render: reportScreen }
];

/** Eski sekme adları (bilgi kartları, olaylar) Eğitim ekranının alt sekmesine yönlenir. */
const ALIASES = { certification: 'certification', quiz: 'quiz', guide: 'guide' };

export class TabBar {
  constructor(state, systems, bus, modal) {
    this.state = state;
    this.systems = systems;
    this.bus = bus;
    this.modal = modal;
    this.root = $('#tabbar');
    bus.on('ui:openTab', (id) => this.open(id));
    this.render();
  }

  /** Yeniden çizim yalnızca içerik değiştiğinde yapılır:
   *  her saniye DOM'u yenilemek butonları tıklama sırasında koparıyordu. */
  signature() {
    return TABS.map((t) => `${t.id}:${this.badge(t.id) ?? ''}`).join('|');
  }

  render() {
    const sig = this.signature();
    if (sig === this._sig) return;
    this._sig = sig;
    clear(this.root);
    for (const t of TABS) {
      const badge = this.badge(t.id);
      this.root.append(el('button', {
        onClick: () => this.open(t.id)
      }, badge ? `${t.label} (${badge})` : t.label));
    }
  }

  badge(id) {
    const st = this.state;
    if (id === 'ethics') return st.applications.length || null;
    if (id === 'education') return st.courses.filter((c) => c.status !== 'finished').length || null;
    return null;
  }

  open(id) {
    const sub = ALIASES[id];
    const tab = TABS.find((t) => t.id === (sub ? 'education' : id));
    if (!tab) return;
    const body = tab.render(this.state, this.systems, this.bus, this.modal, sub);
    this.modal.show({ title: tab.title, body, actions: [{ label: 'Kapat', primary: true }] });
  }
}
