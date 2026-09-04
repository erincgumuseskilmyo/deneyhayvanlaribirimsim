/**
 * SERTİFİKA PROGRAMI MODÜLLERİ
 * Program 40 saat teori + 40 saat uygulama olarak modellenmiştir.
 * Saat dağılımı oyun tasarımı kararıdır; resmi bir müfredat tablosu değildir.
 */
export const COURSE_MODULES = [
  { id: 'legislation', name: 'Mevzuat', theory: 6, practice: 1, knowledge: 'ethics_committee' },
  { id: 'anatomy', name: 'Anatomi ve Fizyoloji', theory: 6, practice: 4, knowledge: null },
  { id: 'ethics', name: 'Etik ve 3R', theory: 5, practice: 1, knowledge: 'three_r' },
  { id: 'welfare', name: 'Hayvan Refahı', theory: 5, practice: 4, knowledge: 'welfare_five' },
  { id: 'lab_safety', name: 'Laboratuvar Güvenliği', theory: 3, practice: 3, knowledge: 'biosecurity' },
  { id: 'breeding', name: 'Üretim ve Yetiştirme', theory: 4, practice: 6, knowledge: 'stocking' },
  { id: 'nutrition', name: 'Beslenme', theory: 3, practice: 3, knowledge: null },
  { id: 'diseases', name: 'Hastalıklar', theory: 4, practice: 4, knowledge: 'quarantine' },
  { id: 'ohs', name: 'İş Sağlığı ve Güvenliği', theory: 2, practice: 2, knowledge: 'waste' },
  { id: 'handling', name: 'Tutma ve Zaptetme', theory: 1, practice: 6, knowledge: 'welfare_five' },
  { id: 'sampling', name: 'Örnek Alma', theory: 1, practice: 4, knowledge: null },
  { id: 'anesthesia', name: 'Anestezi ve Ötenazi', theory: 0, practice: 2, knowledge: 'three_r' }
];

export const TOTAL_THEORY_HOURS = COURSE_MODULES.reduce((s, m) => s + m.theory, 0);
export const TOTAL_PRACTICE_HOURS = COURSE_MODULES.reduce((s, m) => s + m.practice, 0);

/** Oyun dengesi: kursiyer başına ücret ve maliyet */
export const COURSE_ECONOMY = {
  tuitionPerStudent: 6500,
  costPerStudent: 1900,
  minStudents: 6,
  maxStudents: 20,
  durationDays: 20,
  passMark: 70
};
