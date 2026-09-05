import { Game } from './core/Game.js';
import { SceneManager } from './world/SceneManager.js';
import { WorldRenderer } from './world/WorldRenderer.js';
import { HUD } from './ui/HUD.js';
import { BuildPanel } from './ui/BuildPanel.js';
import { DetailPanel } from './ui/DetailPanel.js';
import { TabBar } from './ui/TabBar.js';
import { Modal } from './ui/Modal.js';
import { Toasts } from './ui/Toasts.js';
import { endGameScreen } from './ui/screens/EndGameScreen.js';
import { $, el } from './ui/dom.js';
import { money } from './core/utils.js';

// --- Oyunu kur ---
const game = new Game({ seed: Date.now() % 1000000 });
const { bus, state, time, systems } = game;

const sceneMgr = new SceneManager($('#scene'), game.gridSize);
const world = new WorldRenderer(sceneMgr, state, bus);

const modal = new Modal(bus, time);
const toasts = new Toasts(bus);
const hud = new HUD(state, time, bus);
const buildPanel = new BuildPanel(state, systems.facility, bus);
const detailPanel = new DetailPanel(state, systems, bus, modal);
const tabBar = new TabBar(state, systems, bus, modal);

game.bootstrap();
world.sync();

// --- Opsiyonel harici modeller (public/models/manifest.json) ---
// Manifest yoksa oyun prosedürel modellerle çalışmaya devam eder.
world.factory.enableSkinnedModels().catch(() => {});
world.factory.loadManifest().then((res) => {
  if (!res.manifest) return;
  if (res.loaded.length) {
    world.reloadModels();
    bus.emit('notify', {
      text: `${res.loaded.length} harici model yüklendi.`, level: 'good'
    });
  }
  if (res.missing.length) {
    bus.emit('notify', {
      text: `${res.missing.length} model yüklenemedi; prosedürel model kullanılıyor.`,
      level: 'warn'
    });
  }
}).catch(() => {});

// --- Girdi: fare ile yerleştirme ve seçim ---
let buildMode = { mode: 'select', type: null };
bus.on('build:modeChanged', (m) => {
  buildMode = m;
  if (m.mode !== 'build') world.clearGhost();
});

const canvas = $('#scene');

// Koridor döşerken fareyi basılı tutup sürüklemek karo dizisi çizer.
let painting = false;

function placeCorridor(gx, gz, { quiet = false } = {}) {
  const res = systems.corridors.place(buildMode.type, gx, gz);
  if (!res.ok && !quiet) bus.emit('notify', { text: res.reason, level: 'bad' });
  if (res.ok) maybeTeachCorridor();
  return res.ok;
}

canvas.addEventListener('pointermove', (e) => {
  if (buildMode.mode !== 'build' || !buildMode.type) return;
  const hit = sceneMgr.pointerToGrid(e.clientX, e.clientY);
  if (!hit) return;
  if (buildMode.kind === 'corridor') {
    const check = systems.corridors.canPlace(buildMode.type, hit.gx, hit.gz);
    world.setCorridorGhost(buildMode.type, hit.gx, hit.gz, check.ok);
    // Sürükleyerek döşeme: geçilen her uygun karoya koridor koy
    if (painting && check.ok) placeCorridor(hit.gx, hit.gz, { quiet: true });
    return;
  }
  const check = systems.facility.canPlace(buildMode.type, hit.gx, hit.gz);
  world.setGhost(buildMode.type, hit.gx, hit.gz, check.ok);
});

canvas.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  canvas._downAt = { x: e.clientX, y: e.clientY };
  if (buildMode.mode === 'build' && buildMode.kind === 'corridor') painting = true;
});

window.addEventListener('pointerup', () => { painting = false; });

