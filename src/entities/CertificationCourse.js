import { nextId } from '../core/RNG.js';
import { COURSE_MODULES, COURSE_ECONOMY, TOTAL_THEORY_HOURS, TOTAL_PRACTICE_HOURS } from '../data/courseModules.js';

/**
 * Deney Hayvanları Kullanım Sertifika Programı — bir kurs dönemi.
 * 40 saat teori + 40 saat uygulama, sonunda 0-100 final sınavı.
 */
export class CertificationCourse {
  constructor({ startDay, studentCount, quality = 0.6 }) {
    this.id = nextId('cs');
    this.startDay = startDay;
    this.durationDays = COURSE_ECONOMY.durationDays;
    this.studentCount = studentCount;
    this.quality = quality;          // 0-1 (personel ve tesis kalitesinden hesaplanır)
    this.theoryHoursDone = 0;
    this.practiceHoursDone = 0;
    this.totalTheory = TOTAL_THEORY_HOURS;
    this.totalPractice = TOTAL_PRACTICE_HOURS;
    this.moduleProgress = Object.fromEntries(COURSE_MODULES.map((m) => [m.id, 0]));
    this.status = 'running';         // running | exam | finished
    this.results = null;             // {certified, failed, scores[]}
  }

  get progress() {
    return (this.theoryHoursDone + this.practiceHoursDone) /
           (this.totalTheory + this.totalPractice);
  }

  /** Bir günde işlenen ders saatlerini dağıtır */
  advanceDay() {
    const hoursPerDay = (this.totalTheory + this.totalPractice) / this.durationDays;
    let remaining = hoursPerDay;
    for (const m of COURSE_MODULES) {
      const total = m.theory + m.practice;
      const done = this.moduleProgress[m.id];
      if (done >= total) continue;
      const step = Math.min(remaining, total - done);
      this.moduleProgress[m.id] = done + step;
      remaining -= step;
      if (remaining <= 0.001) break;
    }
    // Toplamları yeniden türet
    let th = 0; let pr = 0;
    for (const m of COURSE_MODULES) {
      const done = this.moduleProgress[m.id];
      const total = m.theory + m.practice;
      const ratio = total ? done / total : 1;
      th += m.theory * ratio;
      pr += m.practice * ratio;
    }
    this.theoryHoursDone = Math.min(this.totalTheory, th);
    this.practiceHoursDone = Math.min(this.totalPractice, pr);
    if (this.progress >= 0.999) this.status = 'exam';
  }
}
