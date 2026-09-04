import { ResearchProject } from '../entities/ResearchProject.js';
import { clamp } from '../core/utils.js';
import {
  PI_NAMES, STUDY_TYPES, PROCEDURE_POOL, SUBSTANCE_POOL,
  HOUSING_OPTIONS, TITLE_PARTS
} from '../data/researchTemplates.js';
import { getSpecies } from '../data/species.js';

/**
 * ARAŞTIRMA SİSTEMİ
 * Başvuru üretimi, onaylanan projelerin yürütülmesi ve ödemeler.
 */
export class ResearchSystem {
  constructor(bus, state, rng) {
    this.bus = bus;
    this.state = state;
    this.rng = rng;
  }

  /** Başvuru gelme olasılığı itibar ve tesis kapasitesine bağlı */
  applicationChance() {
    const st = this.state;
    if (!st.hadyekEstablished) return 0;
    let p = 0.05 + (st.scientificReputation / 100) * 0.18;
    if (st.hasRoom('experimental')) p += 0.06;
    if (st.hasRoom('administration')) p += 0.03;
    if (st.applications.length >= 5) p *= 0.25;
    return clamp(p, 0, 0.4);
  }

  generateApplication() {
    const st = this.state;
    const rng = this.rng;
    const species = rng.pick([...st.unlockedSpecies]);
    const sp = getSpecies(species);
    const studyType = rng.pick(STUDY_TYPES);
    const groups = rng.int(2, 5);
    const perGroup = rng.int(6, 16);

    // Kusur enjeksiyonu: başvuruların bir kısmı bilerek sorunlu üretilir
    const flawRoll = rng.next();
    const replacementAvailable = flawRoll < 0.14;
    const reductionPossible = rng.chance(0.32);
    const refinementPossible = rng.chance(0.34);
    const certificateStatus = rng.chance(0.2)
      ? (rng.chance(0.5) ? 'partial' : 'missing') : 'complete';

    const procedures = rng.shuffle(PROCEDURE_POOL).slice(0, rng.int(2, 4));
    const maxSeverity = Math.max(...procedures.map((p) => p.severity));
    const housing = rng.chance(0.18)
      ? HOUSING_OPTIONS.find((h) => h.id === 'single_unjustified')
      : rng.pick(HOUSING_OPTIONS.filter((h) => h.id !== 'single_unjustified'));

    const animalNumber = groups * perGroup * (reductionPossible ? 2 : 1);
    const title = `${rng.pick(TITLE_PARTS.prefix)} ${rng.pick(TITLE_PARTS.topic)} ` +
                  `${rng.pick(TITLE_PARTS.suffix)}`;

    const justificationTexts = [
      `${sp.name} bu model için literatürde yaygın kullanılan türdür ve önceki verilerle karşılaştırma imkânı sağlar.`,
      `Çalışılan fizyolojik yanıt ${sp.name} türünde tanımlanmış olduğundan bu tür seçilmiştir.`,
      '' // eksik gerekçe
    ];

    const project = new ResearchProject({
      title: title.charAt(0).toUpperCase() + title.slice(1),
      principalInvestigator: rng.pick(PI_NAMES),
      team: Array.from({ length: rng.int(2, 5) }, (_, i) => `Araştırmacı ${i + 1}`),
      certificateStatus,
      studyType: studyType.id,
      duration: rng.int(30, 120),
      purpose: `${studyType.name} kapsamında ${rng.pick(TITLE_PARTS.topic)} gözlenen değişimlerin incelenmesi.`,
      species,
      animalNumber,
      speciesJustification: rng.chance(0.75) ? rng.pick(justificationTexts.slice(0, 2)) : '',
      experimentalGroups: groups,
      procedures,
      housingConditions: housing.id,
      substances: rng.shuffle(SUBSTANCE_POOL).slice(0, rng.int(1, 3)),
      welfareRisk: maxSeverity,
      replacementAvailable,
      reductionPossible,
      refinementPossible,
      // Kitaptaki başvuru formunun diğer alanları (Bölüm 2, s. 33-34)
      animalSource: rng.chance(0.78)
        ? rng.pick([
            'Kurum bünyesindeki çalışma izinli deney hayvanı üretim ünitesi',
            'Tarım ve Orman Bakanlığından çalışma izinli tedarikçi kuruluş'
          ])
        : '',
      restrictions: rng.chance(0.7)
        ? rng.pick([
            'Çalışma süresince periyodik uygulama yapılacaktır.',
            'Uzun anestezi derinliği gerektiren aşama bulunmamaktadır.',
            'Deney süresince yem kısıtlaması uygulanacaktır.'
          ])
        : '',
      hazards: rng.chance(0.72)
        ? rng.pick([
            'Mikrobiyolojik kontaminasyon riski bulunmamaktadır.',
            'Kanserojen madde kullanımı nedeniyle çeker ocak kullanılacaktır.',
            'Biyolojik toksin kullanılmayacaktır.'
          ])
        : '',
      wasteDisposal: rng.chance(0.75)
        ? 'Oluşacak tıbbi atıklar, Tıbbi Atıkların Kontrolü Yönetmeliği kapsamında ' +
          'kırmızı torbalarda toplanarak bertaraf edilecektir.'
        : '',
      preliminaryDataAvailable: rng.chance(0.45),
      submittedDay: st.day
    });

    // Ödeme: hayvan sayısı, şiddet ve süreye bağlı
    project.payment = Math.round(
      project.animalNumber * sp.salePrice * 0.85 +
      project.duration * 220 +
      maxSeverity * 4200
    );

    st.applications.push(project);
    this.bus.emit('research:newApplication', project);
    st.addLog(`Yeni araştırma başvurusu: ${project.principalInvestigator}`);
    return project;
  }

