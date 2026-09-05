import { $, el, clear, kv } from './dom.js';
import { money, round, avg } from '../core/utils.js';
import { CAGE_LIST } from '../data/cages.js';
import { roomCorridorAccess } from '../systems/CorridorSystem.js';
import { getSpecies } from '../data/species.js';

/**
 * Sağ panel: seçili odanın detayları ve oda üzerinden yapılan işlemler.
 */
export class DetailPanel {
  constructor(state, systems, bus, modal) {
    this.state = state;
    this.sys = systems;
    this.bus = bus;
    this.modal = modal;
    this.title = $('#detail-title');
    this.body = $('#detail-body');
    this.selectedRoomId = null;
    bus.on('facility:changed', () => this.render());
    this.render();
  }

  select(roomId) {
    this.selectedRoomId = roomId;
    this._sig = null;   // seçim değişti: her hâlükârda yeniden çiz
    this.render();
  }

  /** Panelin görünen içeriğini özetleyen imza — gereksiz yeniden çizimi engeller. */
  signature() {
    const st = this.state;
    const room = st.roomById(this.selectedRoomId);
    if (!room) {
      return ['facility', st.rooms.length, st.cages.length, st.livingAnimals.length,
        st.staff.length, Math.round(st.hygiene), st.colonyStatus, st.hasOperatingLicense,
        st.hadyekEstablished, Math.round(this.sys.biosecurity.pestPressure),
        Math.round(this.sys.biosecurity.wasteBacklog), st.log[0]?.text ?? '',
        st.unlockedSpecies.size].join('|');
    }
    const animals = st.animalsInRoom(room.id);
    const access = roomCorridorAccess(st, room);
    return ['room', room.id, access.clean, access.dirty, Math.round(room.temperature), Math.round(room.humidity),
      Math.round(room.ventilation), Math.round(room.hygiene), Math.round(room.noise),
      room.quarantined, room.operational, room.diseaseLevel > 0,
      st.cagesInRoom(room.id).length, animals.length,
      animals.filter((a) => a.reproductiveStatus === 'pregnant').length,
      animals.filter((a) => a.diseased).length, st.unlockedSpecies.size].join('|');
  }

