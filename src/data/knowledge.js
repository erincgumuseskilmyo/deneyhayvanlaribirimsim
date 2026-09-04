/**
 * EĞİTİM BİLGİ KARTLARI
 *
 * KAYNAK: Korkmaz OT (ed.), ÖZ S, ŞENTÜRK H, UYANOĞLU M, ÖZMEN YAYLACI A.
 * "Laboratuvar Hayvanları Yetiştirme ve Sağlığı", Anadolu Üniversitesi
 * Açıköğretim Fakültesi Yayını No: 2460, E-ISBN 978-975-06-3162-7,
 * Eskişehir, 2019.
 *
 * KAYNAK ETİKETLERİ (oyuncuya görünür):
 *  - 'book'   : Kaynak kitaptan alınmış içerik. `ref` alanı bölüm/sayfa verir.
 *  - 'general': Kitapta yer almayan, alan literatüründe yaygın bilgi.
 *               Kesin bilimsel iddia olarak sunulmaz.
 *  - 'game'   : Tamamen oyun tasarımı kararı. Bilimsel iddia içermez.
 */

export const BOOK = {
  title: 'Laboratuvar Hayvanları Yetiştirme ve Sağlığı',
  editor: 'Doç. Dr. Orhan Tansel Korkmaz (ed.)',
  publisher: 'Anadolu Üniversitesi Açıköğretim Fakültesi, Yayın No: 2460',
  isbn: '978-975-06-3162-7',
  year: 2019
};

export const SOURCE_LABELS = {
  book: 'Kaynak kitap',
  general: 'Kitapta yer almayan genel bilgi — kesin bilimsel iddia değildir',
  game: 'Oyun tasarımı kararı (bilimsel iddia değildir)'
};

