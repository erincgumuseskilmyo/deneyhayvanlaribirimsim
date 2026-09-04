/**
 * EĞİTİM BİLGİ KARTLARI
 *
 * KAYNAK ETİKETLERİ (oyuncuya görünür):
 *  - 'book'   : Proje klasöründeki kaynak kitaptan doğrudan alınmış içerik.
 *               ŞU AN BU ETİKETTE KART YOKTUR: kaynak kitap dosyası depoya
 *               eklenmediği için hiçbir cümle kitaba atfedilmemiştir.
 *  - 'general': Laboratuvar hayvanı bilimi ve mevzuatında yaygın olarak
 *               bilinen genel ilkeler. Kaynak kitapla doğrulanması gerekir.
 *  - 'game'   : Tamamen oyun tasarımı kararı. Bilimsel iddia içermez.
 *
 * Kitap depoya eklendiğinde ilgili kartların `source` alanı 'book' yapılmalı
 * ve `ref` alanına bölüm/sayfa bilgisi yazılmalıdır. (bkz. docs/KAYNAK.md)
 */

export const SOURCE_LABELS = {
  book: 'Kaynak kitap',
  general: 'Genel bilgi — kaynak kitapla doğrulanmalı',
  game: 'Oyun tasarımı kararı (bilimsel iddia değildir)'
};

