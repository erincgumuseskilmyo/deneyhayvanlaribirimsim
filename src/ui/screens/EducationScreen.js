import { el, clear } from '../dom.js';
import { certificationScreen } from './CertificationScreen.js';
import { quizScreen } from './QuizScreen.js';
import { guideScreen } from './GuideScreen.js';

/**
 * EĞİTİM EKRANI
 *
 * Sertifika programı, bölüm quizleri ve bilgi bankası tek pencerede toplanır;
 * alt sekmelerle geçilir. Üçü de aynı işin (eğitim) parçası olduğu için alt
 * çubukta ayrı ayrı durmaları menüyü kalabalıklaştırıyordu.
 */
const SUB_TABS = [
  { id: 'certification', label: '🎓 Sertifika Programı', render: certificationScreen },
  { id: 'quiz', label: '📝 Bölüm Quizleri', render: quizScreen },
  { id: 'guide', label: '📚 Bilgi Bankası', render: guideScreen }
];

export function educationScreen(state, systems, bus, modal, startTab = 'certification') {
  const wrap = el('div');
  const nav = el('div', { class: 'subtabs' });
  const body = el('div');
  wrap.append(nav, body);

  const show = (id) => {
    clear(nav);
    for (const t of SUB_TABS) {
      nav.append(el('button', {
        class: t.id === id ? 'active' : '',
        onClick: () => show(t.id)
      }, t.label));
    }
    clear(body);
    const tab = SUB_TABS.find((t) => t.id === id) ?? SUB_TABS[0];
    body.append(tab.render(state, systems, bus, modal));
  };

  show(SUB_TABS.some((t) => t.id === startTab) ? startTab : 'certification');
  return wrap;
}
