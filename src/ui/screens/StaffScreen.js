import { el, kv } from '../dom.js';
import { money } from '../../core/utils.js';

export function staffScreen(state, systems, bus, modal) {
  const st = state;
  const wrap = el('div');

  wrap.append(el('p', { class: 'hint', text:
    'Personel kapasitesi hayvan sayısını karşılamıyorsa besleme, sulama ve temizlik aksar; ' +
    'refah ve biyogüvenlik birlikte düşer.' }));

  const load = systems.staff.workload();
  wrap.append(kv('İş yükü katsayısı', load.toFixed(2) + (load > 1 ? ' (kapasite aşıldı)' : '')));
  wrap.append(kv('Aylık maaş yükü', money(st.staff.reduce((s, m) => s + m.salary, 0))));

  wrap.append(el('h3', { text: `Mevcut Ekip (${st.staff.length})` }));
  if (!st.staff.length) wrap.append(el('p', { class: 'hint', text: 'Henüz personel yok.' }));
  for (const s of st.staff) {
    wrap.append(el('div', { class: 'list-item' }, [
      el('h4', { text: `${s.name} — ${s.def.name}` }),
      el('div', {}, [
        el('span', { class: 'tag', text: `Beceri ${s.skill}` }),
        el('span', { class: `tag ${s.fatigue > 65 ? 'bad' : s.fatigue > 40 ? 'warn' : 'good'}`, text: `Yorgunluk ${Math.round(s.fatigue)}` }),
        el('span', { class: 'tag', text: `Verim ${s.efficiency.toFixed(2)}` }),
        el('span', { class: 'tag', text: money(s.salary) + '/ay' })
      ]),
      el('button', {
        class: 'danger', onClick: () => {
          systems.staff.fire(s.id);
          modal.close();
          bus.emit('ui:openTab', 'staff');
        }
      }, 'İşten çıkar')
    ]));
  }

  wrap.append(el('h3', { text: 'Aday Havuzu' }));
  for (const c of systems.staff.candidates) {
    wrap.append(el('div', { class: 'list-item' }, [
      el('h4', { text: `${c.name} — ${c.def.name}` }),
      el('p', { class: 'hint', text: c.def.desc }),
      el('div', {}, [
        el('span', { class: 'tag', text: `Beceri ${c.skill}` }),
        el('span', { class: 'tag', text: `Deneyim ${Math.round(c.experience / 30)} ay` }),
        el('span', { class: 'tag', text: money(c.salary) + '/ay' })
      ]),
      el('button', {
        class: 'primary',
        disabled: st.canAfford(c.salary) ? null : 'disabled',
        onClick: () => {
          const res = systems.staff.hire(c.id);
          bus.emit('notify', {
            text: res.ok ? `${c.name} işe alındı.` : res.reason,
            level: res.ok ? 'good' : 'bad'
          });
          modal.close();
          bus.emit('ui:openTab', 'staff');
        }
      }, `İşe al (peşin ${money(c.salary)})`)
    ]));
  }

  return wrap;
}
