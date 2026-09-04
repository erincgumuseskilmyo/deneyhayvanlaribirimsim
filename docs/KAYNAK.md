# Kaynak Kitap Entegrasyonu

## Mevcut durum

Görev tanımında oyunun eğitim içeriğinin

> **"LABORATUVAR HAYVANLARINI YETİŞTİRME VE SAĞLIĞI"**

adlı kaynak kitaba dayandırılması istenmiştir. **Bu kitap dosyası depoda
bulunmamaktadır** (depo bu çalışmanın başında tamamen boştu). Bu nedenle:

- Oyundaki **hiçbir cümle kaynak kitaba atfedilmemiştir.**
- Kitapta bulunduğunu doğrulayamadığımız hiçbir bilgi kesin bilimsel gerçek
  olarak sunulmamıştır.
- Tüm eğitim içeriği kaynak etiketiyle işaretlenmiştir.

## Kaynak etiketleri

`src/data/knowledge.js` içindeki her bilgi kartının bir `source` alanı vardır:

| Etiket | Anlamı | Oyunda görünen metin |
|---|---|---|
| `book` | Kaynak kitaptan doğrudan alınmış | "Kaynak kitap" |
| `general` | Laboratuvar hayvanı bilimi ve mevzuatında yaygın olarak bilinen genel ilke; kitapla doğrulanmalı | "Genel bilgi — kaynak kitapla doğrulanmalı" |
| `game` | Tamamen oyun tasarımı kararı, bilimsel iddia içermez | "Oyun tasarımı kararı (bilimsel iddia değildir)" |

Şu anda `book` etiketli kart **yoktur**. Oyun içinde **Bilgi Bankası**
sekmesi bu üç kategoriyi ayrı başlıklar altında listeler ve durumu
oyuncuya açıkça bildirir.

## Sayısal değerler hakkında

`src/data/` altındaki tür, oda ve kafes verilerindeki sayılar
(gebelik süresi, kafes kapasitesi, maliyet, refah bonusu vb.)
**oyun dengesi için seçilmiş soyut değerlerdir.** Teknik şartname ya da
referans aralığı değildir. Türlere ait `facts` alanları ise genel
literatür bilgisidir ve kitapla doğrulanmalıdır.

## Kitap eklendiğinde yapılacaklar

1. Kitabı depoya ekleyin (ör. `docs/kaynak/laboratuvar-hayvanlari.pdf`).
2. `src/data/knowledge.js` içindeki `general` etiketli kartların metnini
   kitapla karşılaştırın.
3. Doğrulanan kartlarda:
   - `source` alanını `'book'` yapın,
   - `ref` alanı ekleyip bölüm/sayfa bilgisini yazın, örn.
     `ref: 'Bölüm 8, s. 142'`.
4. Kitapla çelişen ifadeleri kitaba göre düzeltin.
5. Kitapta karşılığı olmayan kartlar `general` ya da `game` olarak kalsın.
6. `src/data/quizzes.js` içindeki soruları da aynı şekilde gözden geçirin;
   her sorunun `topic` alanı bir bilgi kartına işaret eder.

## Kitap başlıklarının oyun mekaniğine eşlenmesi

| Kitap başlığı | Oyundaki karşılığı |
|---|---|
| Deney hayvanları ve laboratuvar hayvanları bilimi | Tür sistemi (`data/species.js`), Bilgi Bankası |
| Hayvan deneyleri etiği ve 3R | `systems/EthicsSystem.js`, başvuru denetim kuralları |
| HADMEK / HADYEK | HADYEK kurulumu, Etik Kurul sekmesi |
| Deney hayvanları kullanım sertifika programı | `systems/CertificationSystem.js` (40 s teori + 40 s uygulama) |
| Deney hayvanı üretim tesisleri | `systems/FacilitySystem.js`, çalışma izni |
| Tesis odaları ve fiziki şartlar | `data/rooms.js`, oda sıcaklık/nem/havalandırma simülasyonu |
| Yaşam kafesleri | `data/cages.js` (5 kafes teknolojisi) |
| Beslenme ve su | `systems/HusbandrySystem.js`, refah faktörleri, ekonomi |
| Zenginleştirme | Kafes `enrichment` değeri, refah ağırlığı |
| Hayvan refahı | `systems/WelfareSystem.js` (12 faktörlü model) |
| Fare / sıçan / kobay / gerbil / hamster / tavşan yetiştiriciliği | Tür başına üreme, kapasite ve iklim parametreleri |
| Kayıt ve taşıma | Hayvan kimliği, soy kütüğü (`lineageId`), satış/devir refah cezası |
| Hijyen, kafes ve oda temizliği | Kafes kirlenmesi, temizlik kapasitesi, oda hijyeni |
| Pest kontrolü | `systems/BiosecuritySystem.js` `pestPressure` |
| Genetiği değiştirilmiş hayvanlar, transgenik, knockout/knockin, genotiplendirme | `systems/GeneticsSystem.js` (stratejik/soyut model) |
| IVC sistemleri | IVC kafesi + IVC Odası + `ivc_system` teknolojisi |
| Hastalıklar | `systems/DiseaseSystem.js` (salgın ve müdahale kararları) |
| Biyogüvenlik | Bariyer odaları, karantina, koloni statüsü (SPF / germ-free) |
| Atık yönetimi | `BiosecuritySystem.wasteBacklog`, bertaraf işlemi |