  /** Onaylanmış projeyi başlatır: hayvan tahsisi yapar */
  startProject(project) {
    const st = this.state;
    const available = st.livingAnimals.filter(
      (a) => a.species === project.species && a.experimentalStatus === 'stock' && a.isMature
    );
    if (available.length < project.animalNumber) {
      project.status = 'approved'; // hayvan bekliyor
      return { ok: false, reason: `Yeterli stok hayvan yok (${available.length}/${project.animalNumber}).` };
    }
    const assigned = available.slice(0, project.animalNumber);
    for (const a of assigned) {
      a.experimentalStatus = 'in_study';
      project.assignedAnimals.push(a.id);
    }
    project.status = 'running';
    project.startDay = st.day;
    project.progress = 0;
    // Peşinat
    const advance = Math.round(project.payment * 0.4);
    st.earn(advance, `Proje avansı: ${project.title.slice(0, 30)}…`, 'research');
    st.addLog(`Proje başladı: ${project.title.slice(0, 40)}…`, 'good');
    return { ok: true };
  }

  dailyTick() {
    const st = this.state;

    // Yeni başvuru
    if (this.rng.chance(this.applicationChance())) this.generateApplication();

    // Bekleyen onaylı projeleri başlatmayı dene
    for (const p of st.projects.filter((x) => x.status === 'approved')) {
      this.startProject(p);
    }

    // Yürüyen projeler
    for (const p of st.projects.filter((x) => x.status === 'running')) {
      const speed = 100 / p.duration;
      // Refah kötüyse proje aksar
      const projectAnimals = p.assignedAnimals.map((id) => st.animalById(id)).filter((a) => a?.alive);
      const meanWelfare = projectAnimals.length
        ? projectAnimals.reduce((s, a) => s + a.welfare, 0) / projectAnimals.length : 50;
      const factor = clamp(0.4 + (meanWelfare / 100) * 0.8, 0.3, 1.2);
      p.progress = clamp(p.progress + speed * factor, 0, 100);

      if (meanWelfare < 35) p.welfareIncidents += 1;

      // Hayvan kaybı projeyi tehlikeye atar
      const lost = p.animalNumber - projectAnimals.length;
      if (lost > p.animalNumber * 0.35) {
        p.status = 'failed';
        st.adjust('scientificReputation', -8);
        st.adjust('ethics', -5);
        st.addLog(`Proje başarısız oldu (hayvan kaybı): ${p.title.slice(0, 35)}…`, 'bad');
        this.bus.emit('notify', { text: 'Bir proje hayvan kaybı nedeniyle sonlandırıldı.', level: 'bad' });
        continue;
      }

      if (p.progress >= 100) this.completeProject(p);
    }
  }

  completeProject(p) {
    const st = this.state;
    p.status = 'completed';
    const remaining = Math.round(p.payment * 0.6);

    // Bilimsel kalite: refah ve biyogüvenlikten etkilenir
    const quality = clamp(
      (st.animalWelfare * 0.45 + st.biosecurity * 0.35 + st.ethics * 0.2) / 100, 0.3, 1.15
    );
    const payout = Math.round(remaining * quality);
    st.earn(payout, `Proje ödemesi: ${p.title.slice(0, 30)}…`, 'research');

    let repGain = 6 * quality;
    if (p.welfareIncidents > 10) repGain -= 4;
    st.adjust('scientificReputation', repGain);

    // Kullanılan hayvanların akıbeti (görsel/grafik içerik yok, kayıt düzeyinde)
    for (const id of p.assignedAnimals) {
      const a = st.animalById(id);
      if (a?.alive) { a.alive = false; a.causeOfDeath = 'çalışma sonu'; a.experimentalStatus = 'completed'; }
    }

    st.addLog(`Proje tamamlandı: ${p.title.slice(0, 40)}… (+${payout} ₺)`, 'good');
    this.bus.emit('research:completed', p);
  }
}
