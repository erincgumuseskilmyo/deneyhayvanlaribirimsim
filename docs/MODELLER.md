# 3B Model Şartnamesi (Blender → Oyun)

Bu belge, Blender'da ürettiğiniz modellerin oyuna **düzeltme gerektirmeden**
girmesi için uyulması gereken kuralları tanımlar.

Oyun modelsiz de çalışır: manifest yoksa her şey prosedürel çizilir. Model
eklemek isteğe bağlı bir iyileştirmedir ve tek tek yapılabilir — önce sadece
fareyi modelleyip diğerlerini prosedürel bırakabilirsiniz.

## 1. Öncelik sırası

Hepsini modellemeyin. Görsel kazanç sırası:

| Öncelik | Ne | Neden |
|---|---|---|
| **1** | 6 hayvan türü | Prosedürel hayvanlar basit şekillerden ibaret; en çok fark burada. |
| **2** | 5 kafes tipi | Kitaptaki tipler görsel olarak ayırt edilebilir olur (ızgara taban, IVC hortumu). |
| 3 | Odalar | Prosedürel odalar grid boyutuna göre parametrik uyum sağlıyor; modellemek esnekliği kaybettirir. **Önerilmez.** |

## 2. Dosya yerleşimi

```
public/models/
  manifest.json        ← hangi modelin hangi dosyadan geleceği
  animal_mouse.glb
  cage_ivc.glb
  ...
```

`manifest.example.json` dosyasını `manifest.json` olarak kopyalayıp
üretmediğiniz satırları silin.

## 3. Model adları

Manifest anahtarları sabittir; oyun bu adlarla arar:

| Anahtar | Karşılığı |
|---|---|
| `animal_mouse` `animal_rat` `animal_guinea_pig` `animal_gerbil` `animal_hamster` `animal_rabbit` | Hayvan türleri |
| `cage_shoebox` `cage_grid_floor` `cage_microisolator` `cage_ivc` `cage_breeding_cage` `cage_wire_pen` `cage_metabolism` | Kafes tipleri |
| `room_animal` `room_quarantine` … (`src/data/rooms.js` içindeki `id`) | Oda tipleri |

## 4. Ölçek ve yön — en kritik kısım

**Oyun birimi:** 1 birim = 1 metre. Grid hücresi 1×1 birimdir; 4×4'lük bir
hayvan odası 4×4 metredir.

**Ölçek gerçek boyut DEĞİLDİR.** Gerçek boyutlu bir fare (7 cm) 4 metrelik bir
odada görünmez. Oyun okunabilirlik için abartılı ölçek kullanır:

| Model | Hedef en uzun kenar (`fitTo`) |
|---|---|
| `animal_mouse` | 0,32 |
| `animal_rat` | 0,36 |
| `animal_guinea_pig` | 0,45 |
| `animal_gerbil` | 0,30 |
| `animal_hamster` | 0,31 |
| `animal_rabbit` | 0,60 |
| `cage_shoebox` `cage_grid_floor` `cage_microisolator` `cage_ivc` | 0,62 |
| `cage_breeding_cage` | 0,79 |
| `cage_wire_pen` | 1,64 |
| `cage_metabolism` | 0,44 |

Kafeslerin görsel boyutu taban alanından türetilir (800 cm² → 0,62 birim),
bu yüzden geniş kafesler sahnede gerçekten büyük görünür.

**Ölçeği tutturamazsanız sorun değil:** manifestteki `fitTo` değeri sayesinde
yükleyici modeli otomatik olarak bu boyuta ölçekler ve tabanını zemine oturtur.
Yine de modeli doğru ölçekte çıkarmak, oranların bozulmaması açısından iyidir.

**Yön ve pivot:**

- **+X ileri** (hayvanın burnu +X yönüne baksın)
- **+Y yukarı**
- **Pivot noktası tabanın ortasında** (ayakların değdiği düzlem, y=0)
- Blender'da +Z yukarıdır; **glTF export'unda "+Y Up" seçeneği işaretli olmalı**
  (varsayılan olarak işaretlidir). Nesnenin kendi rotasyonunu export öncesi
  uygulayın: `Object → Apply → Rotation & Scale`.

## 5. Poligon bütçesi

Oyun aynı anda onlarca hayvan ve kafes çizer. Low-poly stili hem performans
hem de görsel tutarlılık için gereklidir.

