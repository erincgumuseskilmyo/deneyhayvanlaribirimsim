import * as THREE from 'three';
import { getRoomType } from '../data/rooms.js';
import { getSpecies } from '../data/species.js';

/**
 * LOW-POLY MODEL ÜRETİMİ
 *
 * Varsayılan olarak tüm modeller prosedürel üretilir — harici dosya gerekmez.
 * İsteğe bağlı olarak Blender'dan çıkarılmış GLB modelleri devreye girebilir:
 *
 *   public/models/manifest.json  ->  hangi modelin hangi dosyadan geleceği
 *   public/models/*.glb          ->  modellerin kendisi
 *
 * Manifest yoksa ya da bir dosya yüklenemezse oyun sessizce prosedürel modele
 * geri döner; hiçbir şey kırılmaz. Model adları ve ölçü kuralları için
 * docs/MODELLER.md dosyasına bakın.
 */

/** Manifestte tanımlanabilecek model adları */
export const MODEL_SLOTS = {
  room: (typeId) => `room_${typeId}`,
  cage: (typeId) => `cage_${typeId}`,
  animal: (speciesId) => `animal_${speciesId}`
};

const WALL_H = 1.5;

export class ModelFactory {
  constructor() {
    this.overrides = new Map(); // name -> THREE.Object3D (klonlanır)
    this.materials = {
      wall: new THREE.MeshLambertMaterial({ color: 0xf2f4f7 }),
      floor: new THREE.MeshLambertMaterial({ color: 0xdfe4ea }),
      cage: new THREE.MeshLambertMaterial({ color: 0xdfe6ec }),
      cageLid: new THREE.MeshLambertMaterial({ color: 0xa9b6c2 }),
      bedding: new THREE.MeshLambertMaterial({ color: 0xe8dcc0 }),
      rack: new THREE.MeshLambertMaterial({ color: 0xbcc6d0 })
    };
  }

  /**
   * Tek bir GLB modelini kaydeder.
   * @param {string} name  MODEL_SLOTS ile üretilen model adı (ör. 'animal_mouse')
   * @param {string} url   dosya yolu
   * @param {object} opts  { fitTo?: number, idle?: string }
   *   fitTo: modelin en uzun kenarı bu değere (oyun birimi = metre) ölçeklenir.
   *          Blender'daki ölçek hatalarına karşı koruma sağlar.
   *   idle:  sürekli oynatılacak animasyon klibinin adı (yoksa ilk klip).
   */
  async loadGLTF(name, url, opts = {}) {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    const scene = gltf.scene;

    // Gölge ayarları — Blender'dan gelen modeller bunu taşımaz
    scene.traverse((o) => {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });

    if (opts.fitTo) this._fitTo(scene, opts.fitTo);

    this.overrides.set(name, {
      scene,
      animations: gltf.animations ?? [],
      idle: opts.idle ?? null
    });
    return scene;
  }

