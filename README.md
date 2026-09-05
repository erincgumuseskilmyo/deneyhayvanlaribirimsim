# Laboratuvar Hayvanları Yetiştirme Birimi — Eğitici 3D Simülasyon

Web tabanlı, üstten/izometrik bakışlı, low-poly bir **deney hayvanları üretim ve
kullanım birimi yönetim simülasyonu**. Oyuncu sıfırdan bir tesis kurar, personel
çalıştırır, hayvan yetiştirir, etik kurul (HADYEK) olarak araştırma başvurularını
değerlendirir, sertifika programı açar ve tesisi büyütür.

**Oyunun amacı sadece para kazanmak değildir.** Dönem sonu derecesi beş boyutun
birlikte dengelenmesiyle hesaplanır: ekonomi, hayvan refahı, biyogüvenlik,
etik uygunluk ve bilimsel kalite.

## Kaynak

Eğitim içeriği şu kitaba dayanır:

> **Laboratuvar Hayvanları Yetiştirme ve Sağlığı** — Ed. Doç. Dr. Orhan Tansel Korkmaz.
> Anadolu Üniversitesi Açıköğretim Fakültesi Yayını No: 2460,
> E-ISBN 978-975-06-3162-7, Eskişehir 2019. (188 sayfa, 8 bölüm — depoda mevcut.)

38 bilgi kartının 35'i doğrudan kitaptan üretilmiştir ve her biri oyun içinde
**bölüm/sayfa referansıyla** gösterilir. 30 quiz sorusunun tamamı referanslıdır.
Kitapta yer almayan içerik `Kitapta yer almayan genel bilgi`, salt oyun kararları
ise `Oyun tasarımı kararı` etiketiyle ayrılır — hiçbiri kitaba atfedilmez.
`tests/book.test.js` bu ayrımı ve kitaptan alınan sayısal değerleri kilitler.
Ayrıntılı eşleme tablosu: [`docs/KAYNAK.md`](docs/KAYNAK.md).

## Çalıştırma

```bash
npm install
npm run dev           # http://localhost:5173
npm run build         # dist/ üretir
npm run preview
npm run build:single  # dist-single/index.html — tek dosya, çift tıkla çalışır
npm test              # 38 test (tarayıcı gerekmez)
```

**Kurulum yapmadan denemek:** `npm run build:single` komutu her şeyi (JS, CSS,
three.js) tek bir HTML dosyasına gömer. Oluşan `dist-single/index.html`
dosyasını tarayıcıda açmanız yeterlidir — sunucu, internet veya Node gerekmez.
Dosya doğrudan açıldığında harici model araması yapılmaz.

## Kontroller

| Girdi | İşlev |
|---|---|
| Sol tık sürükle | Kamerayı döndür |
| Sağ tık sürükle | Kaydır (pan) |
| Tekerlek | Yakınlaş / uzaklaş |
| Sol panelden oda seç → zemine tık | Oda yerleştir |
| Koridor seç → zemine tık / sürükle | Koridor karosu döşe (sürükleyerek sıra) |
| Yıkım modunda koridora tık | Koridor karosunu sök |
| Sağ tık (inşa modunda) / `Esc` | İnşa modundan çık |
| Odaya tık | Detay panelini aç |
| `Boşluk` | Duraklat / devam |
| `1` `2` `3` | Hız 1× / 2× / 4× |

Kamera dikey açısı sınırlıdır ve yatay bakışa yaklaştıkça duvarlar
şeffaflaşır, böylece oda içleri her zaman görünür kalır. Her odanın üstünde,
barındırılan türü gösteren ve kameraya dönük duran bir tabela vardır
(Bölüm 3, s. 51); kapılarda gözlem penceresi bulunur.

## Oynanış akışı

1. Hayvan Odası, Giyinme/Geçiş Odası, Temizlik Alanı, Karantina ve Teknik Oda inşa edin.
2. **Personel** sekmesinden en az bir Veteriner Hekim ve bir Hayvan Bakıcısı alın.
3. Sağ panelden **çalışma izni** başvurusu yapın → tesis seviyesi 2 açılır.
4. Hayvan Odasına kafes alın, ilk **fare kolonisini** kurun.
5. **Hayvan refahı birimi** kurun ve ardından **HADYEK**'i oluşturun
   (kitaba göre ikisi de zorunludur) → araştırma başvuruları gelmeye başlar.