| Model | Üçgen üst sınırı |
|---|---|
| Hayvan | 800 |
| Kafes | 600 |
| Oda | 2.000 |

Subdivision Surface modifier'ı **uygulamayın**. Flat shading tercih edin;
oyunun geri kalanı düz gölgeli.

## 6. Malzeme ve doku

- **Doku dosyası kullanmayın.** Düz renkli malzemeler (Principled BSDF, yalnız
  Base Color) yeterlidir ve dosya boyutunu küçük tutar.
- Doku kullanacaksanız **GLB'ye gömün** (`Export → Include → Images: Pack`)
  ve 512×512'yi aşmayın.
- Metallic 0, Roughness 0,7-0,9 aralığında iyi durur.
- Pastel, düşük doygunluklu renkler kullanın — oyunun paleti bu yönde.
- Emission, transmission, cam/saydamlık kullanmayın (WebGL'de pahalı ve
  gölgeleri bozar).

**Renk referansı** (`src/data/species.js` içindeki `color` alanları):
fare `#dcd6cc`, sıçan `#c9bfb3`, kobay `#d8c0a8`, gerbil `#d0b48c`,
hamster `#e0c39a`, tavşan `#e8e2da`.

## 7. Animasyon (isteğe bağlı)

Modelde animasyon varsa oyun otomatik oynatır.

- Manifestteki `idle` alanına klip adını yazın (ör. `"idle": "Idle"`).
  Belirtmezseniz ilk klip kullanılır.
- Klip **döngüsel** olmalı (ilk ve son kare aynı poz).
- Klip **yerinde** oynamalı: karakteri ileri taşıyan bir döngü, oyunda hayvanı
  kafesten çıkarıp odanın karşısına götürür. Blender'da yer değiştiren bir
  döngü hazırladıysanız `tools/blend_to_glb.py --in-place KÖK_ADI` ile
  yatay hareketi silin.
- Animasyonlu modeller tek mesh'e **birleştirilemez** (birleştirme nesne bazlı
  animasyonu yok eder), bu yüzden çizim çağrısı sayısı artar. Animasyonu
  gerçekten değer kattığı modellerde kullanın.
- 1-3 saniyelik sakin bir nefes/kıpırdanma yeterlidir.
- Aynı türden çok sayıda hayvan olduğunda oyun klip başlangıç zamanını
  rastgeleleştirir; hepsi senkron oynamaz.
- İskelet (armature) kullanabilirsiniz — oyun `SkeletonUtils` ile doğru
  kopyalama yapar. Kemik sayısını 30'un altında tutun.
- Animasyon yoksa oyun kendi hafif salınımını uygular.

## 8. Export ayarları (Blender)

`File → Export → glTF 2.0 (.glb/.gltf)`

| Ayar | Değer |
|---|---|
| Format | **glTF Binary (.glb)** |
| Include | Selected Objects (yalnız ilgili nesne) |
| Transform | **+Y Up** işaretli |
| Data → Mesh | Apply Modifiers işaretli |
| Data → Material | Export Materials: Export |
| Animation | Klip varsa işaretli, yoksa kapalı |
| Compression | Kapalı (Draco kullanmayın — yükleyici Draco çözücü içermez) |

> **Draco sıkıştırma kullanmayın.** Oyun Draco çözücüsü içermez; sıkıştırılmış
> dosya yüklenemez ve model prosedürele düşer.

## 9. Doğrulama

Modeli koyduktan sonra:

```bash
npm run dev
```

Tarayıcı konsolunda:
- `"N harici model yüklendi"` bildirimi → başarılı
- `"[ModelFactory] ... yüklenemedi"` uyarısı → dosya adı, yol veya format sorunu

Tek bir modeli hızlıca denemek için konsoldan:

```js
await __game.world.factory.loadGLTF('animal_mouse', '/models/animal_mouse.glb', { fitTo: 0.32 });
__game.world.reloadModels();
```

## 10. Gemini ile üretim hakkında

Gemini görsel üretimi bu iş akışında **3B model üretmek için değil**, referans
için kullanışlıdır:

- Tür başına konsept/referans görseli üretip Blender'da ona bakarak modelleyin.
- Renk paleti ve siluet denemeleri yapın.
- Doku kullanacaksanız (önerilmez, bkz. §6) tileable doku üretebilir.

Doğrudan 3B model üretimi (metin→3B) bu boru hattının parçası değildir;
çıktı poligon bütçesine ve yön/pivot kurallarına uymaz.
