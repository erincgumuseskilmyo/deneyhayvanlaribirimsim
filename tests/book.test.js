/**
 * KAYNAK KİTAP UYUMU TESTLERİ
 *
 * Bu testler, oyundaki değerlerin kaynak kitaptaki değerlerle uyumunu kilitler.
 * Kitap: "Laboratuvar Hayvanları Yetiştirme ve Sağlığı",
 * Anadolu Üniversitesi AÖF Yayını No: 2460, E-ISBN 978-975-06-3162-7, 2019.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { SPECIES, capacityFor, areaPerAnimal } from '../src/data/species.js';
import { KNOWLEDGE } from '../src/data/knowledge.js';
import { QUIZ_LIST } from '../src/data/quizzes.js';
import {
  COURSE_MODULES, TOTAL_THEORY_HOURS, TOTAL_PRACTICE_HOURS, TOTAL_HOURS, COURSE_RULES
} from '../src/data/courseModules.js';
import { TECH } from '../src/data/tech.js';
import { DECISIONS, DECISION_DEADLINE_DAYS, EthicsSystem } from '../src/systems/EthicsSystem.js';
import { ResearchProject } from '../src/entities/ResearchProject.js';
import { Game } from '../src/core/Game.js';
import { CAGE_CLEAN_INTERVAL_DAYS } from '../src/systems/HusbandrySystem.js';

test('Sertifika programı: 80 saat = 40 teori + 40 uygulama (Bölüm 2, s. 32)', () => {
  assert.equal(TOTAL_THEORY_HOURS, 40);
  assert.equal(TOTAL_PRACTICE_HOURS, 40);
  assert.equal(TOTAL_HOURS, 80);
  assert.equal(COURSE_RULES.passMark, 70);
  assert.equal(COURSE_RULES.attendanceRequirement, 0.8);
  assert.equal(COURSE_RULES.notifyHadmekDaysBefore, 30);
});

test('Sertifika programı kitaptaki 13 konu başlığını içerir (Bölüm 2, s. 32)', () => {
  assert.equal(COURSE_MODULES.length, 13);
  const names = COURSE_MODULES.map((m) => m.name);
  for (const expected of [
    'Deney Hayvanları Mevzuatı', 'Hayvan deneyleri etiği',
    'Hayvan refahı ve davranış özellikleri', 'Temel laboratuvar güvenliği ve temizliği',
    'Deney hayvanlarının üretimi', 'Deney hayvanlarının beslenmesi',
    'Hayvan hastalıkları', 'İş sağlığı ve güvenliği',
    'İlaç verme ve enjeksiyon teknikleri', 'Tutuş teknikleri',
    'Kan ve örnek alma teknikleri', 'Anestezi – ötenazi teknikleri'
  ]) {
    assert.ok(names.includes(expected), `eksik modül: ${expected}`);
  }
});

test('Tür üreme değerleri kitapla uyumlu (Bölüm 5-6)', () => {
  // Fare: 19-21 gün, 6-12 yavru (s. 96)
  assert.ok(SPECIES.mouse.gestationDays >= 19 && SPECIES.mouse.gestationDays <= 21);
  assert.deepEqual(SPECIES.mouse.litterSizeRange, [6, 12]);
  assert.equal(SPECIES.mouse.weaningDays, 21);
  // Sıçan: 21-23 gün, 8-16 yavru (s. 105-106)
  assert.ok(SPECIES.rat.gestationDays >= 21 && SPECIES.rat.gestationDays <= 23);
  assert.deepEqual(SPECIES.rat.litterSizeRange, [8, 16]);
  // Kobay: 59-72 gün, 2-5 yavru (s. 119)
  assert.ok(SPECIES.guinea_pig.gestationDays >= 59 && SPECIES.guinea_pig.gestationDays <= 72);
  assert.deepEqual(SPECIES.guinea_pig.litterSizeRange, [2, 5]);
  // Gerbil: 21-24 gün, 4-6 yavru (s. 122-123)
  assert.ok(SPECIES.gerbil.gestationDays >= 21 && SPECIES.gerbil.gestationDays <= 24);
  assert.deepEqual(SPECIES.gerbil.litterSizeRange, [4, 6]);
  // Hamster: 16 gün, 6-8 yavru (s. 124-125)
  assert.equal(SPECIES.hamster.gestationDays, 16);
  assert.deepEqual(SPECIES.hamster.litterSizeRange, [6, 8]);
  // Tavşan: 31-32 gün, 7-8 yavru (s. 128)
  assert.ok(SPECIES.rabbit.gestationDays >= 31 && SPECIES.rabbit.gestationDays <= 32);
  assert.deepEqual(SPECIES.rabbit.litterSizeRange, [7, 8]);
});

test('Sıcaklık ve nem değerleri Tablo 3.1 ile uyumlu', () => {
  for (const id of ['mouse', 'rat', 'guinea_pig']) {
    assert.deepEqual(SPECIES[id].tempOptimum, [20, 24], `${id} sıcaklık`);
    assert.deepEqual(SPECIES[id].humidityOptimum, [45, 65], `${id} nem`);
  }
  // Tavşan: 11-21 °C, en az %45
  assert.deepEqual(SPECIES.rabbit.tempOptimum, [11, 21]);
  assert.equal(SPECIES.rabbit.humidityOptimum[0], 45);
});

test('Kafes boyut tabloları (Tablo 3.2-3.7) kapasiteyi belirler', () => {
  // Fare: min bölme 330 cm², yükseklik 12 cm, hayvan başına 60-100 cm²
  assert.equal(SPECIES.mouse.housing.minCompartmentArea, 330);
  assert.equal(SPECIES.mouse.housing.minHeight, 12);
  assert.equal(areaPerAnimal('mouse', 18), 60);
  assert.equal(areaPerAnimal('mouse', 22), 70);
  assert.equal(areaPerAnimal('mouse', 28), 80);
  assert.equal(areaPerAnimal('mouse', 40), 100);

  // Sıçan: min bölme 800 cm², yükseklik 18 cm
  assert.equal(SPECIES.rat.housing.minCompartmentArea, 800);
  assert.equal(areaPerAnimal('rat', 150), 200);
  assert.equal(areaPerAnimal('rat', 700), 600);

  // Minimum bölme büyüklüğünün altındaki kafes kullanılamaz
  assert.equal(capacityFor('rat', 400, 18, 300), 0, 'min bölme altında kapasite 0 olmalı');
  // Minimum yüksekliğin altındaki kafes kullanılamaz
  assert.equal(capacityFor('rat', 1000, 12, 300), 0, 'min yükseklik altında kapasite 0 olmalı');
  // 800 cm² / 250 cm² = 3 sıçan
  assert.equal(capacityFor('rat', 800, 18, 250), 3);
});

test('HADYEK dört karar verir ve süre sınırı kırk iş günüdür (Bölüm 2, s. 30)', () => {
  assert.equal(Object.keys(DECISIONS).length, 4);
  assert.deepEqual(Object.values(DECISIONS).sort(), [
    'DÜZELTİLMESİ GEREKİR', 'ŞARTLI OLARAK UYGUN', 'UYGUN', 'UYGUN DEĞİLDİR'
  ].sort());
  assert.equal(DECISION_DEADLINE_DAYS, 40);
});

function cleanProject(extra = {}) {
  return new ResearchProject({
    speciesJustification: 'Tür seçimi literatürle uyumlu olarak gerekçelendirilmiştir.',
    housingConditions: 'group_enriched',
    animalSource: 'Kurum bünyesindeki çalışma izinli üretim ünitesi',
    wasteDisposal: 'Tıbbi Atıkların Kontrolü Yönetmeliği kapsamında bertaraf',
    hazards: 'Mikrobiyolojik kontaminasyon riski bulunmamaktadır.',
    animalNumber: 20,
    preliminaryDataAvailable: true,
    ...extra
  });
}

test('İdeal karar kitaptaki ilkelere göre belirlenir', () => {
  const game = new Game({ seed: 100 });
  const e = game.systems.ethics;

  // Alternatif yöntem varsa: uygun değildir (s. 31)
  assert.equal(e.idealDecision(cleanProject({ replacementAvailable: true })), DECISIONS.REJECT);
  // Giderilebilir eksiklik: düzeltilmesi gerekir (s. 30)
  assert.equal(e.idealDecision(cleanProject({ animalSource: '' })), DECISIONS.REQUEST_REVISION);
  assert.equal(e.idealDecision(cleanProject({ certificateStatus: 'missing' })), DECISIONS.REQUEST_REVISION);
  // Yapılabilirlik sınanmamış büyük çalışma: şartlı olarak uygun (s. 30)
  assert.equal(
    e.idealDecision(cleanProject({ preliminaryDataAvailable: false, animalNumber: 80 })),
    DECISIONS.CONDITIONAL
  );
  // Eksiksiz başvuru: uygun
  assert.equal(e.idealDecision(cleanProject()), DECISIONS.APPROVE);
});

test('Başvuru formunun eksik alanları bulgu üretir (Bölüm 2, s. 33-34)', () => {
  assert.equal(cleanProject().auditFindings().length, 0);
  const keys = (p) => p.auditFindings().map((f) => f.key);
  assert.ok(keys(cleanProject({ animalSource: '' })).includes('source'));
  assert.ok(keys(cleanProject({ wasteDisposal: '' })).includes('waste'));
  assert.ok(keys(cleanProject({ hazards: '' })).includes('hazards'));
  assert.ok(keys(cleanProject({ certificateStatus: 'partial' })).includes('certificate'));
});

test('Şartlı olarak uygun kararı ön deney süreci başlatır', () => {
  const game = new Game({ seed: 101 });
  const st = game.state;
  st.hadyekEstablished = true;
  st.hasWelfareUnit = true;
  st.animalWelfare = 70;
  const p = cleanProject({ preliminaryDataAvailable: false, animalNumber: 80 });
  st.applications.push(p);

  const res = game.systems.ethics.decide(p.id, DECISIONS.CONDITIONAL);
  assert.equal(res.correct, true);
  assert.equal(p.status, 'conditional');
  assert.ok(p.pilotAnimalNumber > 0 && p.pilotAnimalNumber < p.animalNumber);

  // Hayvan refahı birimi izler; 14 gün sonra yeniden kurula gelir
  for (let i = 0; i < 15; i++) game.time.tickDay();
  assert.equal(p.pilotCompleted, true);
  assert.equal(p.status, 'pending');
});

test('Hayvan refahı birimi olmadan HADYEK kurulamaz (Bölüm 2, s. 28)', () => {
  const game = new Game({ seed: 102 });
  const st = game.state;
  st.hasOperatingLicense = true;
  st.staff.push({ role: 'veterinarian', def: {} });
  st.rooms.push({ type: 'administration', id: 'x' });
  const check = game.systems.ethics.canEstablishHadyek();
  assert.equal(check.welfareUnit, false);
  assert.equal(check.ok, false);
  assert.equal(game.systems.ethics.establishHadyek().ok, false);
});

test('Teknoloji ağacı kitapta geçmeyen SPF/germ-free içermez', () => {
  const ids = Object.keys(TECH);
  assert.ok(!ids.includes('spf_facility'));
  assert.ok(!ids.includes('germ_free'));
  // Kitapta geçen basamaklar mevcut
  for (const id of ['microisolator', 'ivc_system', 'barrier_housing', 'bgs2', 'bgs3', 'bgs4']) {
    assert.ok(ids.includes(id), `eksik teknoloji: ${id}`);
  }
});

test('Kafes temizlik sıklığı haftada bir-iki kez aralığındadır (Bölüm 5, s. 109)', () => {
  assert.ok(CAGE_CLEAN_INTERVAL_DAYS >= 3 && CAGE_CLEAN_INTERVAL_DAYS <= 7);
});

test('Kitaptan alınan her bilgi kartında bölüm/sayfa referansı vardır', () => {
  const cards = Object.values(KNOWLEDGE);
  const bookCards = cards.filter((c) => c.source === 'book');
  assert.ok(bookCards.length >= 25, `beklenenden az kitap kartı: ${bookCards.length}`);
  for (const c of bookCards) {
    assert.ok(c.ref && /Bölüm|Tablo/.test(c.ref), `referans eksik: ${c.id}`);
  }
  // Kitap dışı kartlar açıkça etiketli olmalı
  for (const c of cards.filter((c) => c.source !== 'book')) {
    assert.ok(['general', 'game'].includes(c.source), `bilinmeyen kaynak: ${c.id}`);
    assert.ok(!c.ref, `kitap dışı kartta kitap referansı olmamalı: ${c.id}`);
  }
});

test('Her quiz sorusunun geçerli bir kaynak referansı ve konusu vardır', () => {
  let n = 0;
  for (const quiz of QUIZ_LIST) {
    assert.ok(quiz.questions.length >= 5 && quiz.questions.length <= 10,
      `${quiz.id}: soru sayısı 5-10 aralığında olmalı`);
    for (const q of quiz.questions) {
      n += 1;
      assert.ok(q.ref && /Bölüm|Tablo/.test(q.ref), `referans eksik: ${q.q}`);
      assert.ok(KNOWLEDGE[q.topic], `geçersiz konu: ${q.topic}`);
      assert.ok(q.answer >= 0 && q.answer < q.options.length, `geçersiz yanıt: ${q.q}`);
      assert.equal(new Set(q.options).size, q.options.length, `yinelenen şık: ${q.q}`);
    }
  }
  assert.equal(n, 30);
});