6. Başvuruları kitaptaki dört karardan biriyle sonuçlandırın:
   `UYGUN` / `DÜZELTİLMESİ GEREKİR` / `ŞARTLI OLARAK UYGUN` / `UYGUN DEĞİLDİR`.
7. Eğitim Sınıfı inşa edip **sertifika programı** açın
   (80 saat = 40 teori + 40 uygulama, %80 devam, 70/100 geçme notu).
8. Mikroizolatör → IVC → bariyerli yetiştirme → BGS-2/3/4 hattında tesisi büyütün.

Gün uzunluğu ~4 saniyedir; 720. günde (2 oyun yılı) dönem sonu
değerlendirmesi yapılır ve **S / A / B / C / D** derecesi verilir.

## Mimari

Tek dev dosya yerine sistem başına ayrı modüller kullanılır. Simülasyon
katmanı Three.js'e bağımlı **değildir** — bu yüzden testler tarayıcısız çalışır.

```
src/
  core/        EventBus, GameState, TimeSystem, RNG (deterministik), Game, utils
  entities/    Animal, Cage, Room, StaffMember, ResearchProject, CertificationCourse
  systems/     Facility, Husbandry, Welfare, Breeding, Staff, Economy,
               Biosecurity, Disease, Research, Ethics, Certification,
               Genetics, Event, Scoring, Report
  world/       SceneManager (kamera/ışık), ModelFactory (low-poly), WorldRenderer
  ui/          HUD, BuildPanel, DetailPanel, TabBar, Modal, Toasts
    screens/   Staff, Ethics, Certification, Tech, Report, Quiz, Guide, EndGame
  data/        species, rooms, cages, staffRoles, tech, courseModules,
               researchTemplates, knowledge (bilgi kartları), quizzes
tests/         node:test ile headless simülasyon testleri
```

**Günlük tick sırası** (`core/Game.js`): iklimlendirme → bakım/temizlik →
personel → refah/sağlık/yaşlanma → üreme → hastalık → biyogüvenlik →
genetik → etik → araştırma → sertifika → ekonomi → olaylar → puanlama → rapor.

`EventBus` sayesinde sistemler birbirini doğrudan import etmez; UI yalnızca
olayları dinler.

## Uygulanan sistemler

- **Hayvan:** id, tür, cinsiyet, yaş, ağırlık, sağlık, refah, stres, genetik,
  üreme durumu, kafes/oda, mikrobiyolojik statü, deneysel statü, doğum günü, soy hattı.
  6 türün gebelik süresi, yavru sayısı, sütten kesme yaşı ile sıcaklık/nem
  aralıkları kitaptan alınmıştır.
- **Refah:** iki katman. *Faktörler* (oyun modeli) refah puanını sürükler;
  *belirteçler* kitaptaki dört grubu (genel, fizyolojik, davranış, özel)
  raporda gösterir. Kafes yoğunluğu artık uydurma bir sayı değil — kitabın
  taban alanı tablolarından (Tablo 3.2-3.7) hesaplanır.
- **Tesis:** grid üzerinde 16 oda tipi — kitaptaki beş işlev grubuna göre
  (idari, sistem kontrol, servis, üretim/barındırma, operasyon) düzenlenmiş.
  Oda başına sıcaklık-nem-havalandırma-gürültü simülasyonu ve 7 kafes tipi:
  ayakkabı kutusu, ızgara tabanlı sürgülü tepsi, mikroizolatör, IVC,
  damızlık kafesi (1300 cm²), tel örgü kafes (75×75 cm) ve metabolizma kafesi.
  Geniş kafesler odanın kapasitesinden daha çok yer kaplar ve sahnede
  gerçekten büyük görünür.
