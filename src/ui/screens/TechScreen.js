import { el, kv } from '../dom.js';
import { money } from '../../core/utils.js';
import { TECH_LIST } from '../../data/tech.js';
import { SPECIES_LIST } from '../../data/species.js';

export function techScreen(state, systems, bus, modal) {
  const st = state;
  const wrap = el('div');

  wrap.append(el('h3', { text: 'Türler' }));
  for (const sp of SPECIES_LIST) {
    const unlocked = st.unlockedSpecies.has(sp.id);
    wrap.append(el('div', { class: 'list-item' }, [
      el('h4', { text: `${sp.name} (${sp.latin})` }),
      el('p', { class: 'hint', text: sp.facts[0] }),
      el('div', {}, [
        el('span', { class: 'tag', text: `Optimum ${sp.tempOptimum[0]}-${sp.tempOptimum[1]} °C` }),
        el('span', { class: 'tag', text: `Nem %${sp.humidityOptimum[0]}-${sp.humidityOptimum[1]}` }),
        el('span', { class: 'tag', text: `Kafes başına ≤ ${sp.perCageCapacity}` })
      ]),
      unlocked
        ? el('span', { class: 'tag good', text: 'Açık' })
        : el('button', {
            class: 'primary',
            onClick: () => {
              const res = systems.facility.unlockSpecies(sp.id);
              bus.emit('notify', { text: res.ok ? `${sp.name} açıldı.` : res.reason, level: res.ok ? 'good' : 'bad' });
              modal.close();
              bus.emit('ui:openTab', 'tech');
            }
          }, `Aç — ${money(sp.unlockCost)}`)
    ]));
  }

  wrap.append(el('h3', { text: 'Teknoloji Ağacı' }));
  for (const t of TECH_LIST) {
    if (t.id === 'standard_colony') continue;
    const unlocked = st.unlockedTech.has(t.id);
    const check = systems.facility.canUnlockTech(t.id);
    wrap.append(el('div', { class: 'list-item' }, [
      el('h4', { text: t.name }),
      el('p', { class: 'hint', text: t.desc }),
      el('div', {}, [
        el('span', { class: 'tag', text: money(t.cost) }),
        el('span', { class: 'tag', text: `Aylık ${money(t.upkeep)}` })
      ]),
      unlocked
        ? el('span', { class: 'tag good', text: 'Devrede' })
        : el('button', {
            class: 'primary', disabled: check.ok ? null : 'disabled',
            title: check.ok ? '' : check.reason,
            onClick: () => {
              const res = systems.facility.unlockTech(t.id);
              modal.close();
              setTimeout(() => {
                if (res.ok && (t.id === 'spf_facility' || t.id === 'germ_free')) {
                  modal.show({ title: t.name, body: `<p>${t.desc}</p>`, knowledge: 'spf' });
                } else if (res.ok && t.id === 'ivc_system') {
                  modal.show({ title: t.name, body: `<p>${t.desc}</p>`, knowledge: 'ivc' });
                } else if (!res.ok) {
                  bus.emit('notify', { text: res.reason, level: 'bad' });
                }
              }, 60);
            }
          }, check.ok ? 'Satın al' : check.reason)
    ]));
  }

  // Genetik işlemler
  if (st.unlockedTech.has('genetics_unit')) {
    wrap.append(el('h3', { text: 'Genetik İşlemler' }));
    wrap.append(el('p', { class: 'hint', text:
      'Bu bölüm gerçek laboratuvar protokolü öğretmez; hat kurma ve genotiplendirme ' +
      'stratejik bir soyutlama olarak modellenmiştir.' }));
    wrap.append(kv('Bekleyen genotiplendirme', systems.genetics.genotypingBacklog));
    wrap.append(el('button', {
      class: 'wide', onClick: () => {
        const res = systems.genetics.runGenotyping();
        bus.emit('notify', { text: res.ok ? `${res.count} örnek işlendi.` : res.reason, level: res.ok ? 'good' : 'bad' });
        modal.close(); bus.emit('ui:openTab', 'tech');
      }
    }, 'Genotiplendirme yap'));

    const lines = systems.genetics.availableLines();
    if (lines.length) {
      const roomsWithStock = st.rooms.filter((r) =>
        st.cagesInRoom(r.id).some((c) => st.animalsInCage(c.id).some((a) => a.experimentalStatus === 'stock')));
      for (const line of lines) {
        for (const room of roomsWithStock.slice(0, 3)) {
          const cage = st.cagesInRoom(room.id)
            .find((c) => st.animalsInCage(c.id).some((a) => a.experimentalStatus === 'stock'));
          if (!cage) continue;
          wrap.append(el('button', {
            class: 'wide', onClick: () => {
              const res = systems.genetics.establishLine(cage.id, line);
              modal.close();
              setTimeout(() => modal.show({
                title: 'Genetik Hat',
                body: `<p>${res.ok ? res.message : res.reason}</p>`,
                knowledge: 'gm_animals'
              }), 60);
            }
          }, `${line} hattı kur — ${room.name}`));
        }
      }
    }
  }

  return wrap;
}
