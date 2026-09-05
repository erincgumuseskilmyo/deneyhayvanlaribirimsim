import { el, kv } from '../dom.js';
import { money } from '../../core/utils.js';
import { WELFARE_WEIGHTS } from '../../systems/WelfareSystem.js';

const TYPE_LABELS = {
  construction: 'İnşaat', cage: 'Kafes', operating: 'İşletme (yem/su/altlık/elektrik/bakım)',
  salary: 'Maaş', staff: 'Personel işlemleri', veterinary: 'Veteriner',
  biosecurity: 'Biyogüvenlik', training: 'Eğitim gideri', admin: 'İdari',
  genetics: 'Genetik', expansion: 'Genişleme', event: 'Olay',
  animal_purchase: 'Hayvan alımı', maintenance: 'Bakım',
  animal_sales: 'Hayvan satışı', research: 'Araştırma projeleri',
  certification: 'Sertifika programı', facility_usage: 'Tesis kullanımı'
};

export function reportScreen(state, systems, bus, modal) {
  const st = state;
  const wrap = el('div');
  const rep = systems.report;

  const section = (title, data) => {
    wrap.append(el('h3', { text: title }));
    if (!data) { wrap.append(el('p', { class: 'hint', text: 'Henüz veri yok.' })); return; }
    wrap.append(kv('Gelir', money(data.totalIncome)));
    wrap.append(kv('Gider', money(data.totalExpense)));
    wrap.append(kv('Net', money(data.net)));
    wrap.append(kv('Ort. refah', data.avgWelfare));
    wrap.append(kv('Ort. biyogüvenlik', data.avgBiosecurity));
    wrap.append(kv('Hayvan sayısı değişimi', data.animalDelta > 0 ? `+${data.animalDelta}` : data.animalDelta));
    const rows = Object.entries(data.byType).sort((a, b) => a[1] - b[1]);
    if (rows.length) {
      const table = el('table', { class: 'mini' }, [
        el('tr', {}, [el('th', { text: 'Kalem' }), el('th', { text: 'Tutar' })])
      ]);
      for (const [type, amount] of rows) {
        table.append(el('tr', {}, [
          el('td', { text: TYPE_LABELS[type] ?? type }),
          el('td', { text: money(amount) })
        ]));
      }
      wrap.append(table);
    }
  };

  wrap.append(el('h3', { text: 'Günlük Durum' }));
  const d = rep.daily ?? rep.snapshot();
  wrap.append(kv('Hayvan', d.animals));
  wrap.append(kv('Gebe', d.pregnant));
  wrap.append(kv('Hasta', d.diseased));
  wrap.append(kv('Ortalama sağlık', d.meanHealth));
  wrap.append(kv('Hijyen', d.hygiene));
  wrap.append(kv('Yürüyen proje', d.runningProjects));
  wrap.append(kv('Bekleyen başvuru', d.pendingApplications));

  const costs = systems.economy.today;
  if (costs) {
    wrap.append(el('h3', { text: 'Bugünkü Gider Dağılımı' }));
    const table = el('table', { class: 'mini' }, [
      el('tr', {}, [el('th', { text: 'Kalem' }), el('th', { text: 'Tutar' })])
    ]);
    const labels = {
      food: 'Yem', water: 'Su', bedding: 'Altlık', maintenance: 'Bakım',
      electricity: 'Elektrik', vet: 'Veteriner', biosecurity: 'Biyogüvenlik', tech: 'Teknoloji idamesi'
    };
    for (const [k, v] of Object.entries(costs)) {
      table.append(el('tr', {}, [el('td', { text: labels[k] ?? k }), el('td', { text: money(v) })]));
    }
    wrap.append(table);
  }

  section('Haftalık Rapor', rep.weekly);
  section('Aylık Rapor', rep.monthly);

  // Refah bileşen kırılımı — eğitsel açıdan en önemli tablo
  const wb = systems.welfare.lastBreakdown;
  if (wb) {
    wrap.append(el('h3', { text: 'Refah Bileşenleri (ortalama, 0-1)' }));
    const labels = {
      food: 'Yem', water: 'Su', environment: 'Sıcaklık/nem/havalandırma/gürültü',
      density: 'Kafes yoğunluğu', cleanliness: 'Temizlik', enrichment: 'Zenginleştirme',
      staffing: 'Personel yeterliliği', health: 'Sağlık'
    };
    const table = el('table', { class: 'mini' }, [
      el('tr', {}, [el('th', { text: 'Faktör' }), el('th', { text: 'Değer' }), el('th', { text: 'Ağırlık' })])
    ]);
    for (const [k, v] of Object.entries(wb)) {
      table.append(el('tr', {}, [
        el('td', { text: labels[k] ?? k }),
        el('td', { text: v.toFixed(2) }),
        el('td', { text: `%${Math.round(WELFARE_WEIGHTS[k] * 100)}` })
      ]));
    }
    wrap.append(table);
    wrap.append(modal.knowledgeCard('welfare_five'));
  }

  wrap.append(el('h3', { text: 'Anlık Skor' }));
  const b = systems.scoring.breakdown();
  wrap.append(kv('Economic Score', Math.round(b.economic)));
  wrap.append(kv('Welfare Score', Math.round(b.welfare)));
  wrap.append(kv('Ethics Score', Math.round(b.ethics)));
  wrap.append(kv('Biosecurity Score', Math.round(b.biosecurity)));
  wrap.append(kv('Scientific Reputation', Math.round(b.reputation)));
  wrap.append(kv('Toplam', `${Math.round(systems.scoring.totalScore())} — ${systems.scoring.grade()}`));

  return wrap;
}