export const KNOWLEDGE = {
  // ---------------- BÖLÜM 2: ETİK ----------------
  three_r: {
    id: 'three_r', title: '3R İlkesi', source: 'book', ref: 'Bölüm 2, s. 22-23',
    text:
      '3R kuralı, 1959 yılında Russel ve Burch tarafından "İnsani Deneysel Tekniklerin ' +
      'İlkeleri (The Principles of Humane Experimental Techniques)" adlı eserde ortaya ' +
      'konmuştur. Üç ilke şunlardır: Replacement (yerine başkasını kullanma), ' +
      'Reduction (sayısını azaltma) ve Refinement (şiddetini azaltma). ' +
      'Son dönemde bu üç ilkeye Responsibility (sorumluluk) ve Respect (saygı) ' +
      'eklenerek 4. ve 5. R olarak kullanılmaya başlanmıştır.'
  },
  four_a: {
    id: 'four_a', title: '4A Kuralı', source: 'book', ref: 'Bölüm 2, s. 23',
    text:
      'Ülkemizde 3R ilkelerinin modifiye edilmiş ve Türkçede karşılık bulan şekli ' +
      '4A kuralıdır: Az sayıda deney hayvanı kullanımı, Ağrısız-acısız deney protokolü, ' +
      'Alternatif araştırma olanaklarını araştırmak, Ahlak ve bilimsel yönteme sahip araştırmacı.'
  },
  replacement_methods: {
    id: 'replacement_methods', title: 'Replacement Alternatifleri', source: 'book',
    ref: 'Bölüm 2, s. 23-25',
    text:
      'Replacement ilkesinde deney hayvanı yerine daha basit yapılı canlılardan ' +
      'yararlanılması önerilir. Başlıca alternatifler: az gelişmiş canlıların kullanımı ' +
      '(mikroorganizma, böcek, solucan), hücre/organ/doku kültürleri (in vitro), ' +
      'bilgisayar modelleri ve matematiksel yöntemler, veri bankaları, insanlardan elde ' +
      'edilen verilerin değerlendirilmesi, yapay modellemeler ve interaktif eğitim videoları. ' +
      'Eğitim çalışmalarında hayvan yerine maket kullanımı önceliklidir.'
  },
  ethics_committee: {
    id: 'ethics_committee', title: 'HADMEK ve HADYEK', source: 'book',
    ref: 'Bölüm 2, s. 27-31',
    text:
      '2006 yılında yayımlanan "Hayvan Deneyleri Etik Kurullarının Çalışma, Usul ve ' +
      'Esaslarına Dair Yönetmelik" ile HADMEK (Hayvan Deneyleri Merkezi Etik Kurulu) ve ' +
      'HADYEK (Hayvan Deneyleri Yerel Etik Kurulu) oluşturulmuştur. HADMEK, Tarım ve Orman ' +
      'Bakanlığı başkanlığında 3 ayda bir toplanan 21 kişilik kuruldur ve HADYEK’leri ' +
      'denetler. HADYEK en az 5, en fazla 21 üyeden oluşur; ayda en az bir kez toplanır, ' +
      'kararlar üyelerin en az üçte ikisinin katılımıyla oy çokluğuyla alınır.'
  },
  hadyek_decisions: {
    id: 'hadyek_decisions', title: 'HADYEK Kararları', source: 'book', ref: 'Bölüm 2, s. 30',
    text:
      'HADYEK yaptığı değerlendirme neticesinde dört karardan birini verir: ' +
      '"uygun", "düzeltilmesi gerekir", "şartlı olarak uygun" ya da "uygun değildir". ' +
      'Kararlar başvuru tarihinden itibaren kırk iş günü içinde yazılı olarak bildirilir. ' +
      '"Şartlı olarak uygun" kararı, projenin yapılabilirliğini sınamak amacıyla az sayıda ' +
      'hayvan üzerinde ön deney yapılmasını istemek için kullanılır; bu projeler hayvan ' +
      'refahı birimince izlendikten sonra uygun ya da uygun değildir şeklinde karara bağlanır. ' +
      'Bütün başvurular ve kararlar kayıt altına alınır ve en az beş yıl saklanır.'
  },
  hadyek_requirements: {
    id: 'hadyek_requirements', title: 'HADYEK Kurulma Şartları', source: 'book',
    ref: 'Bölüm 2, s. 28-29',
    text:
      'HADYEK kurulabilmesi için ilde, Tarım ve Orman Bakanlığından çalışma izinli deney ' +
      'hayvanı ünitesi bulunan kurum veya kuruluşların bulunması gerekir. Ayrıca hayvan ' +
      'deneylerinin yapılabilmesi için sadece HADYEK değil, hayvan refahı biriminin de ' +
      'bulunması zorunludur; aksi hâlde etik kurul izni olsa bile çalışmalara yasal olarak ' +
      'izin verilmez. Deney hayvanı ünitelerinde en az bir veteriner hekim bulunması ' +
      'zorunludur. Kuruldaki veteriner hekimin deney hayvanı kullanım sertifikasına sahip, ' +
      'tam zamanlı ve hayvan deneyleri konusunda en az 1 yıl deneyimli olması gerekir.'
  },
  ethics_principles: {
    id: 'ethics_principles', title: 'Yerel Etik Kurulların Çalışma İlkeleri', source: 'book',
    ref: 'Bölüm 2, s. 31',
    text:
      'Yerel etik kurullar; kötü muameleyi engellemek, ağrı ve stres içeren deneylerde bir ' +
      'hayvanın birden fazla kullanılmamasını sağlamak, geçerliliği ispatlanmış alternatif ' +
      'yöntem varsa hayvan deneyini etik olarak uygun görmemek, deneyin mümkün olan en az ' +
      'sayıda hayvanla yapılmasını sağlamak, acı ve ağrı çekilecek deneylerde uygun anestezi ' +
      'uygulanmasını sağlamak ve türe uygun fizyolojik, davranışsal ve çevresel şartların ' +
      'hazırlanmasını sağlamak ilkelerine göre hareket eder.'
  },
  certificate: {
    id: 'certificate', title: 'Deney Hayvanları Kullanım Sertifikası', source: 'book',
    ref: 'Bölüm 2, s. 32',
    text:
      'Sertifika programı 12.12.2007 tarih ve 2007/11 sayılı Genelgede belirtilen AB ' +
      'mevzuatına uyumlu olarak düzenlenir. Hedef kitle üç gruptur: araştırıcılar, hayvan ' +
      'teknisyeni/teknikerleri ve hayvan bakıcısı olarak çalışan personel. Program toplam ' +
      '80 saattir: 40 saati teorik, 40 saati uygulamalıdır. Eğitimin %80’ine devam ' +
      'zorunluluğu vardır. Sonunda yapılan sınavda 100 puan üzerinden 70 ve üzeri alan ' +
      'kursiyerler sertifika almaya hak kazanır.'
  },
  application_form: {
    id: 'application_form', title: 'Etik Kurul Başvuru Formu', source: 'book',
    ref: 'Bölüm 2, s. 33-34',
    text:
      'Başvuru formunda şunlara açıklık getirilmesi beklenir: araştırmanın başlığı, ' +
      'araştırma ekibi, araştırmanın türü, süresi ve amacı, deney hayvanları üzerinde ' +
      'yapılacak işlemler, alternatif yöntemler, hayvanların temin edileceği yer, deney ' +
      'hayvanının kimliği, seçilen türün gerekçeleri, deney grupları ve sayıları, bakım yeri ' +
      've koşulları, kullanılacak kimyasal/biyolojik maddeler, kısıtlayıcı durumlar, ortaya ' +
      'çıkabilecek tehlikeli durumlar ve oluşacak tıbbi atıklar ile imhası. ' +
      'Çalışma ekibinde yer alan araştırmacılardan en az birinin deney hayvanları kullanım ' +
      'sertifikasına sahip olması başvuru sırasında zorunludur.'
  },

  // ---------------- BÖLÜM 3: FİZİKİ ŞARTLAR ----------------
  facility_rooms: {
    id: 'facility_rooms', title: 'Tesis Odaları', source: 'book', ref: 'Bölüm 3, s. 45-53',
    text:
      'Deney hayvanı üretim, bakım ve barındırma ruhsatına sahip bir tesiste bulunması ' +
      'gereken özel işlevli odalar beş başlıkta toplanır: idari birim/personel hizmet odaları, ' +
      'sistem kontrol odaları, servis alanları, üretim ve barındırma odaları ve operasyon ' +
      'odaları. Operasyon odaları; deney hayvanı kabulü ve karantina odası, basit girişim ' +
      'odası, hayvan hazırlama odası, soyunma odası, operasyon odası, reanimasyon (uyandırma) ' +
      'odası, post-operatif bakım odası ile yıkama ve sterilizasyon odasından oluşur.'
  },
  environment: {
    id: 'environment', title: 'Sıcaklık, Nem ve Aydınlatma', source: 'book',
    ref: 'Bölüm 3, s. 47-48',
    text:
      'Ortam sıcaklığının 20-24 °C arasında tutulması istenen durumdur; sıcakkanlı olan bu ' +
      'canlıların düşük sıcaklıklara toleransı yüksek sıcaklıklara göre daha fazladır. ' +
      'Ortam nemi ortalama %45-65 aralığında yeterli kabul edilir. Sıçan yetiştirme ' +
      'odalarında nemin düşük olması yavrularda "ring-tail" oluşumuna yol açar. ' +
      'Aydınlatmada genel olarak 12 saat aydınlık / 12 saat karanlık döngüsü kullanılır ve ' +
      'deney hayvanlarının bulunduğu odalarda pencere olmamalıdır. Havalandırmada ortalama ' +
      'saatte 7.000-10.000 m³ havalandırma hızı yeterli olmakta, emilen hava yeniden ' +
      'içeriye verilmemektedir.'
  },
  cages: {
    id: 'cages', title: 'Yaşam Kafesleri', source: 'book', ref: 'Bölüm 3, s. 54-58',
    text:
      'Kafes alanı, hayvana olağan davranışlarının tümünü rahatlıkla gerçekleştirebileceği ' +
      'genişlikte yaşama alanı sağlamalıdır. Yaşam kafesleri tabanı kapalı "ayakkabı kutusu" ' +
      'tipinde ya da tabanına tel ızgara döşenmiş sürgülü tepsi tipinde olabilir. ' +
      'Izgaralı taban temizliği kolaylaştırır ve koprofajiyi engeller, ancak özellikle sıçan ' +
      've tavşanlarda ayak yaralanmalarına yol açabilir. Kafes malzemesi paslanmaz çelik ya ' +
      'da sert plastiktir (polikarbonat, polipropilen); galvaniz kaplı kafesler, hayvanların ' +
      'kemirerek çinko almaları nedeniyle artık kullanılmamaktadır.'
  },
  cage_size: {
    id: 'cage_size', title: 'Kafes Boyutları', source: 'book', ref: 'Bölüm 3, Tablo 3.2-3.7',
    text:
      'Kitap her tür için canlı ağırlığa göre minimum bölme büyüklüğü, hayvan başına taban ' +
      'alanı ve minimum bölme yüksekliği verir. Örnek olarak fare için minimum bölme ' +
      '330 cm², hayvan başına 60-100 cm² ve yükseklik 12 cm; sıçan için minimum bölme ' +
      '800 cm², hayvan başına 200-600 cm² ve yükseklik 18 cm’dir. Kobay ve tavşan gibi ' +
      'türler daha geniş yaşam alanlarına ihtiyaç duyar.'
  },
  ivc: {
    id: 'ivc', title: 'Mikroizolatör ve IVC Sistemleri', source: 'book', ref: 'Bölüm 3, s. 57',
    text:
      'İmmün sistemi baskılanarak yapılan özel araştırmalarda ortamın patojen ' +
      'mikroorganizmalardan arındırılmış olması gerekir. Mikroizolatör kafesler, kafes ' +
      'içindeki ortamı dış ortamdan izole eden özel bir kapak sistemi içerir ve kafesin ' +
      'kontamine olmasını engeller. Bu kafesler, havalandırması dış ortamdan bağımsız, nemi ' +
      've ısısı ayarlanabilen bireysel iklimlendirmeli kafes sistemleri (IVC) olarak da imal ' +
      'edilir. Bu sistemler rutin çalışmalar için oldukça maliyetlidir ve patojenden bağımsız ' +
      'özel modeller veya izole çalışmalar haricinde tercih edilmemektedir.'
  },
  metabolism_cage: {
    id: 'metabolism_cage', title: 'Metabolizma Kafesleri', source: 'book', ref: 'Bölüm 3, s. 58',
    text:
      'Bazı araştırmalarda hayvanın günlük aktivitelerinin sayısal takibi gerekir: belirli bir ' +
      'zaman dilimindeki su ve yem tüketimi ile oluşan idrar ve dışkı ölçülebilir değerlerdir. ' +
      'Bu amaçla üretilmiş tek bireylik özel kafeslere metabolizma kafesi denir. Tabanı ' +
      'ızgaralıdır; idrar özel bir kanal sistemiyle ayrı bir haznede, dışkı ise farklı bir ' +
      'kanalla ayrı bir kapta toplanır.'
  },
  feeding: {
    id: 'feeding', title: 'Beslenme ve Yem', source: 'book', ref: 'Bölüm 3, s. 59-60',
    text:
      'Laboratuvar hayvanlarında çoğunlukla sıkıştırılarak sert topaklar hâline getirilmiş ' +
      '"pelet yem" kullanılır. Pelet yem kesici dişlerin aşırı uzamasını önleyen törpüleyici ' +
      'bir etki yaratır. Standart bir pelet yem özetle %24 ham protein, %4 ham yağ ve %6 lif ' +
      'ile çeşitli vitamin ve mineralleri içermelidir. Yem depolarının serin, sıcaklığı 21 °C' +
      '’yi geçmeyen, karanlık, nemsiz ve iyi havalandırılan yerler olması gerekir. ' +
      'Yemlerin ideal tüketim süresi 3 aydır; uygun koşullarda 6 ay içinde tüketilebilir. ' +
      'Yem ve altlık malzemesi birbirinden ayrı yerlerde depolanır ve kesinlikle koridorlarda, ' +
      'laboratuvarlarda veya hayvan odalarında depolanmaz.'
  },
  water: {
    id: 'water', title: 'Su', source: 'book', ref: 'Bölüm 3, s. 60',
    text:
      'Hayvanlar su ihtiyaçlarını kafes telinin girintilerine yerleştirilen emzikli suluklarla ' +
      'karşılar. Bazı tesislerde merkezi sistemle su dağıtımı yapılır; bu işletme açısından ' +
      'pratik olsa da Pseudomonas aeruginosa gibi bazı mikroorganizmaların bulaşmasına yol ' +
      'açabildiğinden sürü sağlığı açısından risk oluşturur. Tek tek şişelerle su verilmesi ' +
      'iş yükünü artırsa da riski azalttığı için tercih edilir. Suluklar haftalık ya da tesisin ' +
      'gerekliliklerine göre belirlenen sürelerde temizlenmelidir.'
  },
  enrichment: {
    id: 'enrichment', title: 'Zenginleştirme', source: 'book', ref: 'Bölüm 3, s. 60-61',
    text:
      'Hayvanların kafes ortamında yaşamasından kaynaklanan stresten olumsuz etkilenmesini ' +
      'mümkün olduğu kadar azaltmaya yarayacak etmenleri sağlama işine zenginleştirme denir. ' +
      'Zenginleştirme materyalleri ağaç oyukları, kırpılmış kâğıtlar veya plastik araçlardan ' +
      'yapılabilir. Zenginleştirmenin belirli bir zaman aralığı yoktur; hayvanlar bu ' +
      'materyalleri her fırsatta kullanabilir. En önemli görev, hayvanlarla yakından ilgilenen ' +
      've bakımını üstlenmiş personele düşer; personel her türün davranışını kavrayarak ' +
      'zenginleştirme ihtiyacını belirleyebilecek yeteneğe sahip olmalı ya da eğitilmelidir. ' +
      'Her zenginleştirme girişimi her canlı türü için aynı etkiyi göstermez.'
  },

  // ---------------- BÖLÜM 4: REFAH ----------------
  welfare_indicators: {
    id: 'welfare_indicators', title: 'Hayvan Refahının Belirteçleri', source: 'book',
    ref: 'Bölüm 4, s. 73-74',
    text:
      'Deney hayvanlarının refahı tam olarak sağlanmadığı sürece araştırmalardan elde edilen ' +
      'verilerin güvenilirliğinden bahsetmek güçtür. Refah dört belirteç grubuyla izlenir. ' +
      'Genel belirteçler: ortalama yaşam süresinin kısalması, büyüme-gelişim grafiğinin altına ' +
      'inilmesi, üreme yaşı ve ortalama yavru sayısında sapmalar, hastalık sıklığının artması ' +
      've anormal davranışlar. Fizyolojik belirteçler: nabız, vücut sıcaklığı, solunum hızı, ' +
      'adrenalin salgısı ile kan glikoz, laktat ve serbest yağ asidi seviyelerindeki artışlar. ' +
      'Davranış belirteçleri: doğal davranışları sergileyememe. Özel belirteçler: ağrı, stres, ' +
      'eziyet, acı çekme ve kontrol kaybı.'
  },

  // ---------------- BÖLÜM 5: FARE / SIÇAN ----------------
  mouse_breeding: {
    id: 'mouse_breeding', title: 'Fare Üremesi', source: 'book', ref: 'Bölüm 5, s. 96',
    text:
      'Fareler 7-8 haftalıkken erginliğe erişir; östral siklusları 4-5 gün sürer. Hamilelik ' +
      'süresi 19-21 gündür ve bir seferde 6-12 yavru verebilirler. Yavrular tüysüz, gözleri ve ' +
      'kulakları kapalı doğar ve yirmi bir gün boyunca sütle beslenir; 14. günde gözlerini ' +
      'açarlar. 21. günden itibaren dişi ve erkek yavrular annelerinden ayrılarak ayrı ' +
      'kafeslere konmalıdır. Üretimde poligam (çok sayıda dişi ile tek erkek) ya da monogam ' +
      '(bir dişi, bir erkek) teknikler kullanılır.'
  },
  mouse_effects: {
    id: 'mouse_effects', title: 'Lee-Boot, Whitten ve Bruce Etkileri', source: 'book',
    ref: 'Bölüm 5, s. 96',
    text:
      'Bir kafeste çok sayıda yaşayan dişi farelerde östral siklus görülmez; buna Lee-Boot ' +
      'Etkisi denir. Dişilerin yaşadığı kafese bir erkek fare bırakıldığında dişilerin hepsi ' +
      'birden östral siklusa geçebilir; buna Whitten Etkisi denir. Yeni çiftleşmenin ' +
      'gerçekleştiği bir dişinin yanına farklı bir erkek konursa, bu erkeğin feromonu ' +
      'nedeniyle döllenmiş yumurta rahme yerleşemez ve düşer; buna Bruce Etkisi denir. ' +
      'Bu etkiler sıçanlarda farelerde görüldüğü kadar görülmez.'
  },
  rat_breeding: {
    id: 'rat_breeding', title: 'Sıçan Üremesi', source: 'book', ref: 'Bölüm 5, s. 105-106',
    text:
      'Sıçanlarda gebelik süresi 21-23 gündür ve genellikle 8-16 arasında yavru verirler. ' +
      'Östrus 4-5 gün sürer ve proöstrus, östrus, metöstrus, diöstrus olmak üzere dört ' +
      'safhadan oluşur. Yavrular 21 günlükken sütten ayrılıp cinsiyetlerine göre ayrı ' +
      'kafeslere konur. Çiftleşme sonrası dişi sıçanlar ayrı kafeslere alınmalı ve rahatsız ' +
      'edilmemelidir; yavrular doğduktan sonra kafeste kalan erkek sıçan yavruları yiyebilir. ' +
      'Üretimde monogam (1 dişi, 1 erkek) veya poligam (harem sistemi, 1 erkek, 2-6 dişi) ' +
      'teknikleri kullanılır.'
  },
  cannibalism: {
    id: 'cannibalism', title: 'Kannibalizm', source: 'book', ref: 'Bölüm 5, s. 96, 109',
    text:
      'Hayvanların birbirlerini veya yavrularını yemesine kannibalizm denir. Farelerde uzun ' +
      'süre aç kalmak kannibalizme sebep olabilir. Annenin ilk haftalarda rahatsız edilmesi ya ' +
      'da yavruların ele alınması da kannibalizme yol açabilir. Bu nedenle yeni yavruları ' +
      'olmuş bir farenin kafesinin veya altlık malzemesinin değiştirilmesi stresi artıracağı ' +
      'için anne farenin yavrularını yemesine sebep olabilir.'
  },
  records: {
    id: 'records', title: 'Kayıt ve İşaretleme', source: 'book', ref: 'Bölüm 5, s. 107',
    text:
      'Hayvanların doğum tarihleri, cinsiyetleri, ırkları ve sağlık durumları sürekli takip ' +
      'edilip kayıt altına alınmalıdır. Kafeslerde kayıt kartları bulundurulur; farklı ırklar ' +
      'oluşturmak için kullanılacak hayvanların kayıtları soyağacını da içermelidir. ' +
      'Üretildiği yerde değil başka bir merkezde kullanılacak deney hayvanlarının veteriner ' +
      'onaylı kayıtlarının olması yasal olarak zorunludur. İşaretleme yöntemleri arasında ' +
      'kuyruğu boyamak veya numaralandırmak (kısa süreli), kuyruk dövmesi, kulağa çentik atma, ' +
      'numaralı küpe ve deri altına yerleştirilen çip sayılabilir.'
  },
  transport: {
    id: 'transport', title: 'Taşıma', source: 'book', ref: 'Bölüm 5, s. 108',
    text:
      'Nakli yapılacak hayvanlar, hareketleri kısıtlanmayacak büyüklükteki taşıma kutularında ' +
      've uygun sayıda taşınmalıdır. Kutularda idrarı emecek miktarda altlık bulunmalıdır; ' +
      'bu, fare ve sıçanların vücut ısılarını kontrol etmeleri açısından da önemlidir. ' +
      'Nakil sırasında uygun havalandırma, ısı aralığı, yeterli su ve besin sağlanmalı, nakil ' +
      'olabildiğince kısa sürede tamamlanmalıdır. Tesise ulaşan hayvanlar en kısa sürede ' +
      'kutulardan çıkarılmalı, veteriner hekim kontrolünden sonra diğer hayvanlardan farklı ' +
      'bir yerde karantina odalarında barındırılmalıdır. Ortama alışma süresi sıçanlar için ' +
      'yedi gündür.'
  },
  hygiene: {
    id: 'hygiene', title: 'Kafes ve Oda Temizliği', source: 'book', ref: 'Bölüm 5, s. 108-109',
    text:
      'Mikro çevre fare veya sıçanların barındırıldığı kafes ortamı, makro çevre bu kafeslerin ' +
      'bulunduğu oda, mega çevre ise hayvanların yetiştirildiği binadır. Farklı bir durum söz ' +
      'konusu değilse kafesler haftada bir-iki kez değiştirilmeli, uygun deterjanla yıkanmalı ' +
      've iyi durulanmalıdır. Kalabalık kafesler ve fazla amonyak üreten diyabetik fareler daha ' +
      'sık değiştirilmelidir. Odalar yerdeki kalıntıların giderilmesi için her gün düzenli ' +
      'olarak temizlenmelidir; iyi bir sterilizasyon için temizlik hayvanlar odadan alındıktan ' +
      'sonra yapılmalıdır. Çok sık kafes ve altlık değişimi de iyi değildir.'
  },
  pest: {
    id: 'pest', title: 'Pest Kontrolü', source: 'book', ref: 'Bölüm 5, s. 109; Bölüm 3, s. 46',
    text:
      'Tesislerin istenmeyen böcek ve yabani fare gibi zararlılardan korunması gerekir; bu ' +
      'canlılar hastalık taşıyıcısı olabilir ve dışarıdan gelen yabani fareler yetiştirilen arı ' +
      'ırk fareler için tehdit oluşturur. Tesisin etrafına yabani kemirgenleri uzak tutmak için ' +
      'tuzaklar kurulmalı ve bunların günlük takibi yapılmalıdır. Böcekler için de tuzaklar ' +
      'kurulabilir veya zarar vermeyecek türde pestisitler kullanılabilir. Tesise dışarıdan ' +
      'girebilecek canlıların giriş kapıları, camlar veya havalandırma kanallarından girişini ' +
      'engelleyecek bariyerler kullanılmalıdır.'
  },

  // ---------------- BÖLÜM 7: GENETİK ----------------
  gm_animals: {
    id: 'gm_animals', title: 'Genetiği Değiştirilmiş Deney Hayvanları', source: 'book',
    ref: 'Bölüm 7, s. 139-143',
    text:
      'Bir transgenik hayvan başka bir organizmaya ya da türe ait geni kendi genomunda taşır. ' +
      'Genetik koddaki değişiklikler yabancı bir genin aktarılmasını (transgenik) ' +
      'kapsayabileceği gibi, mevcut bir genin hedeflenip mutasyona uğratılmasını da ' +
      '(knockout, knockin) kapsar. Hedeflenmiş mutasyona sahip hayvanlar çoğunlukla belirli ' +
      'bir geni susturulmuş "knockout" ya da daha az tercih edilen, belirli bir geni aktif ' +
      'hâle getirilmiş "knockin" hayvanlardır. Elde edilen homozigot fareler kendi aralarında ' +
      'çiftleştirilerek saf knockout/knockin fare kolonileri elde edilir.'
  },
  genotyping: {
    id: 'genotyping', title: 'Genotiplendirme', source: 'book', ref: 'Bölüm 7, s. 143',
    text:
      'Genotiplendirme, bir türün DNA dizisindeki farklılıkların, aynı türün başka ' +
      'bireylerinin DNA dizileri veya referans bir dizi ile karşılaştırılarak tespit edilmesi ' +
      'işlemidir. Çoğunlukla yavruların dokularından elde edilen DNA’nın analizi ile ' +
      'gerçekleştirilir. DNA analizi ve/veya genotiplendirme için kuyruk biyopsisi ile ilgili ' +
      'tüm işlemlerin ayrıntılı olarak açıklandığı bir başvuru formu, deney hayvanları etik ' +
      'kurulu onayına sunulmalıdır.'
  },
  gm_welfare: {
    id: 'gm_welfare', title: 'Genetiği Değiştirilmiş Hayvanların Refahı', source: 'book',
    ref: 'Bölüm 7, s. 150-152',
    text:
      'Genetiği değiştirilmiş hayvanların refahı, normal hayvanların refahıyla ilgili dikkat ' +
      'edilmesi gereken hususlara ilaveten bazı özel yaklaşımlar gerektirir. Özellikle ' +
      'farelerde artan kullanım, hayvan sağlığı ve refahının yerinde ve zamanında etkili bir ' +
      'şekilde sağlanması açısından çeşitli zorlukları beraberinde getirir. Davranışsal ' +
      'değerlendirmeye, hayvanların refahını olumsuz etkileyebilecek duyusal, motor veya ' +
      'motivasyon açıklarını belirlemek için kolonide yeterli miktarda transgenik hayvan ' +
      'bulunduğunda başlanmalıdır.'
  },

  // ---------------- BÖLÜM 8: BİYOGÜVENLİK ----------------
  biosecurity: {
    id: 'biosecurity', title: 'Laboratuvar Güvenliği ve Biyogüvenlik', source: 'book',
    ref: 'Bölüm 8, s. 175',
    text:
      'Laboratuvarlarda karşılaşılabilecek biyolojik tehlikeler ve bunlara karşı alınması ' +
      'gerekli önlemler "biyogüvenlik" olarak isimlendirilir. Biyogüvenlik; potansiyel risk ' +
      'taşıyan biyolojik materyal, enfeksiyon etkenleri ve bunların toksik olabilecek metabolik ' +
      'ürünleri veya genetik bileşenleriyle yapılan çalışmaların insan, hayvan ve çevre için ' +
      'güvenli biçimde sürdürülmesine yönelik laboratuvar alt yapı, tasarım, donanım, uygulama ' +
      've tekniklerinin tamamını içine alan tümleşik bir kavramdır.'
  },
  biosafety_levels: {
    id: 'biosafety_levels', title: 'Biyogüvenlik Seviyeleri (BGS-1…4)', source: 'book',
    ref: 'Bölüm 8, s. 175-176',
    text:
      'Risk gruplarına göre dört farklı biyogüvenlik seviyesi tanımlanmıştır. ' +
      'BGS-1: hastalık etkeni yetişkin insanlarda enfeksiyona neden olmaz; standart/temel ' +
      'laboratuvardır, laboratuvar kıyafeti, eldiven, yüz-göz koruyucu ve el yıkama lavabosu ' +
      'bulunur, hava çıkışı yönlendirilir ve tekrar içeri alınmaz. ' +
      'BGS-2: insan ve çevreye orta derecede tehlike oluşturan etkenler; ek olarak biyolojik ' +
      'tehlike uyarı işareti, kesici-delici alet önlemi, biyogüvenlik el kitabı, sınıf I ya da ' +
      'II biyogüvenlik kabini gerekir. ' +
      'BGS-3: aerosol yoluyla bulaşan, ölümcül olabilecek ajanlar; iki ayrı kapıdan kontrollü ' +
      'giriş, otoklav, özel solunum maskesi, sınıf II kabin ve negatif basınçlı ortam gerekir. ' +
      'BGS-4: aşısı ve tedavisi olmayan tehlikeli ajanlar; giriş-çıkışta kıyafet değişimi ve ' +
      'duş, pozitif basınçlı solunum cihazlı elbise, sınıf III kabin ve ayrı havalandırma ' +
      'tesisatı gerekir.'
  },
  quarantine: {
    id: 'quarantine', title: 'Karantina', source: 'book', ref: 'Bölüm 3, s. 52; Bölüm 5, s. 108',
    text:
      'Deney hayvanı kabulü ve karantina odası, tesise dışarıdan gelen hayvanların ilk ' +
      'kabulünün yapıldığı ve bakım odalarına alınmadan önce tesise adaptasyonunun sağlandığı ' +
      'odadır. Bu odalarda hayvanların sağlık durumu ve bir hastalık taşıyıp taşımadığı ' +
      'dikkatle takip edilmelidir; çünkü dışarıdan gelen bu hayvanlar taşıdıkları bir hastalık ' +
      'etmeni ile birim içindeki canlıların tümünün sağlığını tehdit eder. Karantina odası ' +
      'aynı zamanda birim içindeki sağlığı iyi durumda olmayan hayvanların takip edildiği odadır.'
  },
  barrier: {
    id: 'barrier', title: 'Bariyerli Yetiştirme', source: 'book', ref: 'Bölüm 3, s. 52',
    text:
      'Tesis içerisinde bariyerli yetiştirme yapılıyorsa odanın her iki tarafında kapı ' +
      'bulunmalı ve bu kapılardan biri kirli, diğeri temiz koridora açılmalıdır. Personelin ' +
      'temiz çalışma kıyafeti ile tesis içinde işlerini gerçekleştirmesi, hem diğer personelin ' +
      'hem de yetiştirilen hayvanların sağlığı açısından önem taşır; bu nedenle tesiste ' +
      'kıyafet değiştirilebilecek ve gerektiğinde duş alınabilecek bir soyunma odası bulunmalıdır.'
  },
  waste: {
    id: 'waste', title: 'Atıklar ve Depolanması', source: 'book', ref: 'Bölüm 8, s. 178-179',
    text:
      'Atıklar üretildikleri yer ve üretim şekline göre sınıflandırılır: evsel atıklar (genel ' +
      've ambalaj atıkları), tıbbi atıklar (enfeksiyöz, patolojik, kesici-delici), tehlikeli ' +
      'atıklar ve radyoaktif atıklar. Hayvanlar üzerinde araştırma ve deney yapan kuruluşlar ' +
      'Tıbbi Atıkların Kontrolü Yönetmeliği’ne göre "orta miktarda atık üreten kuruluşlar" ' +
      'olarak nitelendirilir. Tıbbi atıkların toplanmasında, üzerinde biyolojik tehlike uyarı ' +
      'işareti ile "DİKKAT! TIBBİ ATIK" ikazı taşıyan kırmızı renkli plastik torbalar ' +
      'kullanılmalıdır. Kafeslerde barındırılan deney hayvanlarının altlıkları kesinlikle ' +
      'hayvan odalarında değiştirilmemeli, kirli altlık özel atık poşetlerine konularak ' +
      'depolanmalıdır.'
  },

  // ---------------- KİTAPTA YER ALMAYAN ----------------
  spf_note: {
    id: 'spf_note', title: 'SPF ve Germ-Free Hakkında Not', source: 'general',
    text:
      'Alan literatüründe, belirli patojenlerden ari (SPF) ve germ-free koloniler ileri ' +
      'barındırma statüleri olarak tanımlanır. Bu kavramlar bu simülasyonun kaynak kitabında ' +
      'geçmediği için oyun mekaniğine dâhil edilmemiştir; oyundaki ileri biyogüvenlik ' +
      'basamakları bunun yerine kitapta tanımlanan bariyerli yetiştirme ve BGS-1…4 ' +
      'seviyeleri üzerine kurulmuştur.'
  },

  // ---------------- OYUN MEKANİĞİ ----------------
  game_scoring: {
    id: 'game_scoring', title: 'Puanlama Nasıl Çalışır?', source: 'game',
    text:
      'Bu simülasyonda MONEY, ANIMAL_WELFARE, BIOSECURITY, ETHICS, ' +
      'SCIENTIFIC_REPUTATION ve STAFF_MORALE değerleri her gün yeniden hesaplanır. ' +
      'Oyun sonu derecesi bu beş boyutun ağırlıklı ortalamasından üretilir: ' +
      'yalnızca para kazanmak yüksek derece getirmez. Ağırlıklar ve formüller ' +
      'oyun dengesi kararıdır, kaynak kitaptan gelmez.'
  },
  game_time: {
    id: 'game_time', title: 'Zaman Modeli', source: 'game',
    text:
      'Bir oyun günü birkaç saniye sürer. Yaşlanma, gebelik, proje ilerleyişi, ' +
      'kurs günleri ve mali akış bu günlük döngüde işler. Bu hızlandırma ' +
      'tamamen oynanabilirlik içindir; gerçek süreleri temsil etmez. ' +
      'Buna karşılık gebelik süresi, sütten kesme yaşı gibi biyolojik süreler ' +
      'kaynak kitaptaki gün değerleriyle modellenmiştir.'
  }
};

export const getKnowledge = (id) => KNOWLEDGE[id];
