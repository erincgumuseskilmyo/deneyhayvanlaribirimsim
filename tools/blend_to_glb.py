"""
.blend -> .glb dönüştürücü (docs/MODELLER.md kurallarına göre).

Yaptıkları:
  1. Kamera, ışık ve sahne dekorunu (zemin, ot, taş) dışarıda bırakır.
  2. Curve nesnelerini mesh'e çevirir (glTF curve taşımaz).
  3. Animasyon YOKSA tek mesh'e birleştirir (çizim çağrısı sayısını düşürür).
     Animasyon VARSA hiyerarşiyi korur — birleştirme animasyonu yok eder.
  4. --in-place ile kök nesnenin yatay yer değiştirmesini siler; yürüyüş/zıplama
     animasyonu yerinde oynar (kafesteki hayvan odanın karşısına gitmesin diye).
  5. +X ileri olacak biçimde döndürür, pivotu tabanın ortasına alır.
  6. GLB olarak dışa aktarır.

Kullanım:
  python3 tools/blend_to_glb.py GIRDI.blend CIKTI.glb [seçenekler]

Seçenekler:
  --forward NEG_Y|POS_Y|POS_X|NEG_X   modelde burnun baktığı eksen (varsayılan NEG_Y)
  --keep PREFIX                       yalnızca bu önekli nesneleri tut (ör. Tav_)
  --exclude AD1,AD2                   bu adlardaki nesneleri at
  --color "Malzeme=RRGGBB,..."        malzeme rengini değiştir (hex sRGB)
  --in-place ROOT_ADI                 bu nesnenin yatay yer değiştirmesini sil
  --frames BAS-SON                    yalnızca bu kare aralığını dışa aktar
  --no-join                           animasyon olmasa bile birleştirme
"""
import bpy, sys, math, mathutils, argparse

ap = argparse.ArgumentParser()
ap.add_argument('blend'); ap.add_argument('out')
ap.add_argument('--forward', default='NEG_Y')
ap.add_argument('--keep', default=None)
ap.add_argument('--exclude', default='')
ap.add_argument('--color', default='')
ap.add_argument('--in-place', dest='inplace', default=None)
ap.add_argument('--frames', default=None)
ap.add_argument('--no-join', dest='no_join', action='store_true')
a = ap.parse_args(sys.argv[1:])

bpy.ops.wm.open_mainfile(filepath=a.blend)
exclude = {x for x in a.exclude.split(',') if x}

# --- 1. İstenmeyen nesneleri sil ---
removed = []
for o in list(bpy.data.objects):
    drop = o.type in {'CAMERA', 'LIGHT', 'SPEAKER'} or o.name in exclude
    if a.keep and not o.name.startswith(a.keep):
        drop = True
    if drop:
        removed.append(o.name)
        bpy.data.objects.remove(o, do_unlink=True)
print(f"Çıkarılan {len(removed)} nesne:", removed[:6], "..." if len(removed) > 6 else "")

# --- 2. Malzeme renkleri ---
def srgb_to_linear(c):
    """Blender Base Color lineer uzaydadır; hex sRGB'dir."""
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

for pair in (x for x in a.color.split(',') if x):
    name, _, hexcol = pair.partition('=')
    mat = bpy.data.materials.get(name.strip())
    if not mat:
        print(f"UYARI: '{name}' malzemesi yok, atlandı"); continue
    hexcol = hexcol.strip().lstrip('#')
    r, g, b = (int(hexcol[i:i+2], 16) for i in (0, 2, 4))
    lin = (srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b), 1.0)
    for n in mat.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Base Color'].default_value = lin
    mat.diffuse_color = lin
    print(f"Renk: {name} -> #{hexcol.upper()}")

# --- 3. Curve -> Mesh ---
bpy.ops.object.select_all(action='DESELECT')
for o in list(bpy.data.objects):
    if o.type == 'CURVE':
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.convert(target='MESH')
        o.select_set(False)
        print("Curve -> mesh:", o.name)

meshes = [o for o in bpy.data.objects if o.type == 'MESH']
if not meshes:
    raise SystemExit("HATA: mesh bulunamadı")

