import { el, kv } from '../dom.js';
import { SCORE_WEIGHTS } from '../../systems/ScoringSystem.js';

export function endGameScreen(state, systems, reason) {
  const report = systems.scoring.finalReport();
  const wrap = el('div');

  wrap.append(el('p', { text: reason }));
  wrap.append(el('div', { class: 'grade', text: report.grade }));
  wrap.append(el('p', { html: `<strong>Toplam skor: ${Math.round(report.total)} / 100</strong>` }));

  const labels = {
    economic: 'Economic Score', welfare: 'Welfare Score', ethics: 'Ethics Score',
    biosecurity: 'Biosecurity Score', reputation: 'Scientific Reputation'
  };
  const table = el('table', { class: 'mini' }, [
    el('tr', {}, [el('th', { text: 'Boyut' }), el('th', { text: 'Puan' }), el('th', { text: 'Ağırlık' })])
  ]);
  for (const [k, v] of Object.entries(report.breakdown)) {
    table.append(el('tr', {}, [
      el('td', { text: labels[k] }),
      el('td', { text: Math.round(v) }),
      el('td', { text: `%${Math.round(SCORE_WEIGHTS[k] * 100)}` })
    ]));
  }
  wrap.append(table);

  wrap.append(el('h3', { text: 'Değerlendirme' }));
  wrap.append(el('ul', {}, report.advice.map((a) => el('li', { text: a }))));

  const quizzes = state.quizResults;
  if (quizzes.length) {
    const meanQuiz = Math.round(quizzes.reduce((s, q) => s + q.score, 0) / quizzes.length);
    wrap.append(el('h3', { text: 'Eğitim Performansı' }));
    wrap.append(kv('Çözülen quiz', quizzes.length));
    wrap.append(kv('Ortalama quiz puanı', `%${meanQuiz}`));
    const wrongTopics = [...new Set(quizzes.flatMap((q) => q.wrongTopics))];
    if (wrongTopics.length) wrap.append(kv('Tekrar önerilen konu sayısı', wrongTopics.length));
  }

  const decisions = systems.ethics.decisionHistory;
  if (decisions.length) {
    const correct = decisions.filter((d) => d.correct).length;
    wrap.append(kv('Etik kurul karar isabeti', `%${Math.round((correct / decisions.length) * 100)}`));
  }

  wrap.append(el('h3', { text: 'Tesis Özeti' }));
  wrap.append(kv('Ulaşılan tesis seviyesi', state.facilityLevel));
  wrap.append(kv('Toplam gün', state.day));
  wrap.append(kv('Sertifikalandırılan kursiyer', systems.certification.totalCertified));
  wrap.append(kv('Tamamlanan proje', state.projects.filter((p) => p.status === 'completed').length));

  return wrap;
}
