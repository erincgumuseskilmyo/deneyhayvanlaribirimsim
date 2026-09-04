import { nextId } from '../core/RNG.js';

/**
 * Araştırma başvurusu / onaylanmış proje.
 * Alan adları görev tanımındaki başvuru formunu birebir karşılar.
 */
export class ResearchProject {
  constructor(data = {}) {
    this.id = nextId('pr');
    this.title = data.title ?? 'Başlıksız çalışma';
    this.principalInvestigator = data.principalInvestigator ?? '—';
    this.team = data.team ?? [];
    this.certificateStatus = data.certificateStatus ?? 'complete'; // complete | partial | missing
    this.studyType = data.studyType ?? 'basic';
    this.duration = data.duration ?? 60;          // gün
    this.purpose = data.purpose ?? '';
    this.species = data.species ?? 'mouse';
    this.animalNumber = data.animalNumber ?? 20;
    this.speciesJustification = data.speciesJustification ?? '';
    this.experimentalGroups = data.experimentalGroups ?? 2;
    this.procedures = data.procedures ?? [];
    this.housingConditions = data.housingConditions ?? 'group_standard';
    this.substances = data.substances ?? [];
    this.welfareRisk = data.welfareRisk ?? 2;     // 1-5 (soyut şiddet göstergesi)
    this.replacementAvailable = data.replacementAvailable ?? false;
    this.reductionPossible = data.reductionPossible ?? false;
    this.refinementPossible = data.refinementPossible ?? false;

    // Süreç durumu
    this.status = 'pending'; // pending | revision | approved | rejected | running | completed | failed
    this.decisionDay = null;
    this.startDay = null;
    this.progress = 0;       // 0-100
    this.revisionCount = 0;
    this.payment = data.payment ?? 0;
    this.assignedAnimals = [];
    this.welfareIncidents = 0;
  }

  /** Bu başvurunun etik açıdan sorunlu yönleri (kural tabanlı denetim) */
  auditFindings() {
    const issues = [];
    if (this.certificateStatus !== 'complete') {
      issues.push({
        key: 'certificate', severity: 'high',
        text: 'Ekipte deney hayvanları kullanım sertifikası eksik kişi(ler) var.'
      });
    }
    if (this.replacementAvailable) {
      issues.push({
        key: 'replacement', severity: 'high',
        text: 'Amaca ulaşmak için hayvan kullanılmayan bir alternatif yöntem mevcut görünüyor (Replacement).'
      });
    }
    if (this.reductionPossible) {
      issues.push({
        key: 'reduction', severity: 'medium',
        text: 'Hayvan sayısı, belirtilen grup sayısı ve amaç için gereğinden fazla (Reduction).'
      });
    }
    if (this.refinementPossible) {
      issues.push({
        key: 'refinement', severity: 'medium',
        text: 'Ağrı/stres azaltıcı önlemler yetersiz tanımlanmış (Refinement).'
      });
    }
    if (!this.speciesJustification || this.speciesJustification.length < 12) {
      issues.push({
        key: 'species', severity: 'medium',
        text: 'Tür seçimi yeterince gerekçelendirilmemiş.'
      });
    }
    if (this.housingConditions === 'single_unjustified') {
      issues.push({
        key: 'housing', severity: 'high',
        text: 'Gerekçesiz bireysel barındırma öngörülmüş.'
      });
    }
    return issues;
  }

  /** Sorunsuz bir başvuru mu? */
  get isClean() { return this.auditFindings().length === 0; }

  /** Yalnızca düzeltme ile giderilebilir sorunlar mı var? */
  get isRevisable() {
    const f = this.auditFindings();
    return f.length > 0 && !f.some((i) => i.key === 'replacement');
  }
}