- **Koridorlar:** kitabın servis alanlarından biri (Bölüm 3, s. 49-51).
  1×1 karolar hâlinde döşenen **temiz** ve **kirli** koridor olmak üzere iki
  tip vardır. Bir odanın kenarına değen koridor o odaya kapı açar; köşeden
  değen karo saymaz. Koridora hiç bağlanmayan odada malzeme ve kafes taşınması
  güçleştiği için bakım kapsamı düşer, yem/su aksama olasılığı artar.
  **Bariyerli yetiştirme** teknolojisi, en az bir barındırma odasının bir
  kenarı temiz, diğer kenarı kirli koridora açılmadan açılamaz — kitabın
  "kapılardan biri kirli, biri de temiz koridora açılmalıdır" kuralı
  (s. 52) doğrudan bir yerleşim bulmacası olarak oyuna girer. Oda detay
  panelinde odanın koridor bağlantısı işaretlerle gösterilir.
- **Etik kurul (HADYEK):** kitaptaki dört karar, kırk iş günü süre sınırı ve
  başvuru formunun 16 alanı üzerinden kural tabanlı denetim. "Şartlı olarak uygun"
  kararı, hayvan refahı biriminin izlediği bir ön deney süreci başlatır.
  Her karardan sonra gerekçeli, sayfa referanslı geri bildirim verilir.
- **Sertifika programı:** kitaptaki 13 konu başlığı, 80 saat (40+40),
  %80 devam zorunluluğu, 0-100 final sınavı, ≥70 `CERTIFIED` / <70 `FAILED`.
- **Hastalık:** salgın olasılığı hijyen, biyogüvenlik, yoğunluk ve pest
  baskısından hesaplanır; 4 müdahale seçeneği farklı sonuçlar üretir.
- **Olaylar:** 10 ağırlıklandırılmış olay (elektrik/su kesintisi, havalandırma
  ve ekipman arızası, yem fiyatı, personel eksikliği, etik denetim,
  beklenmeyen ölüm, refah alarmı, araştırmacı ziyareti).
- **Ekonomi:** yem, su, altlık, elektrik, bakım, maaş, veteriner, biyogüvenlik,
  teknoloji idamesi giderleri; hayvan satışı, proje, tesis kullanımı ve
  sertifika gelirleri. Günlük/haftalık/aylık raporlar.
- **Eğitim:** kararların ardından "Bu neden önemlidir?" bilgi kartları,
  3 bölüm quizi (5-6 soru), yanlış konular için tekrar önerisi.

## Modeller ve varlık boru hattı

Low-poly modeller `ModelFactory` içinde **prosedürel olarak** üretilir; oyun
harici dosya olmadan eksiksiz çalışır. Blender'dan çıkarılmış GLB modelleri
isteğe bağlı olarak devreye girer:

```
public/models/
  manifest.json     ← hangi modelin hangi dosyadan geleceği
  animal_mouse.glb
  cage_ivc.glb
```

`manifest.example.json` dosyasını `manifest.json` olarak kopyalayıp yalnızca
ürettiğiniz modelleri bırakın. Boru hattı şunları yapar:

- Açılışta manifesti okuyup modelleri yükler; **manifest yoksa** sessizce
  prosedürel modellerle devam eder.
- Bir dosya eksik veya bozuksa **yalnızca o model** prosedürele düşer, oyun
  çalışmaya devam eder ve uyarı gösterir.
- `fitTo` ile modeli hedef boyuta ölçekler ve tabanını zemine oturtur —
  Blender'daki ölçek hatalarına karşı koruma.
- GLB'de animasyon klibi varsa `AnimationMixer` ile oynatır; aynı türden
  kopyalar senkron oynamasın diye başlangıç zamanını rastgeleleştirir.
- İskeletli (skinned) modeller `SkeletonUtils` ile doğru kopyalanır.

Model adları, ölçek/yön/pivot kuralları, poligon bütçesi ve Blender export
ayarları: [`docs/MODELLER.md`](docs/MODELLER.md)

## İçerik sınırları

Hayvanlara yönelik işlemler grafik biçimde gösterilmez; kan/gore içeriği yoktur.
Ötenazi ve çalışma sonu gibi süreçler yalnızca kayıt düzeyinde modellenmiştir.
Genetik sistem gerçek laboratuvar protokolü öğretmez; stratejik bir soyutlamadır.
