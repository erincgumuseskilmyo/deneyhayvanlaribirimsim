# Laboratuvar Hayvanları Yetiştirme Birimi — Eğitici 3D Simülasyon

Web tabanlı, üstten/izometrik bakışlı, low-poly bir **deney hayvanları üretim ve
kullanım birimi yönetim simülasyonu**. Oyuncu sıfırdan bir tesis kurar, personel
çalıştırır, hayvan yetiştirir, etik kurul (HADYEK) olarak araştırma başvurularını
değerlendirir, sertifika programı açar ve tesisi büyütür.

**Oyunun amacı sadece para kazanmak değildir.** Dönem sonu derecesi beş boyutun
birlikte dengelenmesiyle hesaplanır: ekonomi, hayvan refahı, biyogüvenlik,
etik uygunluk ve bilimsel kalite.

> **Kaynak kitap notu:** Görevde belirtilen *"LABORATUVAR HAYVANLARINI YETİŞTİRME
> VE SAĞLIĞI"* kitabı depoda bulunmadığı için hiçbir içerik kitaba
> atfedilmemiştir. Tüm eğitim kartları kaynak etiketiyle işaretlidir
> (`Kaynak kitap` / `Genel bilgi — doğrulanmalı` / `Oyun tasarımı kararı`).
> Ayrıntı ve kitap eklendiğinde izlenecek adımlar: [`docs/KAYNAK.md`](docs/KAYNAK.md).

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ üretir
npm run preview
npm test         # 15 headless simülasyon testi (node:test, tarayıcı gerekmez)
```

## Kontroller

| Girdi | İşlev |
|---|---|
| Sol tık sürükle | Kamerayı döndür |
| Sağ tık sürükle | Kaydır (pan) |
| Tekerlek | Yakınlaş / uzaklaş |
| Sol panelden oda seç → zemine tık | Oda yerleştir |
| Sağ tık (inşa modunda) / `Esc` | İnşa modundan çık |
| Odaya tık | Detay panelini aç |
| `Boşluk` | Duraklat / devam |
| `1` `2` `3` | Hız 1× / 2× / 4× |

Kamera dikey açısı sınırlıdır ve yatay bakışa yaklaştıkça duvarlar
şeffaflaşır, böylece oda içleri her zaman görünür kalır.

## Oynanış akışı

1. Hayvan Odası, Giyinme/Geçiş Odası, Temizlik Alanı, Karantina ve Teknik Oda inşa edin.
2. **Personel** sekmesinden en az bir Veteriner Hekim ve bir Hayvan Bakıcısı alın.
3. Sağ panelden **çalışma izni** başvurusu yapın → tesis seviyesi 2 açılır.
4. Hayvan Odasına kafes alın, ilk **fare kolonisini** kurun.
5. **HADYEK** kurun → araştırma başvuruları gelmeye başlar.
6. Başvuruları `APPROVE` / `REQUEST_REVISION` / `REJECT` ile değerlendirin.
7. Eğitim Sınıfı inşa edip **sertifika programı** açın (40 s teori + 40 s uygulama).
8. IVC → SPF → Germ-Free ve genetik birim hattında tesisi büyütün.

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
  6 tür: fare, sıçan, kobay, gerbil, hamster, tavşan.
- **Refah:** 8 ağırlıklı faktör (yem, su, çevre, yoğunluk, temizlik,
  zenginleştirme, personel yeterliliği, sağlık) + hastalık, GD hat, yaş ve
  deney yükü cezaları. Kırılım tablosu Raporlar sekmesinde görünür.
- **Tesis:** grid üzerinde 14 oda tipi, çakışma/bütçe kontrolü, oda başına
  sıcaklık-nem-havalandırma-gürültü simülasyonu, 5 kafes teknolojisi.
- **Etik kurul:** kural tabanlı başvuru denetimi (sertifika, Replacement,
  Reduction, Refinement, tür gerekçesi, barındırma) ve karar sonrası
  gerekçeli geri bildirim. Düzeltme istenen başvurular revize edilip geri gelir.
- **Sertifika programı:** 12 modül, 40 saat teori + 40 saat uygulama,
  0-100 final sınavı, ≥70 `CERTIFIED` / <70 `FAILED`.
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

## Modeller

Low-poly modeller `ModelFactory` içinde **prosedürel olarak** üretilir; harici
GLB dosyası gerekmez. Kendi modellerinizi kullanmak isterseniz dosyayı
`public/models/` altına koyup şu kancayı çağırın:

```js
await world.factory.loadGLTF('animal_mouse', '/models/mouse.glb');
world.factory.loadGLTF('room_animal', '/models/animal-room.glb');
```

Kayıtlı isimler: `room_<odaTipi>`, `cage_<kafesTipi>`, `animal_<tür>`.

## İçerik sınırları

Hayvanlara yönelik işlemler grafik biçimde gösterilmez; kan/gore içeriği yoktur.
Ötenazi ve çalışma sonu gibi süreçler yalnızca kayıt düzeyinde modellenmiştir.
Genetik sistem gerçek laboratuvar protokolü öğretmez; stratejik bir soyutlamadır.
