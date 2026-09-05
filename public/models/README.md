# public/models

Buraya Blender'dan çıkardığınız `.glb` dosyalarını ve bunları tanıtan
`manifest.json` dosyasını koyun.

- `manifest.json` **yoksa** oyun tamamen prosedürel modellerle çalışır — hata vermez.
- Manifestte adı geçen bir dosya **eksikse** yalnızca o model prosedürel çizilir,
  oyun çalışmaya devam eder ve bir uyarı gösterilir.

Başlamak için: `manifest.example.json` dosyasını `manifest.json` olarak kopyalayın
ve sadece ürettiğiniz modelleri bırakın.

Model adları, ölçek, yön ve poligon bütçesi kuralları: [`docs/MODELLER.md`](../../docs/MODELLER.md)