  render() {
    const sig = this.signature();
    if (sig === this._sig) return;
    this._sig = sig;

    const st = this.state;
    clear(this.body);
    const room = st.roomById(this.selectedRoomId);

    if (!room) {
      this.title.textContent = 'Tesis Özeti';
      this.renderFacilitySummary();
      return;
    }

    this.title.textContent = room.name;
    const animals = st.animalsInRoom(room.id);
    const cages = st.cagesInRoom(room.id);

    this.body.append(el('p', { class: 'hint', text: room.def.desc }));

    this.body.append(el('h3', { text: 'Fiziki Koşullar' }));
    this.body.append(kv('Sıcaklık', `${round(room.temperature, 1)} °C`));
    this.body.append(kv('Bağıl nem', `%${round(room.humidity, 0)}`));
    this.body.append(kv('Havalandırma', `${round(room.ventilation, 0)}/100`));
    this.body.append(kv('Hijyen', `${round(room.hygiene, 0)}/100`));
    this.body.append(kv('Gürültü', `${round(room.noise, 0)}/100`));
    this.body.append(kv('Durum', room.quarantined ? 'KARANTİNA'
      : !room.operational ? 'KAPALI' : room.diseaseLevel > 0 ? 'HASTALIK ŞÜPHESİ' : 'Normal'));

    // Koridor bağlantısı: bariyerli yetiştirmede oda hem temiz hem kirli
    // koridora açılmalıdır (Bölüm 3, s. 52).
    const access = roomCorridorAccess(st, room);
    this.body.append(kv('Koridor', [
      access.clean ? 'temiz ✓' : 'temiz ✗',
      access.dirty ? 'kirli ✓' : 'kirli ✗'
    ].join(' · ')));
    if (room.def.capacity > 0 && !access.barrierCompliant) {
      this.body.append(el('p', {
        class: 'hint',
        text: access.any
          ? 'Bariyerli yetiştirme için odanın diğer kenarına da eksik koridor tipi döşenmeli (s. 52).'
          : 'Oda hiçbir koridora açılmıyor; malzeme ve kafes taşınması güçleştiği için bakım aksıyor (s. 50).'
      }));
    }

    if (room.def.capacity > 0) {
      this.body.append(el('h3', { text: 'Kafesler ve Hayvanlar' }));
      this.body.append(kv('Kafes', `${cages.length} / ${room.def.capacity}`));
      this.body.append(kv('Hayvan', animals.length));
      if (animals.length) {
        this.body.append(kv('Tür', getSpecies(room.species ?? animals[0].species).name));
        this.body.append(kv('Ort. refah', round(avg(animals, (a) => a.welfare), 0)));
        this.body.append(kv('Ort. sağlık', round(avg(animals, (a) => a.health), 0)));
        this.body.append(kv('Gebe', animals.filter((a) => a.reproductiveStatus === 'pregnant').length));
        this.body.append(kv('Hasta', animals.filter((a) => a.diseased).length));
        const stock = animals.filter((a) => a.experimentalStatus === 'stock' && a.isMature);
        this.body.append(kv('Satılabilir stok', stock.length));
      }

      this.body.append(el('h3', { text: 'Kafes Al' }));
      for (const c of CAGE_LIST) {
        const blocked = c.requiresRoom && c.requiresRoom !== room.type;
        this.body.append(el('button', {
          class: 'wide build-item', disabled: blocked ? 'disabled' : null,
          title: c.desc,
          onClick: () => this.buyCages(room.id, c.id)
        }, [
          el('span', { text: `${c.name} ×5` }),
          el('small', { text: blocked ? 'Bu odaya kurulamaz' : `${money(c.cost * 5)} · refah +${c.welfareBonus} · biyogüvenlik +${c.biosecurityBonus}` })
        ]));
      }

      this.body.append(el('h3', { text: 'Koloni' }));
      for (const spId of st.unlockedSpecies) {
        const sp = getSpecies(spId);
        const allowed = room.def.allowedSpecies.includes(spId);
        this.body.append(el('button', {
          class: 'wide build-item', disabled: allowed ? null : 'disabled',
          onClick: () => this.foundColony(room.id, spId)
        }, [
          el('span', { text: `${sp.name} kolonisi kur (4 grup)` }),
          el('small', { text: allowed ? `${money(Math.round(sp.salePrice * 1.4) * 12)} · 12 birey` : 'Bu oda bu türü barındıramaz' })
        ]));
      }

      if (animals.some((a) => a.experimentalStatus === 'stock' && a.isMature)) {
        this.body.append(el('h3', { text: 'Satış' }));
        this.body.append(el('button', {
          class: 'wide', onClick: () => this.sellStock(room.id)
        }, 'Olgun stok hayvanları devret'));
      }
    }

    this.body.append(el('h3', { text: 'Oda İşlemleri' }));
    if (room.quarantined) {
      this.body.append(el('button', {
        class: 'wide', onClick: () => { room.quarantined = false; this.bus.emit('facility:changed'); }
      }, 'Karantinayı kaldır'));
    }
    this.body.append(el('button', {
      class: 'wide', onClick: () => this.deepClean(room.id)
    }, `Derin temizlik (${money(4000 + cages.length * 250)})`));
    this.body.append(el('button', {
      class: 'wide danger', onClick: () => this.demolish(room.id)
    }, 'Odayı yık'));
  }

