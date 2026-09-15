import test from 'node:test';
import assert from 'node:assert/strict';
import {
  usesRacks, rackCount, rackPositions, cageZLimit,
  RACK_W, RACK_D, RACK_GAP, CAGES_PER_RACK, MAX_RACKS
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
  // 4 birim genişlikte en fazla 3 raf sığar
  assert.equal(rackCount(room(), CAGES_PER_RACK * 10), 3);
  // dar odada tek raf
  assert.equal(rackCount(room({ w: 2, d: 2 }), 40), 1);
  assert.ok(rackCount(room({ w: 20 }), CAGES_PER_RACK * 10) <= MAX_RACKS);
});

test('raflar oda içinde kalır, üst üste binmez ve arka duvara yaslanır', () => {
  const r = room();
  const pos = rackPositions(r, 3);
  assert.equal(pos.length, 3);
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

test('raf varken kafes ızgarası arka şeridi rafa bırakır', () => {
  const r = room();
  const free = cageZLimit(r, 2);
  assert.ok(free < r.d / 2);
  assert.ok(free <= rackPositions(r, 2)[0].z - RACK_D / 2);
  // raf yoksa oda sonuna kadar kullanılır
  assert.equal(cageZLimit(r, 0), r.d / 2);
});
