import { el, kv } from '../dom.js';
import { money } from '../../core/utils.js';
import { DECISIONS } from '../../systems/EthicsSystem.js';
import { REVIEW_GUIDE, STUDY_TYPES, HOUSING_OPTIONS } from '../../data/researchTemplates.js';
import { getSpecies } from '../../data/species.js';

const CERT_LABEL = {
  complete: 'Tüm ekip sertifikalı',
  partial: 'Ekibin bir kısmı sertifikasız',
  missing: 'Sorumlu araştırmacı sertifikasız'
};

/** Etik kurul (HADYEK) değerlendirme ekranı */
export function ethicsScreen(state, systems, bus, modal) {
  const st = state;
  const wrap = el('div');

  if (!st.hadyekEstablished) {
    wrap.append(el('p', {}, 'Yerel etik kurul (HADYEK) henüz kurulmadı. ' +
      'Kurulum için İdari Oda, bir Veteriner Hekim ve çalışma izni gerekir.'));
    wrap.append(modal.knowledgeCard('ethics_committee'));
    return wrap;
  }

  wrap.append(el('p', { class: 'hint', text:
    'Kurul üyesi olarak her başvuruyu 3R açısından değerlendirin. ' +
    'Doğru karar, başvurunun bulgularına göre değişir.' }));

  wrap.append(el('h3', { text: 'Değerlendirme Rehberi' }));
  wrap.append(el('ul', { class: 'hint' }, REVIEW_GUIDE.map((g) => el('li', { text: g }))));

  wrap.append(el('h3', { text: `Bekleyen Başvurular (${st.applications.length})` }));
  if (!st.applications.length) {
    wrap.append(el('p', { class: 'hint', text:
      'Şu anda bekleyen başvuru yok. Bilimsel itibar arttıkça başvuru sıklığı artar.' }));
  }
  for (const p of st.applications) {
    wrap.append(applicationCard(p, systems, bus, modal));
  }

  const running = st.projects.filter((x) => ['approved', 'running'].includes(x.status));
  if (running.length) {
    wrap.append(el('h3', { text: 'Yürüyen / Bekleyen Projeler' }));
    for (const p of running) {
      wrap.append(el('div', { class: 'list-item' }, [
        el('h4', { text: p.title }),
        el('div', {}, [
          el('span', { class: 'tag', text: p.status === 'running' ? `İlerleme %${Math.round(p.progress)}` : 'Hayvan bekliyor' }),
          el('span', { class: 'tag', text: `${p.animalNumber} ${getSpecies(p.species).name}` }),
          el('span', { class: 'tag', text: money(p.payment) })
        ])
      ]));
    }
  }

  const decided = systems.ethics.decisionHistory;
  if (decided.length) {
    const correct = decided.filter((d) => d.correct).length;
    wrap.append(el('h3', { text: 'Karar Performansı' }));
    wrap.append(kv('Toplam karar', decided.length));
    wrap.append(kv('Uygun karar', `${correct} (%${Math.round((correct / decided.length) * 100)})`));
  }

  return wrap;
}

function applicationCard(p, systems, bus, modal) {
  const sp = getSpecies(p.species);
  const studyName = STUDY_TYPES.find((s) => s.id === p.studyType)?.name ?? p.studyType;
  const housing = HOUSING_OPTIONS.find((h) => h.id === p.housingConditions);
  const findings = p.auditFindings();

  const card = el('div', { class: 'list-item' });
  card.append(el('h4', { text: p.title }));
  card.append(kv('Sorumlu araştırmacı', p.principalInvestigator));
  card.append(kv('Ekip', `${p.team.length} kişi`));
  card.append(kv('Sertifika durumu', CERT_LABEL[p.certificateStatus]));
  card.append(kv('Çalışma türü', studyName));
  card.append(kv('Süre', `${p.duration} gün`));
  card.append(kv('Tür / sayı', `${sp.name} — ${p.animalNumber} birey`));
  card.append(kv('Deney grubu', p.experimentalGroups));
  card.append(kv('Barındırma', housing?.name ?? p.housingConditions));
  card.append(kv('Refah riski (1-5)', p.welfareRisk));
  card.append(kv('Ödeme', money(p.payment)));

  card.append(el('p', { class: 'hint', text: `Amaç: ${p.purpose}` }));
  card.append(el('p', { class: 'hint', text: `Tür gerekçesi: ${p.speciesJustification || '— belirtilmemiş —'}` }));
  card.append(el('p', { class: 'hint', text: `İşlemler: ${p.procedures.map((x) => x.name).join(', ')}` }));
  card.append(el('p', { class: 'hint', text: `Maddeler: ${p.substances.join(', ') || '—'}` }));

  card.append(el('h4', { text: '3R Beyanı' }));
  card.append(kv('Replacement alternatifi var mı?', p.replacementAvailable ? 'EVET' : 'Hayır'));
  card.append(kv('Sayı azaltılabilir mi?', p.reductionPossible ? 'EVET' : 'Hayır'));
  card.append(kv('İyileştirme mümkün mü?', p.refinementPossible ? 'EVET' : 'Hayır'));

  if (findings.length) {
    card.append(el('div', {}, findings.map((f) =>
      el('span', { class: `tag ${f.severity === 'high' ? 'bad' : 'warn'}`, text: f.text }))));
  } else {
    card.append(el('span', { class: 'tag good', text: 'Kural tabanlı denetimde bulgu yok' }));
  }

  const decide = (decision) => {
    const res = systems.ethics.decide(p.id, decision);
    modal.close();
    setTimeout(() => {
      modal.show({
        title: res.correct ? 'Karar Değerlendirmesi — Uygun' : 'Karar Değerlendirmesi — Gözden Geçirin',
        body: `<p>${res.feedback}</p>` +
              `<p class="hint">Etki: ${Object.entries(res.effects).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(', ') || 'yok'}</p>`,
        knowledge: 'three_r',
        actions: [{ label: 'Devam', primary: true, onClick: () => bus.emit('ui:openTab', 'ethics') }]
      });
    }, 80);
  };

  card.append(el('div', { class: 'modal-actions' }, [
    el('button', { class: 'primary', onClick: () => decide(DECISIONS.APPROVE) }, 'APPROVE'),
    el('button', { onClick: () => decide(DECISIONS.REQUEST_REVISION) }, 'REQUEST_REVISION'),
    el('button', { class: 'danger', onClick: () => decide(DECISIONS.REJECT) }, 'REJECT')
  ]));

  return card;
}