  renderFacilitySummary() {
    const st = this.state;
    const animals = st.livingAnimals;
    this.body.append(kv('Oda', st.rooms.length));
    this.body.append(kv('Kafes', st.cages.length));
    this.body.append(kv('Hayvan', animals.length));
    this.body.append(kv('Personel', st.staff.length));
    this.body.append(kv('Hijyen', Math.round(st.hygiene)));
    this.body.append(kv('Barındırma statüsü', {
      conventional: 'Konvansiyonel', barrier: 'Bariyerli yetiştirme'
    }[st.colonyStatus]));
    this.body.append(kv('Biyogüvenlik seviyesi', `BGS-${st.biosafetyLevel}`));
    this.body.append(kv('Hayvan refahı birimi', st.hasWelfareUnit ? 'VAR' : 'YOK'));
    this.body.append(kv('Çalışma izni', st.hasOperatingLicense ? 'VAR' : 'YOK'));
    this.body.append(kv('HADYEK', st.hadyekEstablished ? 'Kuruldu' : 'Kurulmadı'));
    this.body.append(kv('Pest baskısı', Math.round(this.sys.biosecurity.pestPressure)));
    this.body.append(kv('Atık birikimi', Math.round(this.sys.biosecurity.wasteBacklog)));

    this.body.append(el('h3', { text: 'Hızlı İşlemler' }));
    if (!st.hasOperatingLicense) {
      this.body.append(el('button', { class: 'wide primary', onClick: () => this.applyLicense() },
        'Çalışma izni başvurusu'));
    }
    if (st.hasOperatingLicense && !st.hadyekEstablished) {
      this.body.append(el('button', { class: 'wide primary', onClick: () => this.establishHadyek() },
        'HADYEK kur'));
    }
    this.body.append(el('button', { class: 'wide', onClick: () => this.pestControl() },
      'Pest kontrol uygula'));
    this.body.append(el('button', { class: 'wide', onClick: () => this.clearWaste() },
      'Atıkları bertaraf et'));

    this.body.append(el('h3', { text: 'Son Olaylar' }));
    for (const l of st.log.slice(0, 8)) {
      this.body.append(el('div', { class: 'list-item' }, [
        el('span', { class: `tag ${l.level === 'good' ? 'good' : l.level === 'bad' ? 'bad' : l.level === 'warn' ? 'warn' : ''}`, text: `G${l.day}` }),
        l.text
      ]));
    }
  }

  // --- işlemler ---

  _result(res, okMessage) {
    if (res.ok) this.bus.emit('notify', { text: okMessage, level: 'good' });
    else this.bus.emit('notify', { text: res.reason ?? 'İşlem yapılamadı.', level: 'bad' });
    this.bus.emit('facility:changed');
    return res;
  }

  buyCages(roomId, cageType) {
    const res = this.sys.facility.buyCages(roomId, cageType, 5);
    this._result(res, `${res.count ?? 0} kafes eklendi.`);
  }

  foundColony(roomId, speciesId) {
    const res = this.sys.facility.foundColony(roomId, speciesId, 4);
    if (res.ok) {
      this.modal.show({
        title: 'Koloni Kuruldu',
        body: `<p>${res.count} birey tesise kabul edildi. Yeni gelen hayvanlar için karantina ve
               sağlık takibi biyogüvenliğin ilk basamağıdır.</p>`,
        knowledge: 'quarantine'
      });
    }
    this._result(res, 'Koloni kuruldu.');
  }

  sellStock(roomId) {
    const st = this.state;
    const ids = st.animalsInRoom(roomId)
      .filter((a) => a.experimentalStatus === 'stock' && a.isMature)
      .map((a) => a.id);
    const res = this.sys.economy.sellAnimals(ids);
    if (res.ok) {
      this.modal.show({
        title: 'Hayvan Devri',
        body: `<p>${res.count} hayvan devredildi, ${money(res.amount)} gelir elde edildi.</p>`,
        knowledge: 'records'
      });
    }
    this._result(res, `${res.count ?? 0} hayvan devredildi.`);
  }