canvas.addEventListener('pointerup', (e) => {
  if (e.button !== 0) return;
  const down = canvas._downAt;
  // Kamera sürüklemesini tıklamadan ayır
  if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;

  if (buildMode.mode === 'build' && buildMode.type) {
    const hit = sceneMgr.pointerToGrid(e.clientX, e.clientY);
    if (!hit) return;
    if (buildMode.kind === 'corridor') { placeCorridor(hit.gx, hit.gz); return; }
    const res = systems.facility.placeRoom(buildMode.type, hit.gx, hit.gz);
    if (res.ok) {
      bus.emit('notify', { text: `${res.room.name} inşa edildi.`, level: 'good' });
      maybeTeach(res.room.type);
    } else {
      bus.emit('notify', { text: res.reason, level: 'bad' });
    }
    return;
  }

  const hits = sceneMgr.pick(e.clientX, e.clientY, world.pickableObjects());
  const picks = hits.map((h) => world.resolvePick(h.object));

  if (buildMode.mode === 'demolish') {
    const tile = picks.find((d) => d?.kind === 'corridor');
    if (tile) {
      const res = systems.corridors.remove(tile.x, tile.z);
      bus.emit('notify', {
        text: res.ok ? `Koridor söküldü, ${money(res.refund)} geri kazanıldı.` : res.reason,
        level: res.ok ? 'good' : 'bad'
      });
      return;
    }
  }

  const found = picks.find((d) => d?.kind === 'room');
  if (!found) {
    detailPanel.select(null);
    world.setSelection(null);
    return;
  }
  if (buildMode.mode === 'demolish') {
    const res = systems.facility.demolishRoom(found.id);
    bus.emit('notify', {
      text: res.ok ? `Oda yıkıldı, ${money(res.refund)} geri kazanıldı.` : res.reason,
      level: res.ok ? 'good' : 'bad'
    });
    return;
  }
  detailPanel.select(found.id);
  world.setSelection(state.roomById(found.id));
});

canvas.addEventListener('contextmenu', (e) => {
  if (buildMode.mode === 'build') {
    e.preventDefault();
    buildPanel.setMode('select');
  }
});

// Klavye kısayolları
window.addEventListener('keydown', (e) => {
  if (modal.open) { if (e.key === 'Escape') modal.close(); return; }
  if (e.key === 'Escape') buildPanel.setMode('select');
  if (e.key === ' ') { e.preventDefault(); time.setSpeed(time.isPaused() ? 1 : 0); hud.renderSpeeds(); }
  if (e.key === '1') { time.setSpeed(1); hud.renderSpeeds(); }
  if (e.key === '2') { time.setSpeed(2); hud.renderSpeeds(); }
  if (e.key === '3') { time.setSpeed(4); hud.renderSpeeds(); }
});

// --- Eğitsel bilgi kartları: ilk kez yapılan işlemlerde ---
const taught = new Set();
const ROOM_TEACH = {
  animal: 'environment', quarantine: 'quarantine', changing: 'biosecurity',
  cleaning: 'hygiene', ivc: 'ivc', genetics: 'gm_animals',
  classroom: 'certificate', food_storage: 'pest'
};
function maybeTeachCorridor() {
  if (taught.has('corridor')) return;
  if (modal.open || modal.queue.length) return;
  taught.add('corridor');
  modal.show({ title: 'Bilgi Kartı', body: '', knowledge: 'corridor' });
}

function maybeTeach(roomType) {
  const k = ROOM_TEACH[roomType];
  if (!k || taught.has(k)) return;
  // Arka arkaya oda kurulduğunda bilgi kartları üst üste yığılmasın:
  // modal meşgulse kartı işaretlemeden geç, bir sonraki fırsatta gösterilsin.
  if (modal.open || modal.queue.length) return;
  taught.add(k);
  modal.show({ title: 'Bilgi Kartı', body: '', knowledge: k });
}

// --- Sistem olaylarına bağlı modallar ---

bus.on('event:triggered', ({ def, options }) => {
  const body = el('div', {}, [el('p', { text: def.text })]);
  modal.show({
    title: def.title,
    body,
    knowledge: def.knowledge,
    actions: options.map((o, i) => ({
      label: o.cost ? `${o.label} (${money(o.cost)})` : o.label,
      primary: i === 0,
      disabled: !o.available,
      onClick: () => {
        const res = systems.events.resolve(i);
        if (!res) return;
        setTimeout(() => modal.show({
          title: `${def.title} — Sonuç`,
          body: `<p>${res.result}</p><p class="hint">Etki: ${
            Object.entries(res.effects).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(', ') || 'yok'
          }</p>`
        }), 70);
      }
    }))
  });
});

bus.on('disease:outbreak', ({ room, options }) => {
  modal.show({
    title: 'Hastalık Şüphesi',
    body: `<p><strong>${room.name}</strong> odasında hastalık şüphesi bildirildi. ` +
          'Verilecek karar ekonomiyi, refahı, biyogüvenliği ve itibarı farklı biçimlerde etkiler.</p>',
    knowledge: 'quarantine',
    actions: options.map((o, i) => ({
      label: o.label,
      primary: o.id === 'quarantine',
      danger: o.id === 'continue',
      disabled: !o.available,
      onClick: () => {
        const res = systems.disease.resolveOutbreak(o.id);
        setTimeout(() => modal.show({
          title: 'Karar Sonucu',
          body: `<p>${res.text}</p>` +
                (res.cost ? `<p class="hint">Maliyet: ${money(res.cost)}</p>` : '') +
                `<p class="hint">Etki: ${
                  Object.entries(res.effects).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(', ') || 'yok'
                }</p>`,
          knowledge: 'biosecurity'
        }), 70);
      }
    }))
  });
});

