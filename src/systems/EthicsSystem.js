import { clamp } from '../core/utils.js';

/**
 * ETİK KURUL (HADYEK) SİSTEMİ
 *
 * Kaynak: Bölüm 2, s. 30-31.
 * "HADYEK, yaptığı değerlendirme neticesinde uygun, düzeltilmesi gerekir,
 *  şartlı olarak uygun ya da uygun değildir şeklinde karar verir."
 *
 * Kararların değerlendirilmesinde kullanılan ölçütler, kitaptaki
 * "Yerel Etik Kurulların Çalışma İlkeleri" (s. 31) ve
 * "Etik Kurul Başvuruları" (s. 33-34) bölümlerine dayanır.
 */
export const DECISIONS = {
  APPROVE: 'UYGUN',
  REQUEST_REVISION: 'DÜZELTİLMESİ GEREKİR',
  CONDITIONAL: 'ŞARTLI OLARAK UYGUN',
  REJECT: 'UYGUN DEĞİLDİR'
};

export const DECISION_INFO = {
  [DECISIONS.APPROVE]: {
    label: 'UYGUN',
    desc: 'Başvuru etik açıdan uygun bulunur ve proje yürütülebilir.'
  },
  [DECISIONS.REQUEST_REVISION]: {
    label: 'DÜZELTİLMESİ GEREKİR',
    desc: 'Projede giderilmesi gereken eksiklikler vardır; düzeltildikten sonra tekrar değerlendirilir.'
  },
  [DECISIONS.CONDITIONAL]: {
    label: 'ŞARTLI OLARAK UYGUN',
    desc: 'Projenin yapılabilirliğini sınamak amacıyla az sayıda hayvan üzerinde ön deney ' +
          'yapılması istenir. Hayvan refahı birimi tarafından izlenip değerlendirildikten ' +
          'sonra uygun ya da uygun değildir şeklinde karara bağlanır.'
  },
  [DECISIONS.REJECT]: {
    label: 'UYGUN DEĞİLDİR',
    desc: 'Başvuru gerekçeli olarak reddedilir.'
  }
};

/** Kararlar başvuru tarihinden itibaren kırk iş günü içinde bildirilir (s. 30). */
export const DECISION_DEADLINE_DAYS = 40;

export class EthicsSystem {
  constructor(bus, state) {
    this.bus = bus;
    this.state = state;
    this.decisionHistory = [];
    this.lateDecisions = 0;
  }

