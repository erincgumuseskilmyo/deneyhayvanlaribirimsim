import { clamp } from './utils.js';

/**
 * Tüm oyunun tek doğruluk kaynağı (single source of truth).
 * Sistemler bu nesneyi okur ve mutasyona uğratır; UI buradan render eder.
 */
export class GameState {
  constructor() {
    // Ana istatistikler
    this.money = 250000;
    this.animalWelfare = 70;
    this.biosecurity = 60;
    this.ethics = 75;
    this.scientificReputation = 40;
    this.staffMorale = 70;
    this.facilityLevel = 1;

    // Zaman
    this.day = 0;

    // Varlıklar
    this.rooms = [];        // Room[]
    this.corridors = [];    // {x, z, type: 'clean'|'dirty'} — 1x1 grid karoları
    this.cages = [];        // Cage[]
    this.animals = [];      // Animal[]
    this.staff = [];        // StaffMember[]
    this.applications = []; // ResearchProject[] (beklemede)
    this.projects = [];     // ResearchProject[] (onaylanmış / yürüyen)
    this.courses = [];      // CertificationCourse[]

    // Kilitler / ilerleme
    this.unlockedSpecies = new Set(['mouse']);
    this.unlockedTech = new Set(['standard_colony']);
    this.hasOperatingLicense = false;   // Tarım ve Orman Bakanlığı çalışma izni
    this.hasWelfareUnit = false;        // hayvan refahı birimi (Bölüm 2, s. 28)
    this.hadyekEstablished = false;     // yerel etik kurul (HADYEK)

    // Tesis kalitesi (sistemler günlük hesaplar)
    this.hygiene = 70;
    // Barındırma statüsü: konvansiyonel ya da bariyerli yetiştirme (Bölüm 3, s. 52)
    this.colonyStatus = 'conventional'; // conventional | barrier
    this.biosafetyLevel = 1;            // BGS-1..4 (Bölüm 8, s. 175-176)

    // Kayıt/rapor
    this.ledger = [];       // {day, type, label, amount}
    this.dailyHistory = []; // günlük anlık görüntüler
    this.log = [];          // olay günlüğü
    this.quizResults = [];  // quiz sonuçları

    this.gameOver = false;
  }

  // --- İstatistik yardımcıları ---

  adjust(stat, delta) {
    if (!(stat in this)) return;
    if (stat === 'money') {
      this.money += delta;
      return;
    }
    this[stat] = clamp(this[stat] + delta);
  }

  /** {animalWelfare: -3, ethics: +2} biçiminde toplu uygulama */
  applyEffects(effects = {}) {
    for (const [k, v] of Object.entries(effects)) this.adjust(k, v);
  }

  spend(amount, label, type = 'expense') {
    this.money -= amount;
    this.ledger.push({ day: this.day, type, label, amount: -amount });
    return this.money >= 0;
  }

  earn(amount, label, type = 'income') {
    this.money += amount;
    this.ledger.push({ day: this.day, type, label, amount });
  }

  canAfford(amount) {
    return this.money >= amount;
  }

  // --- Sorgular ---

  roomById(id) { return this.rooms.find((r) => r.id === id); }
  cageById(id) { return this.cages.find((c) => c.id === id); }
  animalById(id) { return this.animals.find((a) => a.id === id); }

  cagesInRoom(roomId) { return this.cages.filter((c) => c.roomId === roomId); }
  animalsInRoom(roomId) { return this.animals.filter((a) => a.roomId === roomId && a.alive); }
  animalsInCage(cageId) { return this.animals.filter((a) => a.cageId === cageId && a.alive); }

  get livingAnimals() { return this.animals.filter((a) => a.alive); }

  roomsOfType(type) { return this.rooms.filter((r) => r.type === type); }
  hasRoom(type) { return this.rooms.some((r) => r.type === type); }

  corridorAt(x, z) { return this.corridors.find((c) => c.x === x && c.z === z); }
  get animalRooms() { return this.rooms.filter((r) => r.def.capacity > 0); }

  staffOfRole(role) { return this.staff.filter((s) => s.role === role); }

  addLog(text, level = 'info') {
    this.log.unshift({ day: this.day, text, level });
    if (this.log.length > 300) this.log.length = 300;
  }
}
