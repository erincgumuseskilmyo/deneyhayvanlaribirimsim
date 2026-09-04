/**
 * BÖLÜM SONU QUIZ SORULARI
 * Sorular bilgi kartlarıyla aynı kaynak ayrımına tabidir:
 * 'general' etiketli sorular genel ilkeleri sınar, kaynak kitapla doğrulanmalıdır.
 */
export const QUIZZES = {
  chapter1: {
    id: 'chapter1',
    title: 'Bölüm 1 — Temel Kavramlar ve Etik',
    unlockAtDay: 30,
    questions: [
      {
        q: '3R ilkesinde "Reduction" neyi ifade eder?',
        options: [
          'Hayvan yerine alternatif yöntem kullanmayı',
          'Bilimsel amaca ulaşmak için gereken en az hayvan sayısını kullanmayı',
          'İşlemlerin acısını azaltmayı',
          'Deney süresini kısaltmayı'
        ],
        answer: 1, topic: 'three_r'
      },
      {
        q: 'Bir kurumda hayvan deneyi başvurularını değerlendiren yerel etik kurul hangisidir?',
        options: ['HADMEK', 'HADYEK', 'Biyogüvenlik Kurulu', 'Etik Denetim Ofisi'],
        answer: 1, topic: 'ethics_committee'
      },
      {
        q: 'Aşağıdakilerden hangisi "Refinement" kapsamına girer?',
        options: [
          'Hücre kültürü ile hayvanı tamamen ikame etmek',
          'Grup başına hayvan sayısını istatistiksel olarak azaltmak',
          'Uygun analjezi ve iyi barındırma ile acıyı en aza indirmek',
          'Projeyi reddetmek'
        ],
        answer: 2, topic: 'three_r'
      },
      {
        q: 'Düşük hayvan refahının bilimsel sonuçlara etkisi nedir?',
        options: [
          'Etkisi yoktur, sadece etik bir konudur',
          'Verilerin güvenilirliğini ve tekrarlanabilirliğini düşürür',
          'Sonuçları daha güçlü hale getirir',
          'Sadece maliyeti artırır'
        ],
        answer: 1, topic: 'welfare_five'
      },
      {
        q: 'Deney hayvanları kullanım sertifika programı tipik olarak neyi içerir?',
        options: [
          'Yalnızca teorik dersleri',
          'Yalnızca uygulamalı çalışmaları',
          'Teorik ve uygulamalı bölümlerin ikisini birden',
          'Sadece mevzuat sınavını'
        ],
        answer: 2, topic: 'certificate'
      }
    ]
  },

  chapter2: {
    id: 'chapter2',
    title: 'Bölüm 2 — Barındırma, Hijyen ve Biyogüvenlik',
    unlockAtDay: 90,
    questions: [
      {
        q: 'Temiz/kirli alan ayrımı ve tek yönlü akış hangi başlığın parçasıdır?',
        options: ['Zenginleştirme', 'Biyogüvenlik', 'Genotiplendirme', 'Ekonomi'],
        answer: 1, topic: 'biosecurity'
      },
      {
        q: 'Tesise yeni gelen hayvanlar için ilk uygulama hangisi olmalıdır?',
        options: [
          'Doğrudan üretim odasına almak',
          'Karantinada ayrı tutmak',
          'Hemen projeye dahil etmek',
          'Satışa çıkarmak'
        ],
        answer: 1, topic: 'quarantine'
      },
      {
        q: 'Kirli altlıkta biriken amonyağın en belirgin etkisi hangi sistem üzerinedir?',
        options: ['Sindirim sistemi', 'Solunum sistemi', 'İskelet sistemi', 'Görme'],
        answer: 1, topic: 'hygiene'
      },
      {
        q: 'IVC sistemlerinin temel avantajı nedir?',
        options: [
          'İşletme maliyetini düşürmesi',
          'Her kafese filtrelenmiş hava vererek kafesler arası bulaşmayı azaltması',
          'Temizliği kolaylaştırması',
          'Zenginleştirmeye gerek bırakmaması'
        ],
        answer: 1, topic: 'ivc'
      },
      {
        q: 'Aşırı kafes yoğunluğunun beklenen sonucu nedir?',
        options: [
          'Üreme başarısında artış',
          'Stres, saldırganlık ve hastalık yayılımında artış',
          'Refah puanında artış',
          'Yem tüketiminde azalma'
        ],
        answer: 1, topic: 'stocking'
      },
      {
        q: 'Pest kontrolünde en kritik izleme noktalarından biri hangisidir?',
        options: ['Eğitim sınıfı', 'Yem deposu', 'İdari oda', 'Personel odası'],
        answer: 1, topic: 'pest'
      }
    ]
  },

  chapter3: {
    id: 'chapter3',
    title: 'Bölüm 3 — İleri Sistemler ve Yönetim',
    unlockAtDay: 180,
    questions: [
      {
        q: 'SPF koloni ne anlama gelir?',
        options: [
          'Hiçbir mikroorganizma taşımayan hayvanlar',
          'Belirli patojenlerin bulunmadığı, tanımlanmış sağlık statüsündeki koloni',
          'Genetiği değiştirilmiş koloni',
          'Karantinadaki koloni'
        ],
        answer: 1, topic: 'spf'
      },
      {
        q: 'Germ-free hayvanlar nasıl barındırılır?',
        options: ['Standart kafeslerde', 'İzolatörlerde', 'Açık raflarda', 'Karantinada'],
        answer: 1, topic: 'spf'
      },
      {
        q: 'Genetiği değiştirilmiş hatlarda refah takibinin ayrıca önemli olmasının nedeni nedir?',
        options: [
          'Daha ucuz oldukları için',
          'Beklenmeyen fenotipler ortaya çıkabildiği için',
          'Daha hızlı ürediği için',
          'Kayıt gerektirmedikleri için'
        ],
        answer: 1, topic: 'gm_animals'
      },
      {
        q: 'Soy kütüğü ve kullanım kayıtlarının tutulması öncelikle neyi sağlar?',
        options: [
          'Vergi avantajı',
          'İzlenebilirlik ve bilimsel tekrarlanabilirlik',
          'Yem tasarrufu',
          'Personel morali'
        ],
        answer: 1, topic: 'records'
      },
      {
        q: 'Hayvan odasında kontrol altında tutulması gereken fiziki parametreler hangileridir?',
        options: [
          'Yalnızca sıcaklık',
          'Sıcaklık, nem, havalandırma, aydınlatma döngüsü ve gürültü',
          'Yalnızca aydınlatma',
          'Yalnızca gürültü'
        ],
        answer: 1, topic: 'environment'
      },
      {
        q: 'Bu oyunda oyun sonu derecesi neye göre hesaplanır?',
        options: [
          'Yalnızca toplam paraya göre',
          'Ekonomi, refah, etik, biyogüvenlik ve bilimsel itibarın birlikte değerlendirilmesiyle',
          'Hayvan sayısına göre',
          'Oda sayısına göre'
        ],
        answer: 1, topic: 'game_scoring'
      }
    ]
  }
};

export const QUIZ_LIST = Object.values(QUIZZES);