  /**
   * HADYEK kurulma şartları — Bölüm 2, s. 28-29.
   * Çalışma izinli deney hayvanı ünitesi, hayvan refahı birimi ve
   * en az bir veteriner hekim zorunludur.
   */
  canEstablishHadyek() {
    const st = this.state;
    const req = {
      license: st.hasOperatingLicense,
      welfareUnit: st.hasWelfareUnit,
      veterinarian: st.staffOfRole('veterinarian').length > 0,
      administration: st.hasRoom('administration')
    };
    req.ok = Object.values(req).every(Boolean);
    return req;
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
   * İdeal karar — kitaptaki ilkelere göre:
   *  - Geçerliliği ispatlanmış alternatif yöntem varsa: UYGUN DEĞİLDİR
   *    ("alternatif yöntemlerin varlığı durumunda hayvan deneylerini etik olarak
   *     uygun görmemek", s. 31)
   *  - Giderilebilir eksiklik varsa: DÜZELTİLMESİ GEREKİR (s. 30)
   *  - Eksik yok ama yapılabilirlik sınanmamışsa: ŞARTLI OLARAK UYGUN (s. 30)
   *  - Aksi hâlde: UYGUN
   */
  idealDecision(project) {
    const findings = project.auditFindings();
    if (findings.some((f) => f.key === 'replacement')) return DECISIONS.REJECT;
    if (findings.length > 0) return DECISIONS.REQUEST_REVISION;
    if (project.needsPilot()) return DECISIONS.CONDITIONAL;
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

    // Kırk iş günü kuralı
    const waited = st.day - (project.submittedDay ?? st.day);
    const late = waited > DECISION_DEADLINE_DAYS;
    if (late) this.lateDecisions += 1;

    project.decisionDay = st.day;
    let effects = {};
    let feedback = '';

    if (decision === DECISIONS.APPROVE) {
      st.applications.splice(idx, 1);
      project.status = 'approved';
      st.projects.push(project);
      if (correct) {
        effects = { ethics: 3, scientificReputation: 3 };
        feedback = 'Başvuruda giderilmesi gereken bir eksiklik yoktu ve yapılabilirlik ' +
                   'yeterince desteklenmişti; "uygun" kararı yerindedir.';
      } else if (ideal === DECISIONS.CONDITIONAL) {
        effects = { ethics: -4, scientificReputation: -2 };
        feedback = 'Bu ölçekte bir çalışmada yapılabilirlik sınanmamıştı. Kurul, az sayıda ' +
                   'hayvanla ön deney istemek üzere "şartlı olarak uygun" kararı verebilirdi; ' +
                   'bu, Reduction ilkesi açısından daha koruyucu bir yoldur.';
      } else {
        const severe = findings.some((f) => f.severity === 'high');
        effects = severe
          ? { ethics: -14, scientificReputation: -8, animalWelfare: -4 }
          : { ethics: -7, scientificReputation: -3 };
        feedback = 'Bu başvuruda giderilmemiş bulgular vardı. Doğrudan onay, kurulun ' +
                   'denetleyici işlevini zayıflatır.';
      }
    } else if (decision === DECISIONS.CONDITIONAL) {
      project.status = 'conditional';
      project.conditionalDay = st.day;
      project.pilotAnimalNumber = Math.max(4, Math.round(project.animalNumber * 0.12));
      if (correct) {
        effects = { ethics: 6, scientificReputation: 3 };
        feedback = 'Yapılabilirliği sınanmamış bir çalışmada az sayıda hayvanla ön deney ' +
                   'istemek, hem Reduction ilkesine hem de kitaptaki "şartlı olarak uygun" ' +
                   'kararının amacına uygundur. Ön deney hayvan refahı birimince izlenecek.';
      } else if (ideal === DECISIONS.REJECT) {
        effects = { ethics: -6 };
        feedback = 'Geçerliliği ispatlanmış alternatif yöntem varken ön deney istemek ' +
                   'yeterli değildir; kurul çalışmayı etik olarak uygun görmemelidir.';
      } else if (ideal === DECISIONS.REQUEST_REVISION) {
        effects = { ethics: -3 };
        feedback = 'Başvuruda önce giderilmesi gereken eksiklikler vardı. Ön deney istemeden ' +
                   'önce "düzeltilmesi gerekir" kararı verilmeliydi.';
      } else {
        effects = { scientificReputation: -2 };
        feedback = 'Başvuru zaten uygundu; gereksiz ön deney talebi süreci uzatır ve ' +
                   'ek hayvan kullanımına yol açar.';
      }
    } else if (decision === DECISIONS.REQUEST_REVISION) {
      project.status = 'revision';
      project.revisionCount += 1;
      if (correct) {
        effects = { ethics: 5, scientificReputation: 2 };
        feedback = 'Düzeltme istemek, projeyi tamamen engellemeden eksikliklerin ' +
                   'giderilmesini sağlar. Düzeltilen projeler tekrar değerlendirilir.';
      } else if (ideal === DECISIONS.REJECT) {
        effects = { ethics: -6 };
        feedback = 'Geçerliliği ispatlanmış bir alternatif yöntem mevcutsa düzeltme yeterli ' +
                   'değildir; kurul çalışmayı etik olarak uygun görmemelidir.';
      } else {
        effects = { ethics: -2, scientificReputation: -2 };
        feedback = 'Başvuruda giderilecek bir bulgu yoktu; gereksiz düzeltme talebi süreci ' +
                   'uzatır ve araştırmacı ilişkilerini zedeler.';
      }
    } else if (decision === DECISIONS.REJECT) {
      st.applications.splice(idx, 1);
      project.status = 'rejected';
      if (correct) {
        effects = { ethics: 8, scientificReputation: 2 };
        feedback = 'Geçerliliği ispatlanmış alternatif yöntemlerin varlığı durumunda hayvan ' +
                   'deneyini etik olarak uygun görmemek, yerel etik kurulun çalışma ' +
                   'ilkelerinden biridir.';
      } else {
        effects = { ethics: -3, scientificReputation: -5 };
        feedback = 'Ret, düzeltmeyle ya da ön deneyle giderilebilecek durumlar için ' +
                   'orantısız bir karardır.';
      }
    }

    if (late) {
      effects.scientificReputation = (effects.scientificReputation ?? 0) - 4;
      feedback += ` Ayrıca karar, başvurudan ${waited} gün sonra verildi; kararların ` +
                  `kırk iş günü içinde bildirilmesi gerekir.`;
    }

    st.applyEffects(effects);
    this.decisionHistory.push({ projectId, decision, ideal, correct, day: st.day, late });
    this.bus.emit('ethics:decision', { project, decision, correct, feedback, effects, findings });
    return { ok: true, correct, feedback, effects, ideal, findings, late };
  }

  dailyTick() {
    const st = this.state;

    // Düzeltme sonrası yeniden sunulan başvurular
    for (const p of st.applications.filter((x) => x.status === 'revision')) {
      if (st.day - p.decisionDay < 7) continue;
      p.reductionPossible = false;
      p.refinementPossible = false;
      if (p.certificateStatus !== 'complete') p.certificateStatus = 'complete';
      if (!p.speciesJustification || p.speciesJustification.length < 12) {
        p.speciesJustification = 'Tür seçimi, mevcut literatürde geniş veri tabanının ' +
          'bulunması ve karşılaştırma imkânı sağlaması gerekçesiyle revize edilerek açıklanmıştır.';
      }
      if (!p.animalSource) p.animalSource = 'Kurum bünyesindeki çalışma izinli üretim ünitesi';
      if (!p.wasteDisposal) p.wasteDisposal = 'Tıbbi Atıkların Kontrolü Yönetmeliği kapsamında bertaraf';
      if (p.housingConditions === 'single_unjustified') p.housingConditions = 'group_enriched';
      p.status = 'pending';
      p.submittedDay = st.day;
      p.animalNumber = Math.max(4, Math.round(p.animalNumber * 0.65));
      p.payment = Math.round(p.payment * 0.8);
      st.addLog(`Düzeltilmiş başvuru yeniden sunuldu: ${p.principalInvestigator}`);
      this.bus.emit('research:newApplication', p);
    }

    // Şartlı olarak uygun bulunan projelerde ön deney süreci
    // "hayvan refahı birimi tarafından izlenip, istenen şartların yerine getirilip
    //  getirilmediği değerlendirildikten sonra uygun ya da uygun değildir şeklinde
    //  karara bağlanır" (s. 30)
    for (const p of st.applications.filter((x) => x.status === 'conditional')) {
      if (st.day - p.conditionalDay < 14) continue;
      const monitored = st.hasWelfareUnit && st.animalWelfare > 45;
      if (monitored) {
        p.status = 'pending';
        p.pilotCompleted = true;
        p.submittedDay = st.day;
        p.animalNumber = Math.max(4, Math.round(p.animalNumber * 0.8));
        st.addLog(`Ön deney tamamlandı, başvuru yeniden kurulda: ${p.principalInvestigator}`, 'good');
        this.bus.emit('research:newApplication', p);
      } else {
        const i = st.applications.indexOf(p);
        st.applications.splice(i, 1);
        p.status = 'rejected';
        st.adjust('ethics', -2);
        st.addLog('Ön deney izlenemediği için başvuru uygun değildir olarak sonuçlandı.', 'warn');
      }
    }

    const drift = (st.animalWelfare - 50) * 0.01;
    st.ethics = clamp(st.ethics + drift);
  }
}
