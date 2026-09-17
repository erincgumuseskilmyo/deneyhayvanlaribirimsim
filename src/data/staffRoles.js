/**
 * PERSONEL ROLLERİ
 * Maaş ve katsayılar oyun dengesi değerleridir.
 */
export const STAFF_ROLES = {
  veterinarian: {
    id: 'veterinarian', name: 'Veteriner Hekim', baseSalary: 4200,
    capabilities: ['health', 'ethics', 'training'],
    careCapacity: 60, hygieneContribution: 0.3,
    desc: 'Sağlık kontrolü, hastalık müdahalesi ve etik kurul katkısı. HADYEK için gereklidir.'
  },
  vet_technician: {
    id: 'vet_technician', name: 'Veteriner Sağlık Teknikeri', baseSalary: 2400,
    capabilities: ['health', 'care'],
    careCapacity: 90, hygieneContribution: 0.4,
    desc: 'Günlük sağlık takibi ve bakım desteği. Veterinerin iş yükünü azaltır.'
  },
  caretaker: {
    id: 'caretaker', name: 'Hayvan Bakıcısı', baseSalary: 1800,
    capabilities: ['care', 'enrichment'],
    careCapacity: 140, hygieneContribution: 0.35,
    desc: 'Besleme, sulama, zenginleştirme ve günlük gözlem. Refahın temel taşıyıcısı.'
  },
  cleaner: {
    id: 'cleaner', name: 'Temizlik Personeli', baseSalary: 1500,
    capabilities: ['cleaning'],
    careCapacity: 40, hygieneContribution: 1.0,
    desc: 'Kafes ve oda temizliği. Hijyen puanını doğrudan yükseltir.'
  },
  technician: {
    id: 'technician', name: 'Teknisyen', baseSalary: 2600,
    capabilities: ['maintenance', 'genetics'],
    careCapacity: 20, hygieneContribution: 0.1,
    desc: 'Havalandırma/su sistemleri bakımı, ekipman arızası riskini düşürür.'
  },
  biosecurity: {
    id: 'biosecurity', name: 'Biyogüvenlik Sorumlusu', baseSalary: 3400,
    capabilities: ['biosecurity', 'waste'],
    careCapacity: 20, hygieneContribution: 0.3,
    desc: 'Bariyer uygulamaları, atık yönetimi ve pest kontrolü denetimi.'
  },
  administrator: {
    id: 'administrator', name: 'İdari Personel', baseSalary: 2000,
    capabilities: ['records', 'ethics'],
    careCapacity: 0, hygieneContribution: 0,
    desc: 'Kayıt, evrak ve başvuru yönetimi. Başvuru akışını ve raporlamayı hızlandırır.'
  }
};

export const STAFF_ROLE_LIST = Object.values(STAFF_ROLES);

export const FIRST_NAMES = [
  'Ayşe', 'Mehmet', 'Elif', 'Burak', 'Zeynep', 'Can', 'Deniz', 'Selin',
  'Emre', 'Merve', 'Onur', 'Ceren', 'Kaan', 'Nihal', 'Serkan', 'Pelin'
];
export const LAST_NAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Aydın', 'Öztürk', 'Arslan',
  'Doğan', 'Kılıç', 'Aslan', 'Koç', 'Kurt', 'Özdemir', 'Polat', 'Tekin'
];
