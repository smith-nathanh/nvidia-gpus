import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { learningPage, figures } from '../dist/learning.js';
import { readRoute, writeRoute } from '../dist/navigation.js';

const base = { systemId:'gb300', view:'rack', mode:'learn', lesson:0, lens:'groups', storyPath:'peer', placement:'same', node:1, gpu:0 };
for (let lesson = 0; lesson < 4; lesson++) {
  for (const placement of ['same', 'split']) {
    for (const storyPath of ['memory','host','peer','remote']) {
      for (const lens of ['groups','network','storage']) {
        const state = { ...base, lesson, placement, storyPath, lens };
        assert.deepEqual(readRoute(writeRoute(state)), state, 'lesson bookmark must restore every interaction');
        const html = learningPage(state);
        assert.ok(!/undefined|NaN|null/.test(html));
        const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
        assert.equal(new Set(ids).size, ids.length, 'controls must have unique focus IDs');
        if (lesson === 3) {
          const ranks = [...html.matchAll(/<b>Rank (\d)<\/b>/g)].map(m => Number(m[1]));
          assert.deepEqual(ranks, [0,1,2,3,4,5,6,7], 'moving the allocation must preserve exactly eight ranks');
          assert.equal((html.match(/class="placement-domain"/g) || []).length, placement === 'same' ? 1 : 2);
        }
      }
    }
  }
}
for (const f of Object.values(figures)) {
  assert.ok(existsSync(new URL(`../dist/assets/nvidia/${f.file}`, import.meta.url)), 'official figures must work offline');
  assert.equal(new URL(f.source).protocol, 'https:');
  assert.ok(f.alt && f.credit);
}
assert.equal(readRoute('#gb300/learn?step=999').lesson, 3);
assert.equal(readRoute('#gb300/learn?step=-1').lesson, 0);
assert.equal(readRoute('#gb300/gpu?node=7&gpu=3').view, 'gpu', 'existing explorer bookmarks must retain their meaning');
console.log('Lesson bookmarks, eight-rank placement invariants, unique control IDs, and local attributed figures checked.');
