import test from 'node:test';
import assert from 'node:assert/strict';

import { Game } from '../src/core/Game.js';
import { RNG } from '../src/core/RNG.js';
import { GameState } from '../src/core/GameState.js';
import { Animal } from '../src/entities/Animal.js';
import { ResearchProject } from '../src/entities/ResearchProject.js';
import { DECISIONS } from '../src/systems/EthicsSystem.js';
import { TOTAL_THEORY_HOURS, TOTAL_PRACTICE_HOURS } from '../src/data/courseModules.js';

/** Test yardımcısı: çalışır durumda küçük bir tesis kurar. */
function buildFacility(game) {
  const { systems, state } = game;
  state.money = 2_000_000;
  const layout = [
    ['animal', 0, 0], ['changing', 5, 0], ['cleaning', 8, 0],
    ['quarantine', 12, 0], ['utility', 16, 0], ['administration', 0, 5],
    ['staff', 4, 5], ['food_storage', 8, 5]
  ];
  for (const [type, x, z] of layout) {
    const res = systems.facility.placeRoom(type, x, z);
    assert.equal(res.ok, true, `${type} yerleştirilemedi: ${res.reason}`);
  }
  // Personel: adaydan bağımsız olarak doğrudan ekle
  const { StaffMember } = require_staff();
  state.staff.push(new StaffMember({ role: 'veterinarian', name: 'Test Vet', skill: 70 }));
  state.staff.push(new StaffMember({ role: 'caretaker', name: 'Test Bakıcı', skill: 65 }));
  state.staff.push(new StaffMember({ role: 'cleaner', name: 'Test Temizlik', skill: 60 }));
  return state.rooms.find((r) => r.type === 'animal');
}

/**
 * Kitaptaki başvuru formunun tüm zorunlu alanları doldurulmuş, bulgusuz başvuru.
 * (Bölüm 2, s. 33-34)
 */
function cleanProject(extra = {}) {
  return new ResearchProject({
    speciesJustification: 'Tür seçimi literatürle uyumlu olarak gerekçelendirilmiştir.',
    housingConditions: 'group_enriched',
    animalSource: 'Kurum bünyesindeki çalışma izinli üretim ünitesi',
    wasteDisposal: 'Tıbbi Atıkların Kontrolü Yönetmeliği kapsamında bertaraf edilecektir.',
    hazards: 'Mikrobiyolojik kontaminasyon riski bulunmamaktadır.',
    animalNumber: 20,
    ...extra
  });
}

let _staffModule;
function require_staff() { return _staffModule; }
_staffModule = await import('../src/entities/StaffMember.js');

test('RNG deterministiktir', () => {
  const a = new RNG(42); const b = new RNG(42);
  const seqA = Array.from({ length: 20 }, () => a.next());
  const seqB = Array.from({ length: 20 }, () => b.next());
  assert.deepEqual(seqA, seqB);
});

test('Sertifika programı 40 saat teori + 40 saat uygulamadır', () => {
  assert.equal(TOTAL_THEORY_HOURS, 40);
  assert.equal(TOTAL_PRACTICE_HOURS, 40);
});

test('GameState istatistikleri 0-100 arasında sınırlanır', () => {
  const st = new GameState();
  st.adjust('ethics', 500);
  assert.equal(st.ethics, 100);
  st.adjust('ethics', -500);
  assert.equal(st.ethics, 0);
  st.money = 100;
  st.adjust('money', -500);
  assert.equal(st.money, -400, 'para sınırlanmaz, negatife düşebilir');
});

test('Oda yerleştirmede çakışma ve bütçe kontrolü çalışır', () => {
  const game = new Game({ seed: 1 });
  const { systems, state } = game;
  state.money = 100000;
  assert.equal(systems.facility.placeRoom('animal', 0, 0).ok, true);
  const overlap = systems.facility.placeRoom('animal', 1, 1);
  assert.equal(overlap.ok, false);
  assert.match(overlap.reason, /çakış/);
  const outside = systems.facility.canPlace('animal', 25, 25);
  assert.equal(outside.ok, false);
  state.money = 100;
  assert.equal(systems.facility.placeRoom('staff', 10, 10).ok, false);
});

