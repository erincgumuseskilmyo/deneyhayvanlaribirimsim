import { clamp } from '../core/utils.js';

/**
 * ETİK KURUL (HADYEK) SİSTEMİ
 * Oyuncu her başvuru için APPROVE / REQUEST_REVISION / REJECT verir.
 * Kararın "doğruluğu", başvurunun kural tabanlı denetim bulgularına göre ölçülür.
 */
export const DECISIONS = {
  APPROVE: 'APPROVE',
  REQUEST_REVISION: 'REQUEST_REVISION',
  REJECT: 'REJECT'
};

export class EthicsSystem {
  constructor(bus, state) {
    this.bus = bus;
    this.state = state;
    this.decisionHistory = []; // {projectId, decision, correct, day}
  }

  /** Kurulun kurulabilmesi için gereken koşullar */
  canEstablishHadyek() {
    const st = this.state;
    return {
      administration: st.hasRoom('administration'),
      veterinarian: st.staffOfRole('veterinarian').length > 0,
      license: st.hasOperatingLicense,
      ok: st.hasRoom('administration') &&
          st.staffOfRole('veterinarian').length > 0 &&
          st.hasOperatingLicense
    };
  }

  establishHadyek() {
    const st = this.state;
    const check = this.canEstablishHadyek();
    if (!check.ok) return { ok: false, reason: 'Koşullar sağlanmadı.', check };
    const cost = 25000;
    if (!st.canAfford(cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    st.spend(cost, 'HADYEK kuruluş giderleri', 'admin');
    st.hadyekEstablished = true;
    st.adjust('ethics', 8);
    st.adjust('scientificReputation', 5);
    st.addLog('Yerel etik kurul (HADYEK) kuruldu.', 'good');
    this.bus.emit('ethics:hadyekEstablished');
    return { ok: true };
  }

  /**
   * İdeal karar:
   *  - Replacement mevcutsa  -> REJECT
   *  - Sertifika eksik ya da düzeltilebilir bulgu varsa -> REQUEST_REVISION
   *  - Bulgu yoksa -> APPROVE
   */
  idealDecision(project) {
    const findings = project.auditFindings();
    if (findings.some((f) => f.key === 'replacement')) return DECISIONS.REJECT;
    if (findings.length > 0) return DECISIONS.REQUEST_REVISION;
    return DECISIONS.APPROVE;
  }

  decide(projectId, decision) {
    const st = this.state;
    const idx = st.applications.findIndex((p) => p.id === projectId);
    if (idx === -1) return { ok: false, reason: 'Başvuru bulunamadı.' };
    const project = st.applications[idx];
    const ideal = this.idealDecision(project);
    const correct = decision === ideal;
    const findings = project.auditFindings();

    project.decisionDay = st.day;
    let effects = {};
    let feedback = '';

    if (decision === DECISIONS.APPROVE) {
      st.applications.splice(idx, 1);
      project.status = 'approved';
      st.projects.push(project);
      if (correct) {
        effects = { ethics: 3, scientificReputation: 3 };
        feedback = 'Başvuruda etik açıdan sorun bulunmuyordu; onay yerinde bir karardır.';
      } else {
        const severe = findings.some((f) => f.severity === 'high');
        effects = severe
          ? { ethics: -14, scientificReputation: -8, animalWelfare: -4 }
          : { ethics: -7, scientificReputation: -3 };
        feedback = 'Bu başvuruda giderilmemiş bulgular vardı. Doğrudan onay, ' +
                   'kurulun denetleyici işlevini zayıflatır.';
      }
    } else if (decision === DECISIONS.REQUEST_REVISION) {
      project.status = 'revision';
      project.revisionCount += 1;
      if (correct) {
        effects = { ethics: 5, scientificReputation: 2 };
        feedback = 'Düzeltme istemek, projeyi tamamen engellemeden 3R uyumunu ' +
                   'artırmanın yoludur.';
      } else if (ideal === DECISIONS.REJECT) {
        effects = { ethics: -6 };
        feedback = 'Hayvan kullanılmayan bir alternatif mevcutsa düzeltme yeterli değildir; ' +
                   'Replacement ilkesi gereği başvuru reddedilmelidir.';
      } else {
        effects = { ethics: -2, scientificReputation: -2 };
        feedback = 'Başvuruda giderilecek bir bulgu yoktu; gereksiz düzeltme talebi ' +
                   'süreci uzatır ve araştırmacı ilişkilerini zedeler.';
      }
    } else if (decision === DECISIONS.REJECT) {
      st.applications.splice(idx, 1);
      project.status = 'rejected';
      if (correct) {
        effects = { ethics: 8, scientificReputation: 2 };
        feedback = 'Hayvan kullanılmayan bir alternatif bulunduğunda Replacement ilkesi ' +
                   'gereği ret doğru karardır.';
      } else {
        effects = { ethics: -3, scientificReputation: -5 };
        feedback = 'Ret, düzeltmeyle giderilebilecek durumlar için orantısız bir karardır.';
      }
    }

    st.applyEffects(effects);
    this.decisionHistory.push({ projectId, decision, ideal, correct, day: st.day });
    this.bus.emit('ethics:decision', { project, decision, correct, feedback, effects, findings });
    return { ok: true, correct, feedback, effects, ideal, findings };
  }

  /** Düzeltme sonrası başvurunun yeniden gelmesi */
  dailyTick() {
    const st = this.state;
    for (const p of st.applications.filter((x) => x.status === 'revision')) {
      if (st.day - p.decisionDay < 7) continue;
      // Araştırmacı düzeltmeleri yapar (çoğunlukla)
      p.reductionPossible = false;
      p.refinementPossible = false;
      if (p.certificateStatus !== 'complete') p.certificateStatus = 'complete';
      if (!p.speciesJustification || p.speciesJustification.length < 12) {
        p.speciesJustification = 'Tür seçimi, önceki çalışmalarla karşılaştırılabilirlik ' +
                                 've model uygunluğu gerekçesiyle revize edilerek açıklanmıştır.';
      }
      if (p.housingConditions === 'single_unjustified') p.housingConditions = 'group_enriched';
      p.status = 'pending';
      p.animalNumber = Math.max(4, Math.round(p.animalNumber * 0.65));
      p.payment = Math.round(p.payment * 0.8);
      st.addLog(`Düzeltilmiş başvuru yeniden sunuldu: ${p.principalInvestigator}`);
      this.bus.emit('research:newApplication', p);
    }

    // Etik puanı refah ile birlikte kademeli hareket eder
    const drift = (st.animalWelfare - 50) * 0.01;
    st.ethics = clamp(st.ethics + drift);
  }
}
