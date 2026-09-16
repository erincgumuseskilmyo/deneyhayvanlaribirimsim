import test from 'node:test';
import assert from 'node:assert/strict';
import {
  usesRacks, rackCount, rackPositions, cageSlot, slotPosition,
  RACK_W, RACK_D, RACK_H, RACK_GAP, RACK_COLS, RACK_SHELVES, RACK_SLOTS,
  SLOT_W, SLOT_D, SLOT_PITCH, SHELF_Y, CAGES_PER_RACK, MAX_RACKS
} from '../src/world/rackLayout.js';

const room = (over = {}) => ({
  w: 4, d: 4, species: 'mouse',
  def: { capacity: 24 },
  ...over
});

test('kafes rafı tavşan odasında kullanılmaz (tavşan tel örgü kafeste, s. 120)', () => {
  assert.equal(usesRacks(room()), true);
  assert.equal(usesRacks(room({ species: 'rabbit' })), false);
  assert.equal(rackCount(room({ species: 'rabbit' }), 12), 0);
});

test('kafessiz ya da kafes konulamayan odada raf çizilmez', () => {
  assert.equal(rackCount(room(), 0), 0);
  assert.equal(usesRacks(room({ def: { capacity: 0 } })), false);
});

test('raf sayısı kafes sayısıyla artar ve oda genişliğiyle sınırlanır', () => {
  assert.equal(rackCount(room(), 1), 1);
  assert.equal(rackCount(room(), CAGES_PER_RACK), 1);
  assert.equal(rackCount(room(), CAGES_PER_RACK + 1), 2);
  // 4 birim genişlikte en fazla 2 raf sığar (raf genişliği 1,56)
  assert.equal(rackCount(room(), CAGES_PER_RACK * 10), 2);
  // dar odada tek raf
  assert.equal(rackCount(room({ w: 2, d: 2 }), 40), 1);
  assert.ok(rackCount(room({ w: 20 }), CAGES_PER_RACK * 10) <= MAX_RACKS);
});

test('raflar oda içinde kalır, üst üste binmez ve arka duvara yaslanır', () => {
  const r = room();
  const pos = rackPositions(r, 2);
  assert.equal(pos.length, 2);
  for (const p of pos) {
    assert.ok(p.x - RACK_W / 2 >= -r.w / 2, 'sol duvarı aşmamalı');
    assert.ok(p.x + RACK_W / 2 <= r.w / 2, 'sağ duvarı aşmamalı');
    assert.ok(p.z + RACK_D / 2 <= r.d / 2, 'arka duvarı aşmamalı');
    assert.ok(p.z > 0, 'odanın arka yarısında durmalı');
  }
  for (let i = 1; i < pos.length; i++) {
    assert.ok(pos[i].x - pos[i - 1].x >= RACK_W + RACK_GAP - 1e-9, 'raflar çakışmamalı');
  }
  // simetrik dizilir
  assert.ok(Math.abs(pos[0].x + pos[pos.length - 1].x) < 1e-9);
});

test('kafesler raf gözlerine alttan üste, soldan sağa dağılır', () => {
  assert.deepEqual(cageSlot(0, 2), { rack: 0, shelf: 0, col: 0 });
  assert.deepEqual(cageSlot(1, 2), { rack: 0, shelf: 0, col: 1 });
  assert.deepEqual(cageSlot(RACK_COLS, 2), { rack: 0, shelf: 1, col: 0 });
  // ilk rafa düşen kafes kotası dolunca ikinci rafa geçilir
  assert.equal(cageSlot(CAGES_PER_RACK, 2).rack, 1);
  assert.deepEqual(cageSlot(CAGES_PER_RACK, 2), { rack: 1, shelf: 0, col: 0 });
  // raf sayısından fazlası taşmaz, son rafın son gözünde kalır
  const last = cageSlot(999, 1);
  assert.equal(last.rack, 0);
  assert.ok(last.shelf < RACK_SHELVES && last.col < RACK_COLS);
});

test('göz konumları rafın içinde kalır', () => {
  assert.equal(RACK_SLOTS, RACK_SHELVES * RACK_COLS);
  assert.equal(SHELF_Y.length, RACK_SHELVES);
  for (let shelf = 0; shelf < RACK_SHELVES; shelf++) {
    for (let col = 0; col < RACK_COLS; col++) {
      const p = slotPosition(shelf, col);
      assert.ok(Math.abs(p.x) + SLOT_W / 2 <= RACK_W / 2, 'göz rafın genişliğini aşmamalı');
      assert.ok(p.y > 0 && p.y + 0.2 < RACK_H, 'göz rafın yüksekliği içinde olmalı');
    }
  }
  // gözler soldan sağa sıralı ve eşit aralıklı
  const xs = Array.from({ length: RACK_COLS }, (_, c) => slotPosition(0, c).x);
  for (let i = 1; i < xs.length; i++) {
    assert.ok(xs[i] > xs[i - 1]);
    assert.ok(Math.abs((xs[i] - xs[i - 1]) - SLOT_PITCH) < 1e-6);
  }
  // raf katları alttan üste yükselir ve göz derinliği rafın derinliğine sığar
  for (let i = 1; i < SHELF_Y.length; i++) assert.ok(SHELF_Y[i] > SHELF_Y[i - 1]);
  assert.ok(SLOT_D <= RACK_D);
  assert.ok(SLOT_W < SLOT_PITCH, 'kafes gözü aralığından dar olmalı');
});