test('Çalışma izni koşulları eksikken verilmez, tamamlanınca verilir', () => {
  const game = new Game({ seed: 2 });
  assert.equal(game.systems.facility.applyForLicense().ok, false);
  buildFacility(game);
  const res = game.systems.facility.applyForLicense();
  assert.equal(res.ok, true);
  assert.equal(game.state.hasOperatingLicense, true);
});

test('Koloni kurulur, hayvanlar üretilir ve nüfus artar', () => {
  const game = new Game({ seed: 3 });
  const room = buildFacility(game);
  game.systems.facility.buyCages(room.id, 'shoebox', 8);
  const res = game.systems.facility.foundColony(room.id, 'mouse', 4);
  assert.equal(res.ok, true, res.reason);
  assert.equal(game.state.livingAnimals.length, 12);

  const before = game.state.livingAnimals.length;
  for (let i = 0; i < 200; i++) game.time.tickDay();
  const after = game.state.livingAnimals.length;
  assert.ok(after > before, `nüfus artmalı (önce ${before}, sonra ${after})`);
  assert.ok(game.state.animals.some((a) => a.birthDate > 0), 'yavru doğmuş olmalı');
});

test('Refah, koşullar kötüleştiğinde düşer', () => {
  const game = new Game({ seed: 4 });
  const room = buildFacility(game);
  game.systems.facility.buyCages(room.id, 'shoebox', 8);
  game.systems.facility.foundColony(room.id, 'mouse', 4);
  for (let i = 0; i < 30; i++) game.time.tickDay();
  const goodWelfare = game.state.animalWelfare;

  // Personeli çıkar ve kafesleri kirlet
  game.state.staff.length = 0;
  for (const c of game.state.cages) { c.cleanliness = 0; c.enrichment = 0; }
  for (let i = 0; i < 40; i++) game.time.tickDay();
  assert.ok(game.state.animalWelfare < goodWelfare,
    `refah düşmeli (${goodWelfare} -> ${game.state.animalWelfare})`);
});

test('Etik kurul: replacement mevcutsa ideal karar REJECT olur', () => {
  const game = new Game({ seed: 5 });
  const st = game.state;
  st.hadyekEstablished = true;
  const p = cleanProject({ replacementAvailable: true });
  st.applications.push(p);
  assert.equal(game.systems.ethics.idealDecision(p), DECISIONS.REJECT);

  const ethicsBefore = st.ethics;
  const res = game.systems.ethics.decide(p.id, DECISIONS.APPROVE);
  assert.equal(res.correct, false);
  assert.ok(st.ethics < ethicsBefore, 'yanlış onay etik puanını düşürmeli');
});

test('Etik kurul: temiz başvuruda APPROVE doğrudur ve proje listeye geçer', () => {
  const game = new Game({ seed: 6 });
  const st = game.state;
  st.hadyekEstablished = true;
  const p = cleanProject();
  assert.equal(p.auditFindings().length, 0);
  st.applications.push(p);
  const res = game.systems.ethics.decide(p.id, DECISIONS.APPROVE);
  assert.equal(res.correct, true);
  assert.equal(st.projects.length, 1);
  assert.equal(st.applications.length, 0);
});

test('Sertifika kursu tamamlanır ve CERTIFIED/FAILED üretir', () => {
  const game = new Game({ seed: 7 });
  buildFacility(game);
  // Eğitim sınıfı ileri seviye odadır: önce çalışma izni ve tesis seviyesi 2 gerekir
  assert.equal(game.systems.facility.applyForLicense().ok, true);
  assert.ok(game.state.facilityLevel >= 2, 'izin sonrası tesis seviyesi 2 olmalı');
  assert.equal(game.systems.facility.placeRoom('classroom', 0, 10).ok, true);
  game.state.scientificReputation = 70;
  game.state.animalWelfare = 70;
  const res = game.systems.certification.openCourse(12);
  assert.equal(res.ok, true, res.reason);

  for (let i = 0; i < 25; i++) game.time.tickDay();
  const course = game.state.courses[0];
  assert.equal(course.status, 'finished');
  assert.equal(course.results.certified + course.results.failed, 12);
  assert.ok(course.results.scores.every((s) => s >= 0 && s <= 100));
  assert.ok(course.theoryHoursDone > 39.5 && course.practiceHoursDone > 39.5);
});

