import { $, el, clear } from './dom.js';
import { staffScreen } from './screens/StaffScreen.js';
import { ethicsScreen } from './screens/EthicsScreen.js';
import { certificationScreen } from './screens/CertificationScreen.js';
import { techScreen } from './screens/TechScreen.js';
import { reportScreen } from './screens/ReportScreen.js';
import { quizScreen } from './screens/QuizScreen.js';
import { guideScreen } from './screens/GuideScreen.js';

const TABS = [
  { id: 'staff', label: '👥 Personel', title: 'Personel Yönetimi', render: staffScreen },
  { id: 'ethics', label: '⚖ Etik Kurul', title: 'HADYEK — Etik Kurul Değerlendirmesi', render: ethicsScreen },
  { id: 'certification', label: '🎓 Sertifika', title: 'Deney Hayvanları Kullanım Sertifika Programı', render: certificationScreen },
  { id: 'tech', label: '🧬 Tür & Teknoloji', title: 'Türler ve Teknoloji Ağacı', render: techScreen },
  { id: 'report', label: '📊 Raporlar', title: 'Raporlar', render: reportScreen },
  { id: 'quiz', label: '📝 Quiz', title: 'Bölüm Quizleri', render: quizScreen },
  { id: 'guide', label: '📚 Bilgi Bankası', title: 'Bilgi Bankası', render: guideScreen }
];

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
    if (id === 'certification') return st.courses.filter((c) => c.status !== 'finished').length || null;
    return null;
  }

  open(id) {
    const tab = TABS.find((t) => t.id === id);
    if (!tab) return;
    const body = tab.render(this.state, this.systems, this.bus, this.modal);
    this.modal.show({ title: tab.title, body, actions: [{ label: 'Kapat', primary: true }] });
  }
}
