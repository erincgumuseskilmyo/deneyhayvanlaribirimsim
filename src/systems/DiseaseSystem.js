import { clamp } from '../core/utils.js';

/**
 * HASTALIK SİSTEMİ
 * Salgın olasılığı rastgele değil, tesis koşullarına bağlıdır:
 * hijyen, biyogüvenlik, kafes yoğunluğu, karantina varlığı, pest baskısı.
 */
export const OUTBREAK_OPTIONS = [
  {
    id: 'quarantine', label: 'Karantinaya al',
    desc: 'Etkilenen odayı izole et, giriş çıkışı durdur.',
    requiresRoom: 'quarantine'
  },
  {
    id: 'vet', label: 'Veteriner incelemesi',
    desc: 'Tanı için veteriner hekim değerlendirmesi iste.',
    requiresStaff: 'veterinarian'
  },
  {
    id: 'continue', label: 'Üretime devam et',
    desc: 'Şimdilik müdahale etme, üretimi aksatma.'
  },
  {
    id: 'close', label: 'Odayı kapat',
    desc: 'Odayı boşalt ve tam dezenfeksiyon uygula.'
  }
];

export class DiseaseSystem {
  constructor(bus, state, rng, biosecurity) {
    this.bus = bus;
    this.state = state;
    this.rng = rng;
    this.biosec = biosecurity;
    this.activeOutbreak = null;
  }

  /** Bir odada salgın çıkma günlük olasılığı */
  outbreakChance(room) {
    const st = this.state;
    const animals = st.animalsInRoom(room.id);
    if (!animals.length) return 0;
    let p = 0.0009;
    p += clamp(60 - st.hygiene, 0, 60) * 0.00012;
    p += clamp(60 - st.biosecurity, 0, 60) * 0.00014;
    p += clamp(this.biosec.pestPressure - 40, 0, 60) * 0.00010;

    const cages = st.cagesInRoom(room.id);
    // Aşırı kalabalık kafes sayısı: kapasite tür ve canlı ağırlığa göre hesaplanır
    // (Bölüm 3, Tablo 3.2-3.7).
    const overcrowded = cages.filter((c) => {
      const occ = st.animalsInCage(c.id);
      if (!occ.length) return false;
      return occ.length > c.capacityForSpecies(occ[0].species, occ[0].weight);
    }).length;
    p += overcrowded * 0.0006;

    if (room.quarantined) p *= 0.25;
    if (st.colonyStatus === 'barrier') p *= 0.5;
    if (st.biosafetyLevel >= 3) p *= 0.7;
    return clamp(p, 0, 0.2);
  }

  dailyTick() {
    const st = this.state;

    // --- Mevcut hastalığın seyri ---
    for (const room of st.rooms) {
      if (room.diseaseLevel <= 0) continue;
      const animals = st.animalsInRoom(room.id);
      const containment =
        (room.quarantined ? 22 : 0) +
        (st.staffOfRole('veterinarian').length ? 10 : 0) +
        (st.hygiene - 50) * 0.12 +
        (st.biosecurity - 50) * 0.10;
      room.diseaseLevel = clamp(room.diseaseLevel + 6 - containment);

      // Hayvanlara bulaş
      const infectRate = room.diseaseLevel / 100 * 0.18;
      for (const a of animals) {
        if (!a.diseased && this.rng.chance(infectRate)) a.diseased = true;
        else if (a.diseased && this.rng.chance(0.05 + (a.health / 100) * 0.12)) a.diseased = false;
      }

      if (room.diseaseLevel <= 0) {
        room.diseaseLevel = 0;
        room.quarantined = false;
        for (const a of animals) a.diseased = false;
        st.addLog(`${room.name} odasındaki salgın kontrol altına alındı.`, 'good');
        this.bus.emit('notify', { text: `${room.name}: salgın sona erdi.`, level: 'good' });
      }
    }

    // --- Yeni salgın ---
    if (this.activeOutbreak) return;
    for (const room of st.rooms) {
      if (room.diseaseLevel > 0) continue;
      if (this.rng.chance(this.outbreakChance(room))) {
        this.triggerOutbreak(room);
        break;
      }
    }
  }

  triggerOutbreak(room) {
    room.diseaseLevel = this.rng.int(18, 42);
    this.activeOutbreak = { roomId: room.id, day: this.state.day };
    this.state.addLog(`${room.name} odasında hastalık şüphesi.`, 'bad');
    this.bus.emit('disease:outbreak', { room, options: this.availableOptions() });
  }

  availableOptions() {
    const st = this.state;
    return OUTBREAK_OPTIONS.map((o) => ({
      ...o,
      available:
        (!o.requiresRoom || st.hasRoom(o.requiresRoom)) &&
        (!o.requiresStaff || st.staffOfRole(o.requiresStaff).length > 0)
    }));
  }

  /** Oyuncunun salgın kararını uygular; sonuç metnini döndürür. */
  resolveOutbreak(optionId) {
    const st = this.state;
    const room = st.roomById(this.activeOutbreak?.roomId);
    this.activeOutbreak = null;
    if (!room) return { text: 'Oda bulunamadı.', effects: {} };

    let effects = {};
    let text = '';
    let cost = 0;

    switch (optionId) {
      case 'quarantine': {
        room.quarantined = true;
        cost = 12000;
        effects = { biosecurity: 6, ethics: 3, animalWelfare: -2 };
        text = 'Oda karantinaya alındı. Yayılım riski belirgin biçimde azaldı; ' +
               'üretim geçici olarak yavaşlayacak.';
        break;
      }
      case 'vet': {
        cost = 18000;
        room.diseaseLevel = clamp(room.diseaseLevel - 15);
        effects = { animalWelfare: 4, ethics: 4, scientificReputation: 2 };
        text = 'Veteriner hekim değerlendirmesi yapıldı; tanı ve tedavi planı oluşturuldu. ' +
               'Sağlık kayıtları güncellendi.';
        break;
      }
      case 'continue': {
        room.diseaseLevel = clamp(room.diseaseLevel + 18);
        effects = { biosecurity: -10, ethics: -12, animalWelfare: -8, scientificReputation: -6 };
        text = 'Müdahale edilmedi. Hastalık yayılmaya devam ediyor; hem hayvan refahı ' +
               'hem de koloninin sağlık statüsü risk altında.';
        break;
      }
      case 'close': {
        const animals = st.animalsInRoom(room.id);
        cost = 30000 + animals.length * 120;
        for (const a of animals) { a.diseased = false; }
        room.diseaseLevel = 0;
        room.operational = false;
        room.closedUntil = st.day + 10;
        effects = { biosecurity: 12, scientificReputation: -3, animalWelfare: -4 };
        text = 'Oda kapatıldı ve tam dezenfeksiyon başlatıldı. En güvenli seçenek, ' +
               'ancak üretim kaybı ve maliyeti yüksek.';
        break;
      }
      default:
        text = 'Karar uygulanamadı.';
    }

    if (cost) st.spend(cost, `Salgın müdahalesi: ${room.name}`, 'veterinary');
    st.applyEffects(effects);
    return { text, effects, cost };
  }

  /** Kapatılan odaların yeniden açılması */
  checkClosedRooms() {
    for (const r of this.state.rooms) {
      if (!r.operational && r.closedUntil != null && this.state.day >= r.closedUntil) {
        r.operational = true;
        r.closedUntil = null;
        r.hygiene = 95;
        this.state.addLog(`${r.name} yeniden hizmete alındı.`, 'good');
      }
    }
  }
}