  deepClean(roomId) {
    const st = this.state;
    const cages = st.cagesInRoom(roomId);
    const cost = 4000 + cages.length * 250;
    if (!st.canAfford(cost)) {
      return this._result({ ok: false, reason: 'Yetersiz bütçe.' });
    }
    st.spend(cost, 'Derin temizlik', 'maintenance');
    for (const c of cages) c.clean();
    const room = st.roomById(roomId);
    room.hygiene = 98;
    room.diseaseLevel = Math.max(0, room.diseaseLevel - 12);
    st.adjust('biosecurity', 2);
    this._result({ ok: true }, 'Derin temizlik tamamlandı.');
  }

  demolish(roomId) {
    const res = this.sys.facility.demolishRoom(roomId);
    if (res.ok) this.selectedRoomId = null;
    this._result(res, `Oda yıkıldı. ${money(res.refund ?? 0)} geri kazanıldı.`);
  }

  applyLicense() {
    const res = this.sys.facility.applyForLicense();
    if (!res.ok && res.req) {
      const missing = Object.entries(res.req)
        .filter(([k, v]) => k !== 'ok' && !v)
        .map(([k]) => LICENSE_LABELS[k]);
      this.modal.show({
        title: 'Çalışma İzni — Eksikler',
        body: `<p>Başvuru için şu koşullar eksik:</p><ul>${missing.map((m) => `<li>${m}</li>`).join('')}</ul>`,
        knowledge: 'biosecurity'
      });
      return;
    }
    if (res.ok) {
      this.modal.show({
        title: 'Çalışma İzni Alındı',
        body: '<p>Tesis artık deney hayvanı üretimi ve kullanımı için izinlidir. ' +
              'Sıradaki adım yerel etik kurulun (HADYEK) kurulmasıdır.</p>',
        knowledge: 'ethics_committee'
      });
    }
    this._result(res, 'Çalışma izni alındı.');
  }

  establishHadyek() {
    const res = this.sys.ethics.establishHadyek();
    if (!res.ok && res.check) {
      const missing = Object.entries(res.check)
        .filter(([k, v]) => k !== 'ok' && !v)
        .map(([k]) => HADYEK_LABELS[k]);
      this.modal.show({
        title: 'HADYEK — Eksikler',
        body: `<ul>${missing.map((m) => `<li>${m}</li>`).join('')}</ul>`,
        knowledge: 'ethics_committee'
      });
      return;
    }
    if (res.ok) {
      this.modal.show({
        title: 'HADYEK Kuruldu',
        body: '<p>Artık araştırma başvuruları tesise gelmeye başlayacak. ' +
              'Her başvuruyu 3R ilkeleri açısından değerlendireceksiniz.</p>',
        knowledge: 'three_r'
      });
    }
    this._result(res, 'HADYEK kuruldu.');
  }

  pestControl() {
    const res = this.sys.biosecurity.runPestControl();
    if (res.ok) this.modal.show({ title: 'Pest Kontrolü', body: '<p>Uygulama tamamlandı.</p>', knowledge: 'pest' });
    this._result(res, 'Pest kontrolü uygulandı.');
  }

  clearWaste() {
    const res = this.sys.biosecurity.clearWaste();
    if (res.ok) this.modal.show({ title: 'Atık Bertarafı', body: '<p>Atıklar sınıflandırılarak bertaraf edildi.</p>', knowledge: 'waste' });
    this._result(res, 'Atıklar bertaraf edildi.');
  }
}

const LICENSE_LABELS = {
  animalRoom: 'Hayvan Odası', changing: 'Giyinme / Geçiş Odası',
  cleaning: 'Temizlik / Yıkama Alanı', quarantine: 'Karantina Odası',
  utility: 'Teknik Oda', veterinarian: 'En az bir Veteriner Hekim',
  caretaker: 'En az bir Hayvan Bakıcısı'
};
const HADYEK_LABELS = {
  administration: 'İdari Oda', veterinarian: 'Veteriner Hekim', license: 'Çalışma izni'
};
