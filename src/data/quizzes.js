/**
 * BÖLÜM SONU QUIZ SORULARI
 *
 * Tüm sorular kaynak kitaptan üretilmiştir; her sorunun `ref` alanı
 * doğrulanabileceği bölüm ve sayfayı verir. `topic` alanı, yanlış yanıt
 * durumunda tekrar önerilecek bilgi kartını gösterir.
 */
export const QUIZZES = {
  chapter1: {
    id: 'chapter1',
    title: 'Bölüm 1 — Etik, 3R ve Etik Kurullar',
    unlockAtDay: 30,
    questions: [
      {
        q: '3R kuralında "Refinement" ilkesinin kitapta verilen Türkçe karşılığı nedir?',
        options: ['Yerine başkasını kullanma', 'Sayısını azaltma', 'Şiddetini azaltma', 'Sorumluluk alma'],
        answer: 2, topic: 'three_r', ref: 'Bölüm 2, s. 22'
      },
      {
        q: '3R kuralı ilk olarak kim tarafından ve hangi yıl ortaya konmuştur?',
        options: [
          'Russel ve Burch, 1959', 'Pasteur ve Koch, 1885',
          'Bernard ve Magendie, 1865', 'Watson ve Crick, 1953'
        ],
        answer: 0, topic: 'three_r', ref: 'Bölüm 2, s. 22'
      },
      {
        q: 'Ülkemizde 3R ilkelerinin Türkçede karşılık bulan şekli olan 4A kuralında aşağıdakilerden hangisi YOKTUR?',
        options: [
          'Az sayıda deney hayvanı kullanımı',
          'Ağrısız-acısız deney protokolü',
          'Alternatif araştırma olanaklarını araştırmak',
          'Araştırmanın maliyetini düşürmek'
        ],
        answer: 3, topic: 'four_a', ref: 'Bölüm 2, s. 23'
      },
      {
        q: 'HADYEK en az kaç, en fazla kaç üyeden oluşur?',
        options: ['En az 3, en fazla 11', 'En az 5, en fazla 21', 'En az 7, en fazla 15', 'En az 9, en fazla 25'],
        answer: 1, topic: 'ethics_committee', ref: 'Bölüm 2, s. 29'
      },
      {
        q: 'HADYEK değerlendirme sonucunda aşağıdaki kararlardan hangisini VEREMEZ?',
        options: ['Uygun', 'Düzeltilmesi gerekir', 'Şartlı olarak uygun', 'Süresiz olarak ertelenmiştir'],
        answer: 3, topic: 'hadyek_decisions', ref: 'Bölüm 2, s. 30'
      },
      {
        q: 'HADYEK kararları başvuru sahibine kaç iş günü içinde bildirilir?',
        options: ['On iş günü', 'Yirmi iş günü', 'Kırk iş günü', 'Altmış iş günü'],
        answer: 2, topic: 'hadyek_decisions', ref: 'Bölüm 2, s. 30'
      },
      {
        q: 'Bir ilde hayvan deneylerinin yapılabilmesi için HADYEK’in yanında hangisinin bulunması zorunludur?',
        options: ['Hayvan refahı birimi', 'Genetik laboratuvarı', 'IVC odası', 'Metabolizma birimi'],
        answer: 0, topic: 'hadyek_requirements', ref: 'Bölüm 2, s. 28'
      },
      {
        q: 'Deney hayvanları kullanım sertifika programı toplam kaç saattir ve nasıl dağılır?',
        options: [
          '40 saat: 20 teori + 20 uygulama',
          '80 saat: 40 teori + 40 uygulama',
          '60 saat: 30 teori + 30 uygulama',
          '120 saat: 60 teori + 60 uygulama'
        ],
        answer: 1, topic: 'certificate', ref: 'Bölüm 2, s. 32'
      },
      {
        q: 'Sertifika programında adayların eğitimin yüzde kaçına devam zorunluluğu vardır?',
        options: ['%60', '%70', '%80', '%100'],
        answer: 2, topic: 'certificate', ref: 'Bölüm 2, s. 32'
      },
      {
        q: 'Etik kurul başvurusunda çalışma ekibiyle ilgili zorunlu şart nedir?',
        options: [
          'Ekipteki herkesin doktora derecesine sahip olması',
          'Ekipte en az bir kişinin deney hayvanları kullanım sertifikasına sahip olması',
          'Ekibin en az beş kişiden oluşması',
          'Ekipte bir hukukçu bulunması'
        ],
        answer: 1, topic: 'application_form', ref: 'Bölüm 2, s. 33'
      }
    ]
  },

  chapter2: {
    id: 'chapter2',
    title: 'Bölüm 2 — Fiziki Şartlar, Kafesler ve Hijyen',
    unlockAtDay: 90,
    questions: [
      {
        q: 'Deney hayvanı odalarında ortam sıcaklığının hangi aralıkta tutulması istenir?',
        options: ['15-18 °C', '18-20 °C', '20-24 °C', '24-28 °C'],
        answer: 2, topic: 'environment', ref: 'Bölüm 3, s. 48'
      },
      {
        q: 'Ortam neminin ortalama olarak hangi aralıkta olması yeterli kabul edilir?',
        options: ['%20-35', '%35-45', '%45-65', '%65-85'],
        answer: 2, topic: 'environment', ref: 'Bölüm 3, s. 48'
      },
      {
        q: 'Sıçan yetiştirme odalarında ortam neminin düşük olması yavrularda neye yol açar?',
        options: ['Kannibalizm', 'Ring-tail', 'Koprofaji', 'Obezite'],
        answer: 1, topic: 'environment', ref: 'Bölüm 3, s. 48'
      },
      {
        q: 'Deney hayvanı odalarında aydınlatma döngüsü genel olarak nasıl uygulanır?',
        options: [
          '8 saat aydınlık / 16 saat karanlık',
          '12 saat aydınlık / 12 saat karanlık',
          '16 saat aydınlık / 8 saat karanlık',
          'Sürekli aydınlık'
        ],
        answer: 1, topic: 'environment', ref: 'Bölüm 3, s. 48'
      },
      {
        q: 'Fareler için önerilen minimum bölme büyüklüğü ve minimum bölme yüksekliği nedir?',
        options: ['150 cm² / 10 cm', '330 cm² / 12 cm', '800 cm² / 18 cm', '1200 cm² / 18 cm'],
        answer: 1, topic: 'cage_size', ref: 'Bölüm 3, Tablo 3.2'
      },
      {
        q: 'Galvaniz kaplı kafeslerin artık kullanılmamasının nedeni nedir?',
        options: [
          'Çok ağır olmaları',
          'Hayvanların kemirerek çinko almaları ve zarar görmeleri',
          'Şeffaf olmamaları',
          'Pahalı olmaları'
        ],
        answer: 1, topic: 'cages', ref: 'Bölüm 3, s. 55'
      },
      {
        q: 'Izgara tabanlı sürgülü tepsi kafeslerin dezavantajı nedir?',
        options: [
          'Temizliğinin zor olması',
          'Koprofajiyi artırması',
          'Özellikle sıçan ve tavşanlarda ayak yaralanmalarına neden olabilmesi',
          'Koku oluşturması'
        ],
        answer: 2, topic: 'cages', ref: 'Bölüm 3, s. 57'
      },
      {
        q: 'Standart bir pelet yemde bulunması gereken ham protein oranı nedir?',
        options: ['%4', '%6', '%14', '%24'],
        answer: 3, topic: 'feeding', ref: 'Bölüm 3, s. 59'
      },
      {
        q: 'Yem depolarının sıcaklığı en fazla kaç °C olmalıdır?',
        options: ['15 °C', '18 °C', '21 °C', '25 °C'],
        answer: 2, topic: 'feeding', ref: 'Bölüm 3, s. 49, 59'
      },
      {
        q: 'Farklı bir durum söz konusu değilse kafesler ne sıklıkla değiştirilmelidir?',
        options: ['Günde bir kez', 'Haftada bir-iki kez', 'Ayda bir kez', 'Üç ayda bir'],
        answer: 1, topic: 'hygiene', ref: 'Bölüm 5, s. 109'
      }
    ]
  },

  chapter3: {
    id: 'chapter3',
    title: 'Bölüm 3 — Refah, Üretim, Genetik ve Biyogüvenlik',
    unlockAtDay: 180,
    questions: [
      {
        q: 'Kitapta hayvan refahının belirteçleri kaç grupta incelenir?',
        options: [
          'İki: fiziksel ve zihinsel',
          'Üç: genel, fizyolojik, davranış',
          'Dört: genel, fizyolojik, davranış ve özel belirteçler',
          'Beş: beslenme, barınma, sağlık, davranış, çevre'
        ],
        answer: 2, topic: 'welfare_indicators', ref: 'Bölüm 4, s. 73-74'
      },
      {
        q: 'Aşağıdakilerden hangisi fizyolojik refah belirteçlerindendir?',
        options: [
          'Doğal davranışları sergileyememe',
          'Nabız, vücut sıcaklığı ve solunum hızındaki artışlar',
          'Ortalama yaşam süresinin kısalması',
          'Kontrol kaybı'
        ],
        answer: 1, topic: 'welfare_indicators', ref: 'Bölüm 4, s. 73'
      },
      {
        q: 'Farelerde hamilelik süresi ve bir batındaki yavru sayısı nedir?',
        options: ['16 gün / 6-8 yavru', '19-21 gün / 6-12 yavru', '21-23 gün / 8-16 yavru', '31-32 gün / 7-8 yavru'],
        answer: 1, topic: 'mouse_breeding', ref: 'Bölüm 5, s. 96'
      },
      {
        q: 'Bir kafeste çok sayıda yaşayan dişi farelerde östral siklusun görülmemesine ne ad verilir?',
        options: ['Bruce Etkisi', 'Whitten Etkisi', 'Lee-Boot Etkisi', 'Ring-tail'],
        answer: 2, topic: 'mouse_effects', ref: 'Bölüm 5, s. 96'
      },
      {
        q: 'Sıçanlarda gebelik süresi ve yavru sayısı nedir?',
        options: ['16 gün / 6-8 yavru', '19-21 gün / 6-12 yavru', '21-23 gün / 8-16 yavru', '59-72 gün / 2-5 yavru'],
        answer: 2, topic: 'rat_breeding', ref: 'Bölüm 5, s. 105-106'
      },
      {
        q: 'Hayvanların birbirlerini veya yavrularını yemesine ne ad verilir?',
        options: ['Koprofaji', 'Kannibalizm', 'Etoloji', 'Premedikasyon'],
        answer: 1, topic: 'cannibalism', ref: 'Bölüm 5, s. 96'
      },
      {
        q: 'Kitapta "mikro çevre" hangisini tanımlar?',
        options: [
          'Hayvanların barındırıldığı kafes ortamı',
          'Kafeslerin bulunduğu oda',
          'Hayvanların yetiştirildiği bina',
          'Tesisin bulunduğu yerleşke'
        ],
        answer: 0, topic: 'hygiene', ref: 'Bölüm 5, s. 108'
      },
      {
        q: 'Belirli bir geni susturulmuş hayvanlara ne ad verilir?',
        options: ['Transgenik', 'Knockout', 'Knockin', 'İnbred'],
        answer: 1, topic: 'gm_animals', ref: 'Bölüm 7, s. 141'
      },
      {
        q: 'BGS-3 laboratuvarında aşağıdakilerden hangisi gereklidir?',
        options: [
          'Yalnızca el yıkama lavabosu',
          'Ortamın negatif basınçlı olması ve iki ayrı kapıdan kontrollü giriş',
          'Pozitif basınçlı solunum cihazlı elbise',
          'Hiçbir özel önlem gerekmez'
        ],
        answer: 1, topic: 'biosafety_levels', ref: 'Bölüm 8, s. 176'
      },
      {
        q: 'Tıbbi atıkların toplanmasında hangi renkte torbalar kullanılır?',
        options: ['Mavi', 'Siyah', 'Kırmızı', 'Yeşil'],
        answer: 2, topic: 'waste', ref: 'Bölüm 8, s. 178'
      }
    ]
  }
};

export const QUIZ_LIST = Object.values(QUIZZES);
