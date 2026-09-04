import { nextId } from '../core/RNG.js';
import { clamp } from '../core/utils.js';
import { STAFF_ROLES } from '../data/staffRoles.js';

export class StaffMember {
  constructor({ role, name, skill = 50, experience = 0 }) {
    const def = STAFF_ROLES[role];
    this.id = nextId('st');
    this.role = role;
    this.name = name;
    this.salary = Math.round(def.baseSalary * (0.85 + skill / 250));
    this.skill = skill;          // 0-100
    this.experience = experience; // gün
    this.fatigue = 0;            // 0-100
    this.assignedRoom = null;
    this.certified = role === 'veterinarian' || role === 'vet_technician';
  }

  get def() { return STAFF_ROLES[this.role]; }

  /** Etkin verimlilik: beceri, yorgunluk ve deneyimin bileşimi */
  get efficiency() {
    const expBonus = Math.min(20, this.experience / 20);
    const base = (this.skill + expBonus) / 100;
    const fatiguePenalty = 1 - (this.fatigue / 100) * 0.55;
    return clamp(base * fatiguePenalty, 0.1, 1.3);
  }

  /** Günlük bakabileceği hayvan sayısı */
  get effectiveCapacity() {
    return Math.round(this.def.careCapacity * this.efficiency);
  }

  rest(amount) { this.fatigue = clamp(this.fatigue - amount); }
  tire(amount) { this.fatigue = clamp(this.fatigue + amount); }

  gainExperience() {
    this.experience += 1;
    if (this.experience % 60 === 0) this.skill = clamp(this.skill + 1);
  }
}
