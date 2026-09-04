"""
.blend -> .glb dönüştürücü (docs/MODELLER.md kurallarına göre).

Yaptıkları:
  1. Kamera, ışık ve zemin/backdrop nesnelerini dışarıda bırakır.
  2. Curve nesnelerini mesh'e çevirir (glTF curve taşımaz).
  3. Modeli tek mesh'e birleştirir (çizim çağrısı sayısını düşürür).
  4. +X ileri olacak biçimde döndürür, pivotu tabanın ortasına alır.
  5. Rotasyon/ölçeği uygular ve GLB olarak dışa aktarır.
"""
import bpy, sys, math, mathutils

blend_path, out_path = sys.argv[1], sys.argv[2]
# İleri yön ekseni: modelde burun -Y'ye bakıyorsa 'NEG_Y'
forward = sys.argv[3] if len(sys.argv) > 3 else 'NEG_Y'
# Dışarıda bırakılacak nesne adları (zemin, backdrop vb.)
exclude = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else set()

bpy.ops.wm.open_mainfile(filepath=blend_path)

# --- 1. İstenmeyen nesneleri sil ---
removed = []
for o in list(bpy.data.objects):
    if o.type in {'CAMERA', 'LIGHT', 'SPEAKER'} or o.name in exclude:
        removed.append(f"{o.name} [{o.type}]")
        bpy.data.objects.remove(o, do_unlink=True)
print("Çıkarılan:", removed or "yok")

# --- 2. Curve -> Mesh ---
bpy.ops.object.select_all(action='DESELECT')
converted = []
for o in list(bpy.data.objects):
    if o.type == 'CURVE':
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.convert(target='MESH')
        converted.append(o.name)
        o.select_set(False)
print("Mesh'e çevrilen curve:", converted or "yok")

meshes = [o for o in bpy.data.objects if o.type == 'MESH']
if not meshes:
    raise SystemExit("HATA: mesh bulunamadı")

# --- 3. Tek mesh'e birleştir ---
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
bpy.ops.object.join()
obj = bpy.context.view_layer.objects.active
obj.name = "Fare"
print("Birleştirildi ->", obj.name)

# --- 4. Yön: +X ileri ---
turn = {'NEG_Y': math.radians(90), 'POS_Y': math.radians(-90),
        'POS_X': 0.0, 'NEG_X': math.radians(180)}[forward]
obj.rotation_euler = (0.0, 0.0, turn)
bpy.context.view_layer.update()
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

# --- 5. Pivot: tabanın ortası, model orijine otursun ---
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
bpy.context.view_layer.update()
bb = [obj.matrix_world @ mathutils.Vector(c) for c in obj.bound_box]
min_z = min(v.z for v in bb)
cx = (min(v.x for v in bb) + max(v.x for v in bb)) / 2
cy = (min(v.y for v in bb) + max(v.y for v in bb)) / 2
obj.location = (obj.location.x - cx, obj.location.y - cy, obj.location.z - min_z)
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

obj.data.calc_loop_triangles()
bb = [obj.matrix_world @ mathutils.Vector(c) for c in obj.bound_box]
size = [round(max(v[i] for v in bb) - min(v[i] for v in bb), 4) for i in range(3)]
print(f"Üçgen: {len(obj.data.loop_triangles)}")
print(f"Boyut (X ileri, Y yan, Z yukarı): {size}")
print(f"Taban Z: {round(min(v.z for v in bb), 4)}")

# --- 6. GLB dışa aktar ---
bpy.ops.object.select_all(action='DESELECT')
obj.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format='GLB',
    use_selection=True,
    export_yup=True,
    export_apply=True,
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False,
    export_animations=False
)
print("YAZILDI:", out_path)