let welfareAlarmShown = 0;
bus.on('welfare:alarm', ({ level }) => {
  if (state.day - welfareAlarmShown < 45) return;
  welfareAlarmShown = state.day;
  modal.show({
    title: 'Hayvan Refahı Alarmı',
    body: `<p>Tesis genelinde ortalama refah ${Math.round(level)} seviyesine düştü. ` +
          'Raporlar sekmesindeki "Refah Bileşenleri" tablosundan hangi faktörün ' +
          'düşük olduğunu görebilirsiniz.</p>',
    knowledge: 'welfare_five'
  });
});

bus.on('certification:finished', (course) => {
  const r = course.results;
  modal.show({
    title: 'Sertifika Sınavı Sonuçlandı',
    body: `<p>${course.studentCount} kursiyerden <strong>${r.certified}</strong> kişi CERTIFIED, ` +
          `<strong>${r.failed}</strong> kişi FAILED oldu (geçme notu ${r.passMark}).</p>`,
    knowledge: 'certificate'
  });
});

// İlk oda kurulduğunda kamerayı tesise yönelt
let focusedOnce = false;
bus.on('room:built', (room) => {
  if (focusedOnce) return;
  focusedOnce = true;
  sceneMgr.focusOn(room.x + room.w / 2, room.z + room.d / 2);
});

bus.on('facility:levelUp', (level) => {
  bus.emit('notify', { text: `Tesis seviyesi ${level}'e yükseldi.`, level: 'good' });
  buildPanel.render();
});

bus.on('game:over', ({ reason }) => {
  modal.show({
    title: 'Dönem Sonu Değerlendirmesi',
    body: endGameScreen(state, systems, reason),
    knowledge: 'game_scoring',
    actions: [{ label: 'Yeniden Başla', primary: true, onClick: () => window.location.reload() }]
  });
});

bus.on('staff:changed', () => detailPanel.render());

// --- Açılış brifingi ---
modal.show({
  title: 'Laboratuvar Hayvanları Yetiştirme Birimi',
  body:
    '<p>Sıfırdan bir deney hayvanları üretim ve kullanım birimi kuracaksınız. ' +
    'Amaç yalnızca kâr etmek değil; <strong>ekonomik sürdürülebilirlik, hayvan refahı, ' +
    'biyogüvenlik, etik uygunluk ve bilimsel kaliteyi</strong> birlikte dengelemektir.</p>' +
    '<h3>İlk adımlar</h3>' +
    '<ol>' +
    '<li>Hayvan Odası, Giyinme Odası, Temizlik Alanı, Karantina ve Teknik Oda inşa edin.</li>' +
    '<li>Personel sekmesinden en az bir Veteriner Hekim ve bir Hayvan Bakıcısı işe alın.</li>' +
    '<li>Sağ panelden çalışma izni başvurusunda bulunun.</li>' +
    '<li>Hayvan Odasına kafes alın ve ilk fare kolonisini kurun.</li>' +
    '<li>HADYEK kurun; araştırma başvuruları gelmeye başlasın.</li>' +
    '</ol>' +
    '<p class="hint">Kontroller: sol tık sürükle = döndür · sağ tık sürükle = kaydır · ' +
    'tekerlek = yakınlaş/uzaklaş · Boşluk = duraklat/devam</p>',
  knowledge: 'game_scoring',
  actions: [{ label: 'Başla', primary: true, onClick: () => time.setSpeed(1) }]
});

// --- Ana döngü ---
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;

  time.update(dt);
  world.animate(dt);
  world.refreshIndicators();
  sceneMgr.updateWallTransparency();
  sceneMgr.render();

  hud.update();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Panelleri periyodik tazele (her oyun günü değil, 1 sn'de bir yeterli)
setInterval(() => {
  if (!modal.open) {
    detailPanel.render();
    tabBar.render();
  }
}, 1000);

// Geliştirme kolaylığı: konsoldan erişim
window.__game = { game, state, systems, world, sceneMgr };
