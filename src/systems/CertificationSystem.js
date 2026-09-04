import { clamp } from '../core/utils.js';
import { CertificationCourse } from '../entities/CertificationCourse.js';
import { COURSE_ECONOMY } from '../data/courseModules.js';

/**
 * DENEY HAYVANLARI KULLANIM SERTİFİKA PROGRAMI
 * 40 saat teori + 40 saat uygulama, sonunda 0-100 final sınavı.
 * 70 ve üzeri CERTIFIED, altı FAILED.
 */
export class CertificationSystem {
  constructor(bus, state, rng) {
    this.bus = bus;
    this.state = state;
    this.rng = rng;
    this.totalCertified = 0;
    this.totalFailed = 0;
  }

  /** Program açma koşulları */
  requirements() {
    const st = this.state;
    const req = {
      classroom: st.hasRoom('classroom'),
      animalRoom: st.hasRoom('animal'),
      veterinarian: st.staffOfRole('veterinarian').length > 0,
      reputation: st.scientificReputation >= 45,
      welfare: st.animalWelfare >= 55
    };
    req.ok = Object.values(req).every(Boolean);
    return req;
  }

  /** Eğitim kalitesi 0-1: personel, tesis ve refahtan hesaplanır */
  courseQuality() {
    const st = this.state;
    const vets = st.staffOfRole('veterinarian');
    const vetSkill = vets.length ? vets.reduce((s, v) => s + v.skill, 0) / vets.length : 0;
    let q = 0.25;
    q += (vetSkill / 100) * 0.3;
    q += (st.animalWelfare / 100) * 0.15;
    q += (st.biosecurity / 100) * 0.1;
    q += (st.scientificReputation / 100) * 0.1;
    if (st.hasRoom('operation')) q += 0.05;
    if (st.hasRoom('experimental')) q += 0.05;
    return clamp(q, 0, 1);
  }

  openCourse(studentCount) {
    const st = this.state;
    const req = this.requirements();
    if (!req.ok) return { ok: false, reason: 'Program koşulları sağlanmadı.', req };
    const n = clamp(Math.round(studentCount), COURSE_ECONOMY.minStudents, COURSE_ECONOMY.maxStudents);
    const cost = n * COURSE_ECONOMY.costPerStudent;
    if (!st.canAfford(cost)) return { ok: false, reason: 'Yetersiz bütçe.' };
    st.spend(cost, `Sertifika programı giderleri (${n} kursiyer)`, 'training');
    const course = new CertificationCourse({
      startDay: st.day, studentCount: n, quality: this.courseQuality()
    });
    st.courses.push(course);
    st.addLog(`Sertifika programı açıldı: ${n} kursiyer.`, 'good');
    this.bus.emit('certification:opened', course);
    return { ok: true, course };
  }

  dailyTick() {
    const st = this.state;
    for (const course of st.courses) {
      if (course.status === 'running') {
        course.advanceDay();
        // Uygulamalı dersler hayvanları ve personeli meşgul eder
        if (st.day % 5 === 0) st.adjust('staffMorale', -0.5);
      } else if (course.status === 'exam') {
        this.runExam(course);
      }
    }
  }

  runExam(course) {
    const st = this.state;
    const scores = [];
    let certified = 0; let failed = 0;

    for (let i = 0; i < course.studentCount; i++) {
      // Puan: eğitim kalitesi merkezli, bireysel varyans eklenir
      const base = 42 + course.quality * 45;
      const score = clamp(Math.round(base + this.rng.range(-16, 16)), 0, 100);
      scores.push(score);
      if (score >= COURSE_ECONOMY.passMark) certified += 1; else failed += 1;
    }

    course.results = { certified, failed, scores, passMark: COURSE_ECONOMY.passMark };
    course.status = 'finished';
    this.totalCertified += certified;
    this.totalFailed += failed;

    const income = course.studentCount * COURSE_ECONOMY.tuitionPerStudent;
    st.earn(income, `Sertifika programı geliri (${course.studentCount} kursiyer)`, 'certification');

    const passRate = certified / course.studentCount;
    st.adjust('scientificReputation', passRate > 0.8 ? 6 : passRate > 0.6 ? 3 : -3);
    st.adjust('ethics', 2);
    st.addLog(`Sertifika sınavı sonuçlandı: ${certified} CERTIFIED, ${failed} FAILED.`,
      passRate > 0.7 ? 'good' : 'warn');
    this.bus.emit('certification:finished', course);
  }
}
