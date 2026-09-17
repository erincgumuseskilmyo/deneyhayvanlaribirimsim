/**
 * ARAŞTIRMA BAŞVURUSU ŞABLONLARI
 * Başvurular bu şablonlardan rastgele üretilir. Metinler kurgusaldır;
 * gerçek bir çalışma protokolünü temsil etmez (oyun tasarımı kararı).
 */

export const PI_NAMES = [
  'Dr. A. Terzi', 'Doç. Dr. S. Bilen', 'Prof. Dr. M. Uçar', 'Dr. E. Sağlam',
  'Doç. Dr. N. Kabaoğlu', 'Dr. H. Yavuz', 'Prof. Dr. L. Erdoğan', 'Dr. B. Tunç'
];

export const STUDY_TYPES = [
  { id: 'basic', name: 'Temel Araştırma' },
  { id: 'translational', name: 'Uygulamalı / Translasyonel Araştırma' },
  { id: 'toxicology', name: 'Toksikoloji / Güvenlilik' },
  { id: 'education', name: 'Eğitim ve Öğretim Amaçlı' },
  { id: 'device', name: 'Tıbbi Cihaz Testi' }
];

export const PROCEDURE_POOL = [
  { id: 'observation', name: 'Davranış gözlemi', severity: 1 },
  { id: 'oral_dose', name: 'Oral yolla madde verilmesi', severity: 2 },
  { id: 'ip_injection', name: 'İntraperitoneal enjeksiyon', severity: 2 },
  { id: 'blood_sample', name: 'Kan örneği alınması', severity: 2 },
  { id: 'imaging', name: 'Anestezi altında görüntüleme', severity: 2 },
  { id: 'surgery', name: 'Cerrahi girişim (anestezi + analjezi)', severity: 4 },
  { id: 'disease_model', name: 'Hastalık modeli oluşturulması', severity: 4 },
  { id: 'terminal', name: 'Çalışma sonunda ötenazi', severity: 3 }
];

export const SUBSTANCE_POOL = [
  'Serum fizyolojik (kontrol)', 'Test bileşiği X-14', 'Standart analjezik',
  'Anestezik ajan', 'İzotonik tampon', 'Referans ilaç'
];

export const HOUSING_OPTIONS = [
  { id: 'group_enriched', name: 'Grup halinde, zenginleştirilmiş kafes', welfareScore: 3 },
  { id: 'group_standard', name: 'Grup halinde, standart kafes', welfareScore: 1 },
  { id: 'single_justified', name: 'Bireysel barındırma (gerekçeli)', welfareScore: -1 },
  { id: 'single_unjustified', name: 'Bireysel barındırma (gerekçesiz)', welfareScore: -4 },
  { id: 'metabolism', name: 'Metabolizma kafesi (süreli)', welfareScore: -2 }
];

export const TITLE_PARTS = {
  prefix: [
    'Deneysel', 'Kronik', 'Akut', 'Karşılaştırmalı', 'Doz bağımlı', 'Erken dönem'
  ],
  topic: [
    'inflamasyon modelinde', 'metabolik değişimlerde', 'yara iyileşmesinde',
    'davranışsal yanıtlarda', 'böbrek fonksiyonlarında', 'kemik onarımında',
    'bağışıklık yanıtında', 'nöroprotektif etkilerde'
  ],
  suffix: [
    'test bileşiğinin etkisinin araştırılması',
    'yeni bir biyobelirtecin değerlendirilmesi',
    'iki farklı tedavi protokolünün karşılaştırılması',
    'histopatolojik bulguların incelenmesi',
    'doz-yanıt ilişkisinin belirlenmesi'
  ]
};

/** Değerlendirme rehberi — oyuncuya etik kurul ekranında gösterilir. */
export const REVIEW_GUIDE = [
  'Ekipte deney hayvanları kullanım sertifikası olmayan kişi var mı?',
  'Hayvan sayısı, deney gruplarına ve amaca göre gerekçelendirilmiş mi?',
  'Alternatif (hayvansız) yöntem mevcutsa neden tercih edilmemiş?',
  'Barındırma koşulları türün ihtiyaçlarına uygun mu?',
  'İşlemlerin şiddeti karşısında ağrı/stres azaltıcı önlemler tanımlanmış mı?',
  'Tesisin bu türü ve bu sayıyı karşılayacak kapasitesi var mı?'
];
