import { clamp, avg } from '../core/utils.js';
import { StaffMember } from '../entities/StaffMember.js';
import { STAFF_ROLES, FIRST_NAMES, LAST_NAMES } from '../data/staffRoles.js';

/**
 * PERSONEL SİSTEMİ — yorgunluk, verimlilik, moral ve maaş.
 */
export class StaffSystem {
  constructor(bus, state, rng) {
    this.bus = bus;
    this.state = state;
    this.rng = rng;
    this.candidates = [];
    this.refreshCandidates();
  }

  refreshCandidates(count = 5) {
    this.candidates = [];
    for (let i = 0; i < count; i++) {
      const role = this.rng.pick(Object.keys(STAFF_ROLES));
      const name = `${this.rng.pick(FIRST_NAMES)} ${this.rng.pick(LAST_NAMES)}`;
      const skill = this.rng.int(35, 92);
      this.candidates.push(new StaffMember({ role, name, skill, experience: this.rng.int(0, 900) }));
    }
    this.bus.emit('staff:candidates', this.candidates);
  }

  hire(candidateId) {
    const idx = this.candidates.findIndex((c) => c.id === candidateId);
    if (idx === -1) return { ok: false, reason: 'Aday bulunamadı.' };
    const cand = this.candidates[idx];
    const signingCost = cand.salary; // bir aylık peşin
    if (!this.state.canAfford(signingCost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    this.state.spend(signingCost, `İşe alım: ${cand.name}`, 'staff');
    this.state.staff.push(cand);
    this.candidates.splice(idx, 1);
    this.state.adjust('staffMorale', 2);
    this.state.addLog(`${cand.name} (${cand.def.name}) işe alındı.`);
    this.bus.emit('staff:changed');
    return { ok: true, staff: cand };
  }

  fire(staffId) {
    const idx = this.state.staff.findIndex((s) => s.id === staffId);
    if (idx === -1) return { ok: false };
    const [gone] = this.state.staff.splice(idx, 1);
    this.state.spend(Math.round(gone.salary * 0.5), `Çıkış ödemesi: ${gone.name}`, 'staff');
    this.state.adjust('staffMorale', -6);
    this.state.addLog(`${gone.name} işten ayrıldı.`, 'warn');
    this.bus.emit('staff:changed');
    return { ok: true };
  }

  /** Personel başına düşen iş yükü (1 = tam kapasitede) */
  workload() {
    const st = this.state;
    const capacity = st.staff.reduce((s, m) => s + m.effectiveCapacity, 0);
    const demand = st.livingAnimals.length + st.cages.length * 1.5 + st.rooms.length * 4;
    if (capacity <= 0) return demand > 0 ? 3 : 0;
    return demand / capacity;
  }

  dailyTick() {
    const st = this.state;
    if (!st.staff.length) {
      st.adjust('staffMorale', -0.4);
      return;
    }
    const load = this.workload();
    const hasStaffRoom = st.hasRoom('staff');

    for (const s of st.staff) {
      const tire = clamp(load * 6 - (hasStaffRoom ? 2.5 : 0), 0, 14);
      s.tire(tire);
      s.rest(4.5 + (hasStaffRoom ? 2 : 0));
      s.gainExperience();
    }

    // Moral: iş yükü, ödeme gücü, refah ve tesis kalitesinden etkilenir
    let moraleTarget = 75;
    if (load > 1.2) moraleTarget -= (load - 1.2) * 30;
    if (load < 0.7) moraleTarget += 5;
    if (!hasStaffRoom) moraleTarget -= 8;
    if (st.money < 0) moraleTarget -= 25;
    moraleTarget += (st.animalWelfare - 60) * 0.15;
    moraleTarget += (avg(st.staff, (s) => 100 - s.fatigue) - 60) * 0.15;
    st.staffMorale = clamp(st.staffMorale + (clamp(moraleTarget) - st.staffMorale) * 0.15);

    // Çok düşük moralde istifa riski
    if (st.staffMorale < 22 && this.rng.chance(0.05)) {
      const victim = this.rng.pick(st.staff);
      if (victim) {
        st.staff.splice(st.staff.indexOf(victim), 1);
        st.addLog(`${victim.name} düşük moral nedeniyle istifa etti.`, 'bad');
        this.bus.emit('notify', { text: `${victim.name} istifa etti.`, level: 'bad' });
        this.bus.emit('staff:changed');
      }
    }
  }

  monthlyTick() {
    const st = this.state;
    const total = st.staff.reduce((s, m) => s + m.salary, 0);
    if (total > 0) {
      st.spend(total, 'Personel maaşları', 'salary');
      if (st.money < 0) {
        st.adjust('staffMorale', -12);
        this.bus.emit('notify', { text: 'Maaşlar açık bütçeden ödendi — moral düştü.', level: 'bad' });
      }
    }
    this.refreshCandidates();
  }
}
