/**
 * DENEY HAYVANLARI KULLANIM SERTİFİKA PROGRAMI
 *
 * Kaynak: Bölüm 2, s. 32.
 * "Düzenlenen sertifika programında toplam 80 saatlik ders bulunmaktadır.
 *  Programının 40 saati teorik, 40 saati de uygulama olarak eğitimler
 *  gerçekleştirilmektedir. Düzenlenen 80 saatlik eğitimin %80'ine adayların
 *  devam zorunluluğu bulunmaktadır. Eğitim sonunda kursiyerlere yapılan
 *  sınavda 100 puan üzerinden 70 puan ve üzeri alan kursiyerler
 *  'Deney Hayvanı Kullanım Sertifikası' almaya hak kazanırlar."
 *
 * Aşağıdaki 13 konu başlığı kitaptan birebir alınmıştır. Başlıklara düşen
 * teorik/uygulama saat dağılımı kitapta verilmediği için OYUN DEĞERİDİR;
 * yalnızca toplamların 40 + 40 olması korunmuştur.
 */
export const COURSE_MODULES = [
  { id: 'legislation', name: 'Deney Hayvanları Mevzuatı', theory: 6, practice: 0, knowledge: 'ethics_committee' },
  { id: 'anatomy', name: 'Deney hayvanlarının anatomisi, fizyolojisi, histolojisi ve biyokimyası', theory: 7, practice: 4, knowledge: null },
  { id: 'ethics', name: 'Hayvan deneyleri etiği', theory: 5, practice: 0, knowledge: 'three_r' },
  { id: 'welfare', name: 'Hayvan refahı ve davranış özellikleri', theory: 5, practice: 4, knowledge: 'welfare_indicators' },
  { id: 'lab_safety', name: 'Temel laboratuvar güvenliği ve temizliği', theory: 4, practice: 4, knowledge: 'biosafety_levels' },
  { id: 'breeding', name: 'Deney hayvanlarının üretimi', theory: 5, practice: 6, knowledge: 'mouse_breeding' },
  { id: 'nutrition', name: 'Deney hayvanlarının beslenmesi', theory: 3, practice: 3, knowledge: 'feeding' },
  { id: 'diseases', name: 'Hayvan hastalıkları', theory: 3, practice: 3, knowledge: 'quarantine' },
  { id: 'ohs', name: 'İş sağlığı ve güvenliği', theory: 2, practice: 2, knowledge: 'waste' },
  { id: 'injection', name: 'İlaç verme ve enjeksiyon teknikleri', theory: 0, practice: 5, knowledge: null },
  { id: 'handling', name: 'Tutuş teknikleri', theory: 0, practice: 4, knowledge: 'welfare_indicators' },
  { id: 'sampling', name: 'Kan ve örnek alma teknikleri', theory: 0, practice: 3, knowledge: null },
  { id: 'anesthesia', name: 'Anestezi – ötenazi teknikleri', theory: 0, practice: 2, knowledge: 'three_r' }
];

export const TOTAL_THEORY_HOURS = COURSE_MODULES.reduce((s, m) => s + m.theory, 0);
export const TOTAL_PRACTICE_HOURS = COURSE_MODULES.reduce((s, m) => s + m.practice, 0);
export const TOTAL_HOURS = TOTAL_THEORY_HOURS + TOTAL_PRACTICE_HOURS;

/** Programın hedef kitlesi — Bölüm 2, s. 32 */
export const TARGET_AUDIENCE = [
  'Araştırıcılar',
  'Deney hayvanları biriminde çalışacak hayvan teknisyeni/teknikerleri',
  'Deney hayvanları biriminde hayvan bakıcısı olarak çalışan personel'
];

export const COURSE_RULES = {
  passMark: 70,               // Bölüm 2, s. 32
  attendanceRequirement: 0.8, // eğitimin %80'ine devam zorunluluğu
  notifyHadmekDaysBefore: 30, // "Sertifika eğitim programını otuz gün önce HADMEK'e bildirmek" (s. 31)
  ref: 'Bölüm 2, s. 31-32'
};

/** Oyun dengesi: ücret, maliyet ve kontenjan */
export const COURSE_ECONOMY = {
  tuitionPerStudent: 6500,
  costPerStudent: 1900,
  minStudents: 6,
  maxStudents: 20,
  durationDays: 20
};
