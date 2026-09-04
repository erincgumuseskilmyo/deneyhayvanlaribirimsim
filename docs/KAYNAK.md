# Kaynak Kitap ve İçerik Doğrulaması

## Kaynak

> **Laboratuvar Hayvanları Yetiştirme ve Sağlığı**
> Editör: Doç. Dr. Orhan Tansel Korkmaz
> Yazarlar: Doç. Dr. Orhan Tansel Korkmaz, Öğr. Gör. Dr. Semih Öz,
> Prof. Dr. Hakan Şentürk, Doç. Dr. Mustafa Uyanoğlu, Arş. Gör. Ayşe Özmen Yaylacı
> T.C. Anadolu Üniversitesi Yayını No: 3632 — Açıköğretim Fakültesi Yayını No: 2460
> E-ISBN 978-975-06-3162-7 — Eskişehir, 2019 — 188 sayfa, 8 bölüm

Kitap depoda `LABORATUVAR HAYVANLARINI YETİŞTİRME VE SAĞLIĞI LBV210U-17V1S1-8-0-1-SV1-ebook(1).pdf`
adıyla bulunmaktadır.

## Kaynak etiketleri

`src/data/knowledge.js` içindeki her bilgi kartının bir `source` alanı vardır ve
bu etiket oyun içinde **her kartın altında** gösterilir:

| Etiket | Anlamı | Kart sayısı | Oyunda görünen |
|---|---|---:|---|
| `book` | Kaynak kitaptan alınmış; `ref` alanı bölüm/sayfa verir | 35 | "Kaynak: Laboratuvar Hayvanları Yetiştirme ve Sağlığı — Bölüm 2, s. 30" |
| `general` | Kitapta yer almayan, alan literatüründe yaygın bilgi | 1 | "Kitapta yer almayan genel bilgi — kesin bilimsel iddia değildir" |
| `game` | Tamamen oyun tasarımı kararı | 2 | "Oyun tasarımı kararı (bilimsel iddia değildir)" |

Aynı ayrım quiz sorularında da uygulanır: 30 sorunun tamamı kitaptan üretilmiştir
ve her sorunun `ref` alanı vardır. `tests/book.test.js` bu kuralı otomatik
doğrular — kitap etiketli bir kartın referanssız kalması testi kırar.

## Kitaptan alınan somut değerler

Bu değerler artık uydurma değil, kitaptan gelir ve `tests/book.test.js` ile kilitlenmiştir:

| Konu | Değer | Kaynak |
|---|---|---|
| 3R | Replacement (yerine başkasını kullanma), Reduction (sayısını azaltma), **Refinement (şiddetini azaltma)**; Russel ve Burch, 1959 | Bölüm 2, s. 22 |
| 4A kuralı | Az sayıda, Ağrısız-acısız, Alternatif, Ahlak ve bilimsel yönteme sahip araştırmacı | Bölüm 2, s. 23 |
| 4. ve 5. R | Responsibility, Respect | Bölüm 2, s. 23 |
| HADMEK | 21 üye, 3 ayda bir, Tarım ve Orman Bakanlığı başkanlığında | Bölüm 2, s. 27 |
| HADYEK | En az 5, en fazla 21 üye; ayda en az bir toplantı; 2/3 katılım; oy çokluğu | Bölüm 2, s. 29 |
| HADYEK kararları | **uygun / düzeltilmesi gerekir / şartlı olarak uygun / uygun değildir** | Bölüm 2, s. 30 |
| Karar süresi | Kırk iş günü | Bölüm 2, s. 30 |
| Kayıt saklama | En az beş yıl | Bölüm 2, s. 30 |
| Hayvan refahı birimi | HADYEK’in yanında bulunması **zorunlu** | Bölüm 2, s. 28 |
| Sertifika programı | 80 saat = 40 teori + 40 uygulama; %80 devam; 70/100 geçme notu; 13 konu başlığı | Bölüm 2, s. 32 |
| Sertifika hedef kitlesi | Araştırıcılar, hayvan teknisyeni/teknikerleri, hayvan bakıcıları | Bölüm 2, s. 32 |
| Başvuru formu | 16 alan; ekipte en az bir sertifikalı kişi zorunlu | Bölüm 2, s. 33-34 |
| Tesis odaları | 5 grup: idari, sistem kontrol, servis, üretim/barındırma, operasyon | Bölüm 3, s. 46 |
| Sıcaklık | 20-24 °C (tavşan 11-21 °C) | Bölüm 3, s. 48, Tablo 3.1 |
| Nem | %45-65 (tavşan en az %45) | Bölüm 3, s. 48, Tablo 3.1 |
| Aydınlatma | 12 saat aydınlık / 12 saat karanlık; hayvan odalarında pencere olmamalı | Bölüm 3, s. 48 |
| Havalandırma | Saatte 7.000-10.000 m³; emilen hava geri verilmez | Bölüm 3, s. 47 |
| Yem deposu | En fazla 21 °C; yem ve altlık ayrı depolanır | Bölüm 3, s. 49, 59 |
| Pelet yem | %24 ham protein, %4 ham yağ, %6 lif | Bölüm 3, s. 59 |
| Kafes boyutları | Tür başına minimum bölme, hayvan başına taban alanı, minimum yükseklik | Bölüm 3, Tablo 3.2-3.7 |
| Kafes temizliği | Haftada bir-iki kez; odalar her gün | Bölüm 5, s. 109 |
| Ring-tail | Düşük nemde yavru sıçanlarda kuyrukta halkasal yapı ve nekroz | Bölüm 3, s. 48 |
| Fare üremesi | Erginlik 7-8 hafta; gebelik 19-21 gün; 6-12 yavru; sütten kesme 21 gün | Bölüm 5, s. 96 |
| Fare etkileri | Lee-Boot, Whitten, Bruce | Bölüm 5, s. 96 |
| Sıçan üremesi | Gebelik 21-23 gün; 8-16 yavru | Bölüm 5, s. 105-106 |
| Kobay | Gebelik 59-72 gün; östrus 15-17 gün; 2-5 yavru | Bölüm 6, s. 119 |
| Gerbil | Gebelik 21-24 gün; östrus 4-6 gün; 4-6 yavru | Bölüm 6, s. 122-123 |
| Hamster | Gebelik 16 gün; östrus 4 gün; 6-8 yavru | Bölüm 6, s. 124-125 |
| Tavşan | Gebelik 31-32 gün; yılda 6-9 doğum; 7-8 yavru; sütten kesme 6-8 hafta | Bölüm 6, s. 128 |
| Refah belirteçleri | Genel, fizyolojik, davranış, özel | Bölüm 4, s. 73-74 |
| Çevre kademeleri | Mikro (kafes), makro (oda), mega (bina) | Bölüm 5, s. 108 |
| Biyogüvenlik | BGS-1, BGS-2, BGS-3, BGS-4 | Bölüm 8, s. 175-176 |
| Atık sınıfları | Evsel, tıbbi (enfeksiyöz/patolojik/kesici-delici), tehlikeli, radyoaktif; kırmızı torba | Bölüm 8, s. 178-179 |
| Genetik | Transgenik, knockout, knockin, genotiplendirme | Bölüm 7, s. 139-143 |

## Kitapta bulunmayan, oyuna dâhil EDİLMEYEN konular

- **SPF (specific pathogen free) ve germ-free koloniler.** Bu kavramlar kitabın
  hiçbir yerinde geçmemektedir. İlk sürümde teknoloji ağacının tepesinde yer
  alıyorlardı; kitap incelendikten sonra **kaldırıldılar** ve yerlerini kitapta
  tanımlanan **bariyerli yetiştirme** (Bölüm 3, s. 52) ile **BGS-1…4**
  (Bölüm 8, s. 175-176) basamakları aldı. Konunun literatürde var olduğu,
  `general` etiketli tek bir bilgi kartında açıkça "kitapta yer almaz" notuyla
  belirtilmiştir.

## Oyun dengesi değerleri (kitaptan gelmez)

Aşağıdakiler bilinçli olarak oyun tasarımı kararıdır ve kodda böyle etiketlenmiştir:

- Tüm para tutarları: inşaat, kafes, maaş, satış fiyatı, proje ödemesi, kurs ücreti.
- Refah formülündeki ağırlıklar (`WELFARE_WEIGHTS`) ve 0-100 ölçekleri.
- Oda boyutları (grid hücresi), oda başına kafes kapasitesi.
- Kafeslerin cm² cinsinden taban alanı — kitap kafes modeli başına ölçü vermez,
  tür başına minimumları verir; seçilen ölçüler bu minimumları karşılar.
- Yaşam süresi, doğum/erişkin ağırlıkları, günlük yem/su maliyeti.
- Sertifika modüllerine düşen saat dağılımı (toplamların 40 + 40 olması korunmuştur).
- Olay sistemi, ekonomi akışı, puanlama ağırlıkları ve harf notu eşikleri.
- Bir oyun gününün gerçek zamandaki süresi.

## Doğrulama

```bash
npm test     # 29 test: 15 simülasyon + 14 kaynak kitap uyumu
```

`tests/book.test.js` şunları kilitler: sertifika saatleri ve modül başlıkları,
tür üreme değerleri, sıcaklık/nem tablosu, kafes boyut tabloları ve kapasite
hesabı, HADYEK’in dört kararı ve kırk iş günü kuralı, başvuru formu alanları,
hayvan refahı birimi zorunluluğu, SPF/germ-free’nin ağaçta bulunmaması,
kafes temizlik sıklığı ile tüm bilgi kartı ve quiz referanslarının varlığı.
