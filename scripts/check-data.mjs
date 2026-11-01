import assert from 'node:assert/strict';
import { system as s, components, views, traces, sources } from '../dist/data.js';

assert.equal(s.nodes * s.gpusPerNode, 72, 'NVL72 must contain 72 GPUs');
assert.equal(s.nodes * s.cpusPerNode, 36, 'Rack must contain 36 Grace CPUs');
assert.equal(s.superchipsPerNode * 2, s.gpusPerNode, 'Each GB300 superchip pairs two GPUs');
assert.equal(s.switchTrays * s.switchesPerTray, s.linksPerGpu, 'One GPU link to each switch ASIC');
assert.equal(s.nvlinkBidirGBps / 2, 900, 'NVLink direction conversion');
assert.equal(s.nicGbps / 8, 100, 'Network bit-to-byte conversion');
for (const component of Object.values(components)) {
  for (const key of component.sources) assert.ok(sources[key], `Unknown source ${key}`);
  if (component.action) assert.ok(views[component.action[0]], 'Unknown view action');
}
for (const trace of Object.values(traces)) {
  assert.ok(views[trace.view]);
  assert.ok(components[trace.component]);
  assert.equal(trace.rate.length, 2);
}
for (const source of Object.values(sources)) assert.equal(new URL(source.url).protocol, 'https:');
console.log('Architecture counts, bandwidth conversions, source references, and navigation targets checked.');
