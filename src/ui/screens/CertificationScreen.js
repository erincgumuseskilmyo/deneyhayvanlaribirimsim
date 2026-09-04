import { el, kv } from '../dom.js';
import { money } from '../../core/utils.js';
import { COURSE_MODULES, COURSE_ECONOMY, TOTAL_THEORY_HOURS, TOTAL_PRACTICE_HOURS } from '../../data/courseModules.js';

const REQ_LABELS = {
  classroom: 'Eğitim Sınıfı', animalRoom: 'Hayvan Odası',
  veterinarian: 'Veteriner Hekim', reputation: 'Bilimsel itibar ≥ 45',
  welfare: 'Hayvan refahı ≥ 55'
};

export function certificationScreen(state, systems, bus, modal) {
  const st = state;
  const sys = systems.certification;
  const wrap = el('div');

  wrap.append(el('p', { class: 'hint', text:
    `Program ${TOTAL_THEORY_HOURS} saat teori + ${TOTAL_PRACTICE_HOURS} saat uygulama olarak ` +
    `modellenmiştir. Final sınavında ${COURSE_ECONOMY.passMark} ve üzeri CERTIFIED, altı FAILED sayılır.` }));

  const req = sys.requirements();
  wrap.append(el('h3', { text: 'Program Koşulları' }));
  for (const [k, v] of Object.entries(req)) {
    if (k === 'ok') continue;
    wrap.append(el('div', { class: 'kv' }, [
      el('span', { text: REQ_LABELS[k] }),
      el('span', { class: `tag ${v ? 'good' : 'bad'}`, text: v ? 'Sağlandı' : 'Eksik' })
    ]));
  }

  wrap.append(el('h3', { text: 'Müfredat' }));
  const table = el('table', { class: 'mini' }, [
    el('tr', {}, [el('th', { text: 'Modül' }), el('th', { text: 'Teori' }), el('th', { text: 'Uygulama' })])
  ]);
  for (const m of COURSE_MODULES) {
    table.append(el('tr', {}, [
      el('td', { text: m.name }), el('td', { text: `${m.theory} s` }), el('td', { text: `${m.practice} s` })
    ]));
  }
  table.append(el('tr', {}, [
    el('th', { text: 'Toplam' }),
    el('th', { text: `${TOTAL_THEORY_HOURS} s` }),
    el('th', { text: `${TOTAL_PRACTICE_HOURS} s` })
  ]));
  wrap.append(table);

  wrap.append(el('h3', { text: 'Yeni Program Aç' }));
  wrap.append(kv('Eğitim kalitesi (0-1)', sys.courseQuality().toFixed(2)));
  wrap.append(kv('Kursiyer başına ücret', money(COURSE_ECONOMY.tuitionPerStudent)));
  wrap.append(kv('Kursiyer başına maliyet', money(COURSE_ECONOMY.costPerStudent)));

  const input = el('input', {
    type: 'number', value: '12',
    min: String(COURSE_ECONOMY.minStudents), max: String(COURSE_ECONOMY.maxStudents),
    style: 'width:80px;padding:5px;border:1px solid #d3d9e2;border-radius:6px'
  });
  wrap.append(el('div', { class: 'modal-actions' }, [
    el('span', { text: 'Kursiyer sayısı:' }), input,
    el('button', {
      class: 'primary', disabled: req.ok ? null : 'disabled',
      onClick: () => {
        const res = sys.openCourse(Number(input.value));
        modal.close();
        setTimeout(() => {
          if (res.ok) {
            modal.show({
              title: 'Sertifika Programı Açıldı',
              body: `<p>${res.course.studentCount} kursiyerle program başladı. ` +
                    `Program ${COURSE_ECONOMY.durationDays} gün sürecek.</p>`,
              knowledge: 'certificate'
            });
          } else {
            bus.emit('notify', { text: res.reason, level: 'bad' });
          }
        }, 60);
      }
    }, 'Programı aç')
  ]));

  if (st.courses.length) {
    wrap.append(el('h3', { text: 'Programlar' }));
    for (const c of [...st.courses].reverse()) {
      const item = el('div', { class: 'list-item' }, [
        el('h4', { text: `Dönem — Gün ${c.startDay} · ${c.studentCount} kursiyer` }),
        el('div', {}, [
          el('span', { class: 'tag', text: `Teori ${c.theoryHoursDone.toFixed(0)}/${c.totalTheory} s` }),
          el('span', { class: 'tag', text: `Uygulama ${c.practiceHoursDone.toFixed(0)}/${c.totalPractice} s` }),
          el('span', { class: 'tag', text: `Kalite ${c.quality.toFixed(2)}` })
        ])
      ]);
      if (c.results) {
        item.append(el('div', {}, [
          el('span', { class: 'tag good', text: `CERTIFIED: ${c.results.certified}` }),
          el('span', { class: 'tag bad', text: `FAILED: ${c.results.failed}` }),
          el('span', { class: 'tag', text: `Ort. puan ${Math.round(c.results.scores.reduce((a, b) => a + b, 0) / c.results.scores.length)}` })
        ]));
      } else {
        item.append(el('span', { class: 'tag warn', text: `İlerleme %${Math.round(c.progress * 100)}` }));
      }
      wrap.append(item);
    }
  }

  wrap.append(modal.knowledgeCard('certificate'));
  return wrap;
}