export const KNOWLEDGE = {
  three_r: {
    id: 'three_r', title: '3R İlkesi', source: 'general',
    text:
      'Hayvan deneylerinde 3R; Replacement (yerine koyma), Reduction (azaltma) ve ' +
      'Refinement (iyileştirme) ilkelerini ifade eder. Replacement, mümkün olduğunda ' +
      'hayvan kullanılmayan yöntemlere yönelmeyi; Reduction, bilimsel amaca ulaşmak için ' +
      'gereken en az hayvan sayısını kullanmayı; Refinement ise işlemlerin hayvana verdiği ' +
      'ağrı, acı ve sıkıntıyı en aza indirmeyi hedefler.'
  },
  ethics_committee: {
    id: 'ethics_committee', title: 'HADYEK ve HADMEK', source: 'general',
    text:
      'Türkiye’de hayvan deneyleri etik değerlendirmesi yerel etik kurullar (HADYEK) ve ' +
      'merkezi etik kurul (HADMEK) yapısı üzerinden yürütülür. Kurum bünyesinde kurulan ' +
      'yerel etik kurul, kendi kurumundaki hayvan deneyi başvurularını değerlendirir; ' +
      'merkezi kurul ise üst düzeyde koordinasyon ve düzenleme işlevi görür. ' +
      'Bu oyunda oyuncu, yerel etik kurul rolünde başvuruları değerlendirir.'
  },
  certificate: {
    id: 'certificate', title: 'Deney Hayvanları Kullanım Sertifikası', source: 'general',
    text:
      'Deney hayvanı ile çalışacak kişilerin, konuya ilişkin eğitim alarak yetkinlik ' +
      'belgesi (deney hayvanları kullanım sertifikası) edinmesi beklenir. Eğitim ' +
      'programları teorik ve uygulamalı bölümlerden oluşur; mevzuat, etik, hayvan refahı, ' +
      'anatomi/fizyoloji, barındırma, hastalıklar ve iş güvenliği gibi başlıkları kapsar.'
  },
  welfare_five: {
    id: 'welfare_five', title: 'Hayvan Refahı', source: 'general',
    text:
      'Hayvan refahı; uygun beslenme ve su, uygun barındırma ve çevre koşulları, ' +
      'sağlık, korku ve sıkıntıdan uzak olma ve türe özgü davranışları sergileyebilme ' +
      'başlıkları üzerinden değerlendirilir. Refahın düşmesi yalnızca etik bir sorun değildir; ' +
      'stres altındaki hayvanlardan elde edilen veriler bilimsel olarak da güvenilirliğini yitirir.'
  },
  enrichment: {
    id: 'enrichment', title: 'Çevresel Zenginleştirme', source: 'general',
    text:
      'Zenginleştirme, hayvanın türe özgü davranışlarını sergileyebilmesi için kafes ' +
      'ortamına eklenen yuva malzemesi, saklanma alanı, kemirme materyali gibi ' +
      'unsurları kapsar. Zenginleştirme stresi azaltır ve anormal davranışların ' +
      'görülme sıklığını düşürür.'
  },
  biosecurity: {
    id: 'biosecurity', title: 'Biyogüvenlik ve Bariyer', source: 'general',
    text:
      'Biyogüvenlik, istenmeyen mikroorganizmaların tesise girmesini ve tesis içinde ' +
      'yayılmasını engelleme uygulamalarının tümüdür. Temiz ve kirli alan ayrımı, ' +
      'giriş-çıkış yönü (tek yönlü akış), kıyafet değişimi, karantina ve pest kontrolü ' +
      'bu sistemin temel bileşenleridir.'
  },
  quarantine: {
    id: 'quarantine', title: 'Karantina', source: 'general',
    text:
      'Tesise yeni giren hayvanlar, sağlık durumları değerlendirilene kadar mevcut ' +
      'koloniden ayrı tutulur. Karantina, tesise dışarıdan patojen girişini önlemenin ' +
      'en etkili basamaklarından biridir. Hastalık şüphesinde de etkilenen grubun ' +
      'ayrılması yayılımı sınırlar.'
  },
  hygiene: {
    id: 'hygiene', title: 'Kafes ve Oda Temizliği', source: 'general',
    text:
      'Kafes altlığının düzenli değişimi, oda yüzeylerinin temizliği ve ekipmanın ' +
      'uygun şekilde yıkanması hem hayvan sağlığı hem de personel sağlığı açısından ' +
      'gereklidir. Kirli altlıkta biriken amonyak, solunum yolu sağlığını olumsuz etkiler. ' +
      'Ancak aşırı sık temizlik de bazı türlerde koku işaretlerinin kaybı nedeniyle stres yaratabilir.'
  },
  ivc: {
    id: 'ivc', title: 'IVC Sistemleri', source: 'general',
    text:
      'Bireysel havalandırmalı kafes (IVC) sistemlerinde her kafese filtrelenmiş hava ' +
      'ayrı olarak verilir. Bu, kafesler arası bulaşma riskini azaltır ve mikrobiyolojik ' +
      'statünün korunmasına yardımcı olur. Buna karşılık yatırım ve işletme maliyeti yüksektir.'
  },
  spf: {
    id: 'spf', title: 'SPF ve Germ-Free', source: 'general',
    text:
      'SPF (specific pathogen free), belirli patojenlerin bulunmadığı tanımlanmış ' +
      'sağlık statüsündeki kolonileri ifade eder. Germ-free hayvanlar ise saptanabilir ' +
      'mikroorganizma taşımayacak biçimde izolatörlerde yetiştirilir. Her iki statü de ' +
      'sürekli izleme, katı bariyer uygulamaları ve yüksek işletme maliyeti gerektirir.'
  },
  gm_animals: {
    id: 'gm_animals', title: 'Genetiği Değiştirilmiş Hayvanlar', source: 'general',
    text:
      'Transgenik, knockout ve knockin gibi genetiği değiştirilmiş hatlar, belirli genlerin ' +
      'işlevini incelemek için kullanılır. Bu hayvanlarda beklenmeyen fenotipler ortaya ' +
      'çıkabildiğinden refah takibi ve genotiplendirme kayıtları özel önem taşır. ' +
      'Oyundaki genetik sistem, laboratuvar protokolü öğretmez; stratejik bir soyutlamadır.'
  },
  records: {
    id: 'records', title: 'Kayıt ve Taşıma', source: 'general',
    text:
      'Hayvanların kimliklendirilmesi, soy kütüğü, sağlık ve kullanım kayıtlarının ' +
      'tutulması hem izlenebilirlik hem de bilimsel tekrarlanabilirlik açısından zorunludur. ' +
      'Taşıma sırasında sıcaklık, havalandırma ve süre kontrol edilmezse hayvanlarda ' +
      'belirgin stres oluşur.'
  },
  waste: {
    id: 'waste', title: 'Atık Yönetimi', source: 'general',
    text:
      'Hayvan tesislerinde oluşan altlık, karkas, keskin atık ve kimyasal atıklar ' +
      'sınıflandırılarak, tesise ve mevzuata uygun yöntemlerle bertaraf edilir. ' +
      'Atık yönetimindeki aksama biyogüvenlik ve iş sağlığı riski doğurur.'
  },
  pest: {
    id: 'pest', title: 'Pest Kontrolü', source: 'general',
    text:
      'Yabani kemirgenler ve haşereler, tesise patojen taşıyabilecekleri için ' +
      'düzenli izleme ve önleyici uygulamalarla kontrol altında tutulur. ' +
      'Yem deposu, atık alanları ve dış cephe geçişleri en kritik noktalardır.'
  },
  environment: {
    id: 'environment', title: 'Fiziki Şartlar', source: 'general',
    text:
      'Hayvan odalarında sıcaklık, bağıl nem, havalandırma (hava değişim sayısı), ' +
      'aydınlatma döngüsü ve gürültü düzeyi kontrol altında tutulur. ' +
      'Bu parametrelerdeki dalgalanmalar hem refahı hem de deney sonuçlarının ' +
      'tekrarlanabilirliğini etkiler.'
  },
  stocking: {
    id: 'stocking', title: 'Kafes Yoğunluğu', source: 'general',
    text:
      'Kafes başına düşen hayvan sayısı, kullanılabilir taban alanı ve türün ' +
      'davranışsal ihtiyaçlarına göre belirlenir. Aşırı kalabalık; saldırganlık, ' +
      'stres, büyüme geriliği ve hastalık yayılımında artışa yol açar. ' +
      'Bazı türlerde ise tek başına barındırma sosyal stres oluşturur.'
  },

  // --- Saf oyun mekaniği kartları ---
  game_scoring: {
    id: 'game_scoring', title: 'Puanlama Nasıl Çalışır?', source: 'game',
    text:
      'Bu simülasyonda MONEY, ANIMAL_WELFARE, BIOSECURITY, ETHICS, ' +
      'SCIENTIFIC_REPUTATION ve STAFF_MORALE değerleri her gün yeniden hesaplanır. ' +
      'Oyun sonu derecesi bu beş boyutun ağırlıklı ortalamasından üretilir: ' +
      'yalnızca para kazanmak yüksek derece getirmez.'
  },
  game_time: {
    id: 'game_time', title: 'Zaman Modeli', source: 'game',
    text:
      'Bir oyun günü birkaç saniye sürer. Yaşlanma, gebelik, proje ilerleyişi, ' +
      'kurs haftaları ve mali akış bu günlük döngüde işler. Bu hızlandırma ' +
      'tamamen oynanabilirlik içindir; gerçek süreleri temsil etmez.'
  }
};

export const getKnowledge = (id) => KNOWLEDGE[id];
