import assert from 'node:assert/strict';
import { systems, sources, getModel, gpuCount, cpuCount } from '../dist/models.js';
import { diagram } from '../dist/diagrams.js';
import { readRoute, writeRoute, viewKeys } from '../dist/navigation.js';

// Distinguish the reference configurations; do not inherit the pilot's rack/CPU model.
const expected = {
  gb300: [72, 36, 4, 'c2c', 288],
  h100: [8, 2, 8, 'pcie', 80], h200: [8, 2, 8, 'pcie', 141],
  gh200: [1, 1, 1, 'c2c', 144],
  b200: [8, 2, 8, 'pcie', 180], gb200: [72, 36, 4, 'c2c', 186],
  b300: [8, 2, 8, 'pcie', null], rubin: [72, 36, 4, 'c2c', 288],
  spark: [1, 1, 1, 'shared', 128], station: [1, 1, 1, 'c2c', 252]
};
assert.deepEqual(Object.keys(systems).sort(), Object.keys(expected).sort());
for (const [id, counts] of Object.entries(expected)) {
  const m = getModel(id), s = m.spec;
  assert.deepEqual([gpuCount(s), cpuCount(s), s.gpusPerNode, s.hostKind, s.gpuMemoryGB], counts, `${id}: incorrect reference configuration`);
  for (const key of s.sources) assert.ok(Object.hasOwn(sources, key), `${id}: missing source ${key}`);
  for (const c of Object.values(m.components)) {
    for (const key of c.sources) assert.ok(Object.hasOwn(sources, key));
    if (c.action) assert.ok(Object.hasOwn(m.views, c.action[0]));
  }
  for (const t of Object.values(m.traces)) {
    assert.ok(Object.hasOwn(m.views, t.view));
    assert.ok(Object.hasOwn(m.components, t.component));
    assert.equal(t.rate.length, 2);
  }
  assert.equal(Boolean(m.traces.peer), s.gpusPerNode > 1);
  assert.equal(m.traces.memory.rate[0], m.traces.memory.rate[1], `${id}: do not double memory bandwidth`);
  for (const view of viewKeys) {
    const state = { systemId:id, view, node:s.nodes, gpu:s.gpusPerNode - 1, selected:'gpu', trace:'memory', labels:true };
    assert.deepEqual(readRoute(writeRoute(state)), stateWithoutLabels(state), `${id}: bookmark lost identity`);
    const html = diagram(m, state);
    assert.ok(!/undefined|NaN|null/.test(html), `${id}/${view}: unfilled diagram value`);
    const focusKeys = [...html.matchAll(/data-focus-key="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(focusKeys).size, focusKeys.length, `${id}/${view}: duplicate focus identity`);
    for (const [, key] of html.matchAll(/data-component="([^"]+)"/g)) assert.ok(Object.hasOwn(m.components, key), `${id}/${view}: missing component ${key}`);
    for (const [, key] of html.matchAll(/data-go="([^"]+)"/g)) assert.ok(viewKeys.includes(key));
    if (view === 'node') {
      const gpuButtons = [...html.matchAll(/data-go="gpu"[^>]*data-gpu="(\d+)"/g)].map(match => Number(match[1]));
      assert.deepEqual(gpuButtons, Array.from({length:s.gpusPerNode}, (_, i) => i), `${id}: node map does not match GPU inventory`);
      assert.equal(html.includes('data-component="cpuLink"'), s.cpusPerNode === 2, `${id}: missing or spurious CPU-to-CPU connection`);
    }
  }
}
function stateWithoutLabels({labels, ...route}) { return route; }
assert.equal(readRoute('#gpu').systemId, 'gb300', 'legacy pilot bookmarks still work');
assert.equal(readRoute('#gpu').view, 'gpu');
assert.equal(systems.station.gpuMemoryGB + 496, 748);
assert.equal(systems.spark.memoryGBps, 273);
assert.equal(systems.rubin.memoryGBps, 19200, 'use current product HBM rate, not earlier architecture rate');
assert.equal(systems.rubin.nvlinkBidirGBps, 3000, 'use current product NVLink rate');
assert.equal(getModel('gb300').traces.remote.rate[1], '200 GB/s');
assert.equal(systems.b300.gpuMemoryGB, null, 'do not infer DGX individual capacity from a rounded system total or HGX row');
assert.equal(systems.b300.memoryGBps, null, 'do not substitute generic Ultra bandwidth for DGX B300');
assert.equal(systems.b300.totalGpuMemory, '2.1 TB');
assert.equal(systems.b300.totalMemoryGBps, 62000);
assert.equal(getModel('b300').traces.memory.rate[0], 'Not specified per GPU');
for (const id of ['gb200', 'gb300', 'rubin']) {
  assert.equal(getModel(id).traces.peer.chain[0], 'GPU 0 · Node 01');
  assert.equal(getModel(id).traces.peer.chain.at(-1), 'GPU 3 · Node 18');
}
assert.equal(getModel('spark').traces.remote.rateLabel[0], 'Selected connection · each direction');
assert.equal(getModel('station').traces.remote.rateLabel[0], 'Adapter aggregate · each direction');
const hostMap = diagram(getModel('gb300'), {view:'node', node:1, gpu:0, selected:'c2c', trace:'host', labels:true});
assert.match(hostMap, /class="map-connection amber "><span aria-hidden="true"><\/span><button class="" data-component="cpuLink"/, 'a local CPU–GPU path must not highlight the CPU-to-CPU link');
for (const ref of Object.values(sources)) assert.equal(new URL(ref.url).protocol, 'https:');
console.log('Ten reference models, all forty maps, source/interaction targets, CPU links, GPU identities, routes and memory conventions checked.');