# --- 4. Animasyon var mı? ---
def fcurves(act):
    fcs = getattr(act, 'fcurves', None)
    if fcs is not None:
        yield from fcs; return
    for layer in act.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                yield from cb.fcurves

animated = [o for o in bpy.data.objects
            if o.animation_data and o.animation_data.action]
print(f"Animasyonlu nesne: {len(animated)}")

# --- 5. Yerinde oynatma: kökün yatay yer değişimini sil ---
if a.inplace:
    root = bpy.data.objects.get(a.inplace)
    if not root or not root.animation_data or not root.animation_data.action:
        print(f"UYARI: '{a.inplace}' bulunamadı ya da animasyonsuz")
    else:
        for fc in fcurves(root.animation_data.action):
            # location X ve Y sabitlenir; Z (yükseklik) ve rotasyon korunur
            if fc.data_path == 'location' and fc.array_index in (0, 1):
                base = fc.keyframe_points[0].co[1] if len(fc.keyframe_points) else 0.0
                for kp in fc.keyframe_points:
                    kp.co[1] = base
                    kp.handle_left[1] = base
                    kp.handle_right[1] = base
                fc.update()
        print(f"Yerinde oynatma: '{a.inplace}' yatay yer değişimi silindi")

# --- 6. Kare aralığı ---
scene = bpy.context.scene
if a.frames:
    f0, _, f1 = a.frames.partition('-')
    scene.frame_start, scene.frame_end = int(f0), int(f1)
    print(f"Kare aralığı: {scene.frame_start}-{scene.frame_end}")

# --- 7. Birleştirme (yalnızca animasyon yoksa) ---
join = not animated and not a.no_join
if join:
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.join()
    roots = [bpy.context.view_layer.objects.active]
    print("Tek mesh'te birleştirildi")
else:
    roots = [o for o in bpy.data.objects if o.parent is None]
    print(f"Hiyerarşi korundu ({len(bpy.data.objects)} nesne, {len(roots)} kök)"
          + (" — animasyon var" if animated else ""))

# --- 8. Yön ve pivot (kök nesneler üzerinden) ---
turn = {'NEG_Y': math.radians(90), 'POS_Y': math.radians(-90),
        'POS_X': 0.0, 'NEG_X': math.radians(180)}[a.forward]

def world_bounds():
    mn = [1e9]*3; mx = [-1e9]*3
    for o in bpy.data.objects:
        if o.type != 'MESH': continue
        for c in o.bound_box:
            w = o.matrix_world @ mathutils.Vector(c)
            for i in range(3):
                mn[i] = min(mn[i], w[i]); mx[i] = max(mx[i], w[i])
    return mn, mx

# Kök nesnenin konum/rotasyonu ANIMASYONLU olabilir; doğrudan yazmak
# işe yaramaz, her karede animasyon üzerine yazar. Bu yüzden hepsini
# yeni bir boş (empty) nesnenin altına alıp dönüşü orada uygularız.
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
pivot = bpy.context.active_object
pivot.name = 'Root'
for r in roots:
    r.parent = pivot
    r.matrix_parent_inverse = pivot.matrix_world.inverted()
pivot.rotation_euler.z = turn
bpy.context.view_layer.update()

mn, mx = world_bounds()
pivot.location.x -= (mn[0] + mx[0]) / 2
pivot.location.y -= (mn[1] + mx[1]) / 2
pivot.location.z -= mn[2]
bpy.context.view_layer.update()
roots = [pivot]

mn, mx = world_bounds()
tris = 0
for o in bpy.data.objects:
    if o.type == 'MESH':
        o.data.calc_loop_triangles()
        tris += len(o.data.loop_triangles)
print(f"Üçgen: {tris}")
print("Boyut (X ileri, Y yan, Z yukarı):", [round(mx[i]-mn[i], 4) for i in range(3)])
print("Taban Z:", round(mn[2], 4))

# --- 9. Dışa aktar ---
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(
    filepath=a.out,
    export_format='GLB',
    use_selection=True,
    export_yup=True,
    export_apply=not animated,     # animasyonluda modifier uygulanmaz
    export_materials='EXPORT',
    export_draco_mesh_compression_enable=False,
    export_animations=bool(animated),
    export_frame_range=bool(a.frames),
    export_anim_slide_to_zero=True
)
print("YAZILDI:", a.out)