  /** Modeli, en uzun kenarı `target` olacak biçimde ölçekler ve tabanını y=0'a oturtur. */
  _fitTo(object, target) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z);
    if (longest > 0 && Number.isFinite(longest)) {
      const k = target / longest;
      object.scale.multiplyScalar(k);
    }
    const box2 = new THREE.Box3().setFromObject(object);
    object.position.y -= box2.min.y;
  }

  /**
   * Manifesti okuyup içindeki tüm modelleri yükler.
   * Manifest ya da dosyalar yoksa hata fırlatmaz — prosedürel modeller kullanılır.
   * @returns {{loaded: string[], missing: string[], manifest: boolean}}
   */
  async loadManifest(baseUrl = import.meta.env?.BASE_URL ?? '/') {
    const url = `${baseUrl}models/manifest.json`.replace(/([^:]\/)\/+/g, '$1');
    const result = { loaded: [], missing: [], manifest: false };

    // Dosyadan (file://) açıldığında fetch her hâlükârda başarısız olur ve
    // tarayıcı konsoluna gereksiz bir ağ hatası yazar. Tek dosyalık dağıtımda
    // zaten harici model bulunmaz; aramayı hiç yapmıyoruz.
    if (typeof location !== 'undefined' && location.protocol === 'file:') return result;

    let manifest;
    try {
      const res = await fetch(url);
      if (!res.ok) return result;              // manifest yok: prosedürel devam
      manifest = await res.json();
    } catch {
      return result;                            // ağ/JSON hatası: prosedürel devam
    }
    result.manifest = true;

    const entries = Object.entries(manifest.models ?? {});
    await Promise.all(entries.map(async ([name, def]) => {
      const file = typeof def === 'string' ? def : def.file;
      if (!file) { result.missing.push(name); return; }
      const fileUrl = `${baseUrl}models/${file}`.replace(/([^:]\/)\/+/g, '$1');
      try {
        await this.loadGLTF(name, fileUrl, {
          fitTo: typeof def === 'object' ? def.fitTo : undefined,
          idle: typeof def === 'object' ? def.idle : undefined
        });
        result.loaded.push(name);
      } catch (err) {
        console.warn(`[ModelFactory] "${name}" yüklenemedi (${file}) — prosedürel model kullanılacak.`, err.message);
        result.missing.push(name);
      }
    }));

    return result;
  }

  /** Bu ad için harici model var mı? */
  has(name) { return this.overrides.has(name); }

  /**
   * Kayıtlı modelden bir kopya üretir. Animasyon varsa kopyaya özel bir
   * AnimationMixer kurulur ve `userData.mixer` üzerinden dışarı verilir;
   * WorldRenderer her karede bunu günceller.
   */
  _override(name) {
    const entry = this.overrides.get(name);
    if (!entry) return null;

    const obj = this._cloneScene(entry.scene);

    if (entry.animations.length) {
      const mixer = new THREE.AnimationMixer(obj);
      const clip = entry.idle
        ? THREE.AnimationClip.findByName(entry.animations, entry.idle) ?? entry.animations[0]
        : entry.animations[0];
      if (clip) {
        const action = mixer.clipAction(clip);
        action.play();
        // Aynı modelden çok sayıda kopya senkron oynamasın
        action.time = Math.random() * clip.duration;
      }
      obj.userData.mixer = mixer;
    }
    return obj;
  }

  /** İskeletli (skinned) modeller düz clone ile bozulur; SkeletonUtils gerekir. */
  _cloneScene(scene) {
    let skinned = false;
    scene.traverse((o) => { if (o.isSkinnedMesh) skinned = true; });
    if (!skinned) return scene.clone(true);
    if (!this._skeletonClone) {
      console.warn('[ModelFactory] SkeletonUtils yüklenmedi; iskeletli model düz kopyalanıyor.');
      return scene.clone(true);
    }
    return this._skeletonClone(scene);
  }

  /** İskeletli model desteği için SkeletonUtils'i hazırlar (opsiyonel). */
  async enableSkinnedModels() {
    const { clone } = await import('three/examples/jsm/utils/SkeletonUtils.js');
    this._skeletonClone = clone;
  }

  // ---------- ODA ----------

  buildRoom(room) {
    const custom = this._override(`room_${room.type}`);
    if (custom) { custom.position.set(room.x + room.w / 2, 0, room.z + room.d / 2); return custom; }

    const def = getRoomType(room.type);
    const group = new THREE.Group();
    group.name = `room:${room.id}`;
    group.userData = { kind: 'room', id: room.id };

    // Zemin
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(room.w - 0.08, 0.12, room.d - 0.08),
      new THREE.MeshLambertMaterial({ color: def.color })
    );
    floor.position.set(0, 0.06, 0);
    floor.receiveShadow = true;
    floor.userData = { kind: 'room', id: room.id };
    group.add(floor);

    // Duvarlar (kalın kenar çerçevesi)
    const t = 0.14;
    const wallMat = this.materials.wall.clone();
    const walls = [
      { w: room.w, d: t, x: 0, z: -room.d / 2 + t / 2 },
      { w: room.w, d: t, x: 0, z: room.d / 2 - t / 2 },
      { w: t, d: room.d, x: -room.w / 2 + t / 2, z: 0 },
      { w: t, d: room.d, x: room.w / 2 - t / 2, z: 0 }
    ];
    for (const w of walls) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, WALL_H, w.d), wallMat);
      mesh.position.set(w.x, WALL_H / 2 + 0.1, w.z);
      mesh.castShadow = true;
      mesh.userData = { kind: 'room', id: room.id, isWall: true };
      group.add(mesh);
    }

    // Kapı eşiği
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.06, 0.28),
      new THREE.MeshLambertMaterial({ color: 0x7f95ab })
    );
    door.position.set(0, 0.14, room.d / 2 - 0.14);
    group.add(door);

    // Kapı üzerindeki açılır kapanır gözlem penceresi
    // "Oda kapıları üzerinde içerisini gözlem yapmayı kolaylaştırmak amacı ile
    //  açılıp kapanabilen küçük pencereler bulunmalıdır." (Bölüm 3, s. 51)
    const window_ = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.3, 0.04),
      new THREE.MeshLambertMaterial({
        color: 0xa8c4d8, transparent: true, opacity: 0.75
      })
    );
    window_.position.set(0, WALL_H * 0.72, room.d / 2 - 0.06);
    window_.userData.isWindow = true;
    group.add(window_);

    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.38, 0.03),
      new THREE.MeshLambertMaterial({ color: 0x8fa3b5 })
    );
    windowFrame.position.set(0, WALL_H * 0.72, room.d / 2 - 0.08);
    group.add(windowFrame);

    // Oda üstündeki tür/oda tabelası
    // "Farklı odalarda yetiştirilen hayvanların her birinin odasının üzerine
    //  o odada barındırılan tür ile ilgili tabela asılması gerekir." (Bölüm 3, s. 51)
    const sign = this.buildSign(def.name, def.color);
    // Tabela duvarın belirgin biçimde üstünde durur; alçak kalınca yakın
    // zoom'da oda içeriğini kapatıyordu.
    sign.position.set(0, WALL_H + 0.52, room.d / 2 + 0.02);
    sign.userData.isSign = true;
    group.add(sign);
    group.userData.sign = sign;

    group.position.set(room.x + room.w / 2, 0, room.z + room.d / 2);
    return group;
  }

  // ---------- KAFES ----------

  buildCage(cage, localPos) {
    const custom = this._override(`cage_${cage.type}`);
    if (custom) { custom.position.copy(localPos); return custom; }

    const group = new THREE.Group();
    group.userData = { kind: 'cage', id: cage.id };

    // Görsel boyut taban alanından türetilir: 800 cm² -> 0,62 birim.
    // Sabit değer, geniş kafeslerin küçük görünmesine yol açıyordu.
    const scale = 0.62 * Math.sqrt((cage.def.floorArea ?? 800) / 800);
    const h = 0.26 * Math.min(1.6, Math.sqrt((cage.def.height ?? 18) / 18));

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(scale, h, scale * 0.78),
      this.materials.cage.clone()
    );
    body.position.y = h / 2;
    body.castShadow = true;
    body.userData = { kind: 'cage', id: cage.id };
    group.add(body);

    // Altlık
    const bedding = new THREE.Mesh(
      new THREE.BoxGeometry(scale * 0.9, 0.06, scale * 0.68),
      this.materials.bedding.clone()
    );
    bedding.position.y = h * 0.55;
    group.add(bedding);

    // Kapak — tipe göre renk/şekil
    const lidColor = {
      standard: 0xa9b6c2, improved: 0x93b39a, microisolator: 0x9fb4cc,
      ivc: 0x6f93bd, metabolism: 0xc2a98f
    }[cage.type] ?? 0xa9b6c2;
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(scale * 1.02, 0.07, scale * 0.8),
      new THREE.MeshLambertMaterial({ color: lidColor })
    );
    lid.position.y = h + 0.035;
    lid.castShadow = true;
    lid.userData = { kind: 'cage', id: cage.id };
    group.add(lid);

    // IVC hava bağlantısı
    if (cage.type === 'ivc') {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.22, 6),
        new THREE.MeshLambertMaterial({ color: 0x8fa7bd })
      );
      pipe.position.set(scale * 0.45, h + 0.14, 0);
      group.add(pipe);
    }

    // Hayvanların yerleştirileceği üst yüzey ve yan yana dizilme aralığı —
    // sabit sayı yerine kafes geometrisinden türetilir.
    group.userData.topY = h + 0.07;
    group.userData.spread = scale * 0.31;

    group.position.copy(localPos);
    return group;
  }

  /**
   * Yazılı tabela (canvas dokusu). Oda üstüne asılır ve odada barındırılan
   * türü gösterir (Bölüm 3, s. 51).
   */
  buildSign(text, accent = 0x4a7fb5) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f7f9fb';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = `#${new THREE.Color(accent).getHexString()}`;
    ctx.fillRect(0, 0, 512, 14);

    ctx.fillStyle = '#23303f';
    ctx.font = 'bold 54px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Uzun adlar tabelaya sığsın
    let label = text;
    while (ctx.measureText(label).width > 470 && label.length > 4) {
      label = label.slice(0, -2);
    }
    if (label !== text) label += '…';
    ctx.fillText(label, 256, 74);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 0.24),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    mesh.userData.canvas = canvas;
    mesh.userData.accent = accent;
    return mesh;
  }

  /** Var olan bir tabelanın yazısını değiştirir (oda türü atandığında). */
  updateSign(sign, text) {
    if (!sign?.userData?.canvas) return;
    if (sign.userData.text === text) return;
    sign.userData.text = text;
    const canvas = sign.userData.canvas;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f7f9fb';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = `#${new THREE.Color(sign.userData.accent).getHexString()}`;
    ctx.fillRect(0, 0, 512, 14);
    ctx.fillStyle = '#23303f';
    ctx.font = 'bold 54px "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let label = text;
    while (ctx.measureText(label).width > 470 && label.length > 4) {
      label = label.slice(0, -2);
    }
    if (label !== text) label += '…';
    ctx.fillText(label, 256, 74);
    sign.material.map.needsUpdate = true;
  }

  /** Kafes rafı (görsel dolgu) */
  buildRack(width, depth) {
    const g = new THREE.Group();
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.05, depth),
      this.materials.rack.clone()
    );
    shelf.position.y = 0.02;
    shelf.receiveShadow = true;
    g.add(shelf);
    return g;
  }

  // ---------- HAYVAN ----------

  buildAnimal(animal) {
    const custom = this._override(`animal_${animal.species}`);
    if (custom) return custom;

    const sp = getSpecies(animal.species);
    const s = sp.scale;
    const group = new THREE.Group();
    group.userData = { kind: 'animal', id: animal.id };

    const color = new THREE.Color(sp.color);
    if (animal.genetics !== 'wildtype') color.offsetHSL(0.45, 0.15, -0.05);
    const mat = new THREE.MeshLambertMaterial({ color, flatShading: true });

    // Gövde — düşük poligonlu kapsül benzeri
    const body = new THREE.Mesh(new THREE.SphereGeometry(s * 0.5, 7, 5), mat);
    body.scale.set(1.5, 0.85, 0.9);
    body.position.y = s * 0.5;
    body.castShadow = true;
    group.add(body);

    // Baş
    const head = new THREE.Mesh(new THREE.SphereGeometry(s * 0.3, 6, 5), mat);
    head.position.set(s * 0.65, s * 0.55, 0);
    head.castShadow = true;
    group.add(head);

    // Kulaklar
    const earGeo = new THREE.CircleGeometry(s * 0.17, 6);
    const earMat = new THREE.MeshLambertMaterial({
      color: color.clone().offsetHSL(0, 0, -0.08), side: THREE.DoubleSide
    });
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(earGeo, earMat);
      ear.position.set(s * 0.6, s * 0.78, side * s * 0.2);
      ear.rotation.y = Math.PI / 2;
      group.add(ear);
    }

    // Bacaklar — siluetin okunabilirliğini artırır
    const legGeo = new THREE.CylinderGeometry(s * 0.07, s * 0.06, s * 0.3, 4);
    const legMat = new THREE.MeshLambertMaterial({
      color: color.clone().offsetHSL(0, 0, -0.12), flatShading: true
    });
    for (const [lx, lz] of [[0.35, 0.28], [0.35, -0.28], [-0.35, 0.28], [-0.35, -0.28]]) {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(s * lx, s * 0.15, s * lz);
      leg.castShadow = true;
      group.add(leg);
    }

    // Burun ucu
    const snout = new THREE.Mesh(
      new THREE.SphereGeometry(s * 0.09, 5, 4),
      new THREE.MeshLambertMaterial({ color: 0xd8a8a4 })
    );
    snout.position.set(s * 0.88, s * 0.46, 0);
    group.add(snout);

    // Kuyruk (tavşan hariç uzun)
    const tailLen = animal.species === 'rabbit' ? s * 0.2 : s * 1.1;
    const tail = new THREE.Mesh(
      new THREE.CylinderGeometry(s * 0.05, s * 0.03, tailLen, 4),
      new THREE.MeshLambertMaterial({ color: 0xd8b8b0 })
    );
    tail.rotation.z = Math.PI / 2.2;
    tail.position.set(-s * 0.75, s * 0.45, 0);
    group.add(tail);

    return group;
  }

  /** Yerleştirme önizlemesi (hayalet) */
  buildGhost(typeId, valid) {
    const def = getRoomType(typeId);
    const [w, d] = def.size;
    const mat = new THREE.MeshBasicMaterial({
      color: valid ? 0x5da36f : 0xc1564f,
      transparent: true, opacity: 0.38, depthWrite: false
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, d), mat);
    mesh.position.y = 0.3;
    const group = new THREE.Group();
    group.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(w, 0.6, d)),
      new THREE.LineBasicMaterial({ color: valid ? 0x2f6a44 : 0x8f3c36 })
    );
    edges.position.y = 0.3;
    group.add(edges);
    return group;
  }

  /** Seçim çerçevesi */
  buildSelection(room) {
    const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(room.w, 1.8, room.d));
    const line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x4a7fb5 }));
    line.position.set(room.x + room.w / 2, 0.9, room.z + room.d / 2);
    return line;
  }
}
