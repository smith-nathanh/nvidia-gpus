import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { learningPage, figures, lessons, lessonOptions, lessonSteps } from '../dist/learning.js';
import { systems, getModel } from '../dist/models.js';
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
assert.deepEqual(Object.keys(lessons).sort(), Object.keys(systems).filter(id=>id !== 'gb300').sort(), 'every remaining reference needs a lesson');
for (const [id,lesson] of Object.entries(lessons)) {
  const spec = systems[id], options = lessonOptions(id);
  assert.equal(lessonSteps(id).length, 4);
  assert.equal(lesson.titles.length, 4);
  assert.equal(lesson.intros.length, 4);
  assert.equal(options.paths.includes('peer'), spec.gpusPerNode > 1, `${id}: no invented local peer`);
  assert.ok(figures[lesson.overview.figure] && figures[lesson.inside.figure]);
  for (const lens of Object.values(lesson.inside.lenses)) for (const z of lens.zones || []) {
    for (const n of Object.values(z)) assert.ok(Number.isFinite(n) && n >= 0 && n <= 100);
    assert.ok(z.left + z.width <= 100 && z.top + z.height <= 100, `${id}: highlight outside image`);
  }
  if (lesson.experiment.kind === 'memory-placement') assert.ok(lesson.experiment.workingSetGB > 0 && lesson.experiment.workingSetGB <= spec.gpuMemoryGB, 'buffer must fit both illustrated memory placements');
  for (let step = 0; step < 4; step++) for (const placement of ['same','split']) for (const storyPath of options.paths) for (const lens of options.lenses) {
    const state = {...base,systemId:id,lesson:step,placement,storyPath,lens};
    assert.deepEqual(readRoute(writeRoute(state)),state, `${id}: learning bookmark lost state`);
    const html = learningPage(state);
    assert.ok(!/undefined|NaN|null/.test(html),`${id}/${step}: unfilled value`);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,`${id}/${step}: duplicate focus IDs`);
    for (const [,key] of html.matchAll(/data-figure="([^"]+)"/g)) assert.ok(figures[key]);
    if (step === 2) {
      assert.ok(getModel(id).traces[storyPath]);
      assert.ok(html.includes(getModel(id).traces[storyPath].rate[0]),`${id}: lesson should use canonical scoped rate`);
    }
    if (step === 3 && ['server-placement','rack-placement'].includes(lesson.experiment.kind)) {
      const ranks = [...html.matchAll(/<b>Rank (\d)<\/b>/g)].map(m=>Number(m[1]));
      assert.deepEqual(ranks,[0,1,2,3,4,5,6,7],`${id}: preserve eight allocated ranks`);
      const physical = [...html.matchAll(/class="lesson-gpu /g)].length;
      assert.equal(physical,lesson.experiment.kind === 'server-placement' && placement === 'split' ? 16 : 8,`${id}: idle physical GPUs must remain visible`);
      assert.equal([...html.matchAll(/class="placement-domain[ "]/g)].length,placement === 'split' ? 2 : 1);
    }
  }
}
const spark = lessons.spark.experiment;
const sum = b => b.cpu + b.gpu + b.other;
assert.ok(sum(spark.budgets.same) < 128 && sum(spark.budgets.split) > 128, 'Spark exercise must expose shared capacity contention');
assert.equal(lessons.gh200.experiment.kind,'memory-placement');
assert.equal(lessons.station.experiment.kind,'memory-placement');
console.log('All forty lessons, complete bookmarks, topology-specific experiments, canonical rates, local figures and highlight bounds checked.');
