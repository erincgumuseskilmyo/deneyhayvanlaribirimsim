# tools/

## blend_to_glb.py — Blender dosyasını oyuna hazır GLB'ye çevirir

`docs/MODELLER.md` kurallarını otomatik uygular: kamera/ışık/zemin nesnelerini
atar, curve'leri mesh'e çevirir, tek mesh'e birleştirir, +X ileri olacak şekilde
döndürür, pivotu tabanın ortasına alır ve GLB yazar.

Blender'ı kurmadan çalışır (Blender'ın Python modülü kullanılır):

```bash
pip install bpy            # Python 3.11 gerekir
python3 tools/blend_to_glb.py <girdi.blend> <cikti.glb> [ileri_yon] [haric_tutulacaklar]
```

| Argüman | Açıklama | Varsayılan |
|---|---|---|
| `ileri_yon` | Modelde burnun baktığı eksen: `NEG_Y`, `POS_Y`, `POS_X`, `NEG_X` | `NEG_Y` |
| `haric_tutulacaklar` | Virgülle ayrılmış nesne adları (zemin, backdrop vb.) | yok |

Örnek:

```bash
python3 tools/blend_to_glb.py fare_lowpoly.blend public/models/animal_mouse.glb NEG_Y Fare_Zemin
```

Betik üçgen sayısını ve son boyutları yazdırır; `docs/MODELLER.md` içindeki
poligon bütçesiyle karşılaştırın.

> Not: `bpy` bazı ortamlarda betik dosyası olarak çalıştırıldığında glog
> çakışması veriyor. Öyle bir durumda `python3 -c "exec(open('tools/blend_to_glb.py').read())"`
> biçiminde çalıştırın.