test('Salgın kararları farklı sonuçlar üretir', () => {
  const game = new Game({ seed: 8 });
  const room = buildFacility(game);
  game.systems.facility.buyCages(room.id, 'shoebox', 6);
  game.systems.facility.foundColony(room.id, 'mouse', 4);

  game.systems.disease.triggerOutbreak(room);
  const bioBefore = game.state.biosecurity;
  const res = game.systems.disease.resolveOutbreak('continue');
  assert.ok(res.effects.biosecurity < 0);
  assert.ok(game.state.biosecurity < bioBefore, 'müdahale etmemek biyogüvenliği düşürmeli');

  game.systems.disease.triggerOutbreak(room);
  const res2 = game.systems.disease.resolveOutbreak('quarantine');
  assert.equal(room.quarantined, true);
  assert.ok(res2.effects.biosecurity > 0);
});

test('Puanlama beş boyutu birleştirir ve harf notu verir', () => {
  const game = new Game({ seed: 9 });
  const st = game.state;
  st.money = 1_000_000;
  st.animalWelfare = 90; st.ethics = 90; st.biosecurity = 90; st.scientificReputation = 90;
  game.systems.scoring.dailyTick();
  const report = game.systems.scoring.finalReport();
  assert.ok(report.total > 70);
  assert.ok(['S', 'A'].includes(report.grade), `beklenen yüksek not, gelen: ${report.grade}`);

  const bad = new Game({ seed: 10 });
  bad.state.money = 0;
  bad.state.animalWelfare = 10; bad.state.ethics = 10;
  bad.state.biosecurity = 10; bad.state.scientificReputation = 10;
  bad.systems.scoring.dailyTick();
  assert.equal(bad.systems.scoring.grade(), 'D');
});

test('Sadece para biriktirmek yüksek not getirmez', () => {
  const game = new Game({ seed: 11 });
  const st = game.state;
  st.money = 5_000_000;
  st.animalWelfare = 25; st.ethics = 25; st.biosecurity = 25; st.scientificReputation = 25;
  game.systems.scoring.dailyTick();
  const r = game.systems.scoring.finalReport();
  assert.ok(r.total < 55, `zengin ama kötü tesis düşük skor almalı, gelen ${r.total}`);
  assert.ok(['C', 'D'].includes(r.grade));
});

test('Uzun süreli simülasyon hatasız çalışır ve sayısal değerler geçerli kalır', () => {
  const game = new Game({ seed: 12 });
  const room = buildFacility(game);
  game.systems.facility.applyForLicense();
  game.systems.ethics.establishHadyek();
  game.systems.facility.buyCages(room.id, 'shoebox', 10);
  game.systems.facility.foundColony(room.id, 'mouse', 4);

  for (let i = 0; i < 400; i++) {
    game.time.tickDay();
    // Bekleyen modal etkileşimlerini otomatik çöz
    if (game.systems.events.pending) game.systems.events.resolve(0);
    if (game.systems.disease.activeOutbreak) game.systems.disease.resolveOutbreak('vet');
    for (const p of game.state.applications.filter((x) => x.status === 'pending')) {
      game.systems.ethics.decide(p.id, game.systems.ethics.idealDecision(p));
    }
  }

  const st = game.state;
  for (const key of ['animalWelfare', 'biosecurity', 'ethics', 'scientificReputation', 'staffMorale']) {
    assert.ok(Number.isFinite(st[key]), `${key} sayı olmalı`);
    assert.ok(st[key] >= 0 && st[key] <= 100, `${key} 0-100 aralığında olmalı: ${st[key]}`);
  }
  assert.ok(Number.isFinite(st.money));
  assert.ok(st.animals.every((a) => Number.isFinite(a.welfare) && Number.isFinite(a.health)));
  assert.ok(st.dailyHistory.length > 0);
  assert.ok(st.ledger.length > 0);
});

test('Hayvan piyasa değeri statü ve genetiğe göre artar', () => {
  const base = new Animal({ species: 'mouse' });
  const barrier = new Animal({ species: 'mouse', microbiologicalStatus: 'barrier' });
  const ko = new Animal({ species: 'mouse', genetics: 'knockout' });
  assert.ok(barrier.marketValue() > base.marketValue());
  assert.ok(ko.marketValue() > base.marketValue());
});
