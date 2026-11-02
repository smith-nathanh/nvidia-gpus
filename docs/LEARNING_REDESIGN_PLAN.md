# Learning redesign expansion — implementation and review record

## Authorization and checkpoint

The user approved the GB300 lesson and asked to push it, then redesign all nine remaining systems to the same caliber. They explicitly permit Astra subagents and expect work to survive compaction. Approved checkpoint: `55300b3` on `codex/gb300-learning-redesign`. The user authorized creating a private GitHub repository with the installed CLI. Created [smith-nathanh/nvidia-gpus](https://github.com/smith-nathanh/nvidia-gpus) (verified private), pushed approved checkpoint `55300b3` to `main` and `codex/gb300-learning-redesign`; `main` is default. Completed expansion is on `codex/all-architecture-lessons`. Inspect its remote-tracking state for the current push status.

## Quality bar

- Teach a mental model, not a spec inventory. Each screen answers one question with a dominant visual, brief explanatory prose, a takeaway, and a next step.
- The audience understands GPUs/LLMs and CPU-only Slurm. Connect CPU, GPU, memory, node/server, rack, fabric and process/rank boundaries precisely.
- Match the approved GB300 visual lesson (now preserved in `dist/lessons/gb300.js`, with `dist/learning.css` and `artifacts/gb300-learning-overview.jpg`). Do not merely swap names and numbers. Preserve topology differences.
- NVIDIA figures are learning material: tell the reader where to look, explain lines and missing paths, highlight verified regions, provide attribution, source, full-size viewing and local copies. A related-generation figure must be clearly labeled; never imply that it depicts the selected SKU. Prefer an accurate architecture diagram over decorative photography.
- Interactions must change an architectural consequence: path, locality, allocation boundary or memory budget. Do not invent benchmark predictions, allocator behavior, scheduler policy or unspecified hardware values.
- Distinguish hardware facts, reference/SKU scope, examples and inference. Keep existing `models.js` constraints unless new primary evidence justifies a documented correction.
- Text must be concise, specific, and high quality. Avoid generic repeated prose. Every architecture should answer what is distinctive about it and what matters for real workloads.
- Complete all forty lesson screens and preserve all forty detailed explorer maps, history, focus, keyboard use, narrow layouts and image enlargement. No build/dependency/hosted deployment.

## Work ownership

| Owner | Systems / files | Status |
| --- | --- | --- |
| Root | Shared renderer, route/state, CSS, integration, test suite and final browser QA | Complete |
| Astra server agent | H100, H200, B200, B300; `dist/lessons/servers.js`; `dist/assets/nvidia/servers/`; `docs/research/servers.md` | Content complete; cross-reviewed |
| Astra rack agent | GB200, Vera Rubin; `dist/lessons/racks.js`; `dist/assets/nvidia/racks/`; `docs/research/racks.md` | Content complete; cross-reviewed |
| Astra coherent systems agent | GH200, Spark, Station; `dist/lessons/coherent.js`; `dist/assets/nvidia/coherent/`; `docs/research/coherent.md` | Content complete; cross-reviewed |

Agents must not edit shared files or commit. They should browse primary sources, download/inspect official figures, and author data modules to the contract below. Root owns integration and checks architecture claims and visual results. Record progress and remaining uncertainties in the assigned research file, not only in chat.

## Content module contract

Each module exports `lessons` keyed by system ID and `figures` keyed by globally unique IDs (e.g. `h100-topology`). All content is curated local data, never remote HTML. Plain strings except `titles`, `takeaway` and `takeawayLabel` may contain simple controlled `<strong>`, `<em>` and `<br>` markup. No scripts, inline handlers or product-visible implementation commentary.

Figure shape:

```js
{ file: 'servers/h100-topology.png', title, source: 'https://...#figure',
  credit: 'NVIDIA ... · Figure N', alt, note,
  minWidth: 900, // readable full image width; choose from actual image
  overviewFit: 'wide' // optional; wide is default, portrait only for a rack photo
}
```

Lesson shape:

```js
{
  steps: [[label, subtitle], ...], // four steps
  titles: [htmlHeading, ...], intros: [plainParagraph, ...], // four each
  reference: 'short exact configuration scope', checked: 'November 2, 2026',
  overview: {
    figure: 'unique-key', diagram: 'server'|'rack'|'coherent'|'shared',
    stageLabel, boundaryLabel, caption, takeawayLabel, takeaway,
    equation: [{value, label}, ...] // optional identity/count relationship, not arbitrary multiplication
  },
  inside: {
    figure: 'unique-key',
    recipe: [{value, label}, ...], // 2–3 meaningful relationships
    lenses: {
      groups: {label,title,text,hint,zones:[{left:0,top:0,width:20,height:20}, ...]},
      network: {...}, storage: {...} // keys fixed; labels adapt to actual content
    }, // zone values are percentages, measured against inspected whole image
    takeawayLabel, takeaway,
    deeper: {figure:'key', title, paragraphs:[plainText,...]} // optional
  },
  paths: {
    memory: {label,question,title,steps:[[title,subtitle,'gpu'|'memory'|'cpu'|'fabric'|'network'], ...], impact, source},
    host: {...}, peer: {...}, remote: {...}
  }, // omit peer for single-GPU refs; root uses model.traces rates/scope/caveats, no copied rates
  transferTakeaway: 'optional architecture-specific takeaway',
  experiment: {
    kind:'server-placement'|'rack-placement'|'memory-placement'|'shared-budget',
    title,intro,options:['same option label','split option label'],
    states:{same:{title,text},split:{title,text}},
    workingSetGB:100, // only memory-placement: illustrative fixed buffer, within selected GPU capacity
    budgets:{same:{cpu:24,gpu:80,other:8},split:{cpu:24,gpu:104,other:8}}, // only shared-budget, root calculates totals
    caveat, takeawayLabel, takeaway,
    bridge:[{label,title,paragraphs:[plainText,...]}, ...], // 2 max, tied to user's work
    sources:[{url,label}, ...],
    check:{question,answer}
  }
}
```

Server placement uses eight ranks: all eight GPUs in one eight-GPU server versus four allocated GPUs on each of two servers, with idle physical GPUs shown. Rack placement uses eight ranks/two four-GPU nodes, same versus separate rack. Memory placement holds one illustrative buffer fixed while moving it between local HBM and host LPDDR; it must not imply automatic spill or uniform coherent-memory speed. Spark budgets explicitly illustrate software allocations sharing physical memory, with example overhead separate from hardware claims. Agents may propose a better experiment, but coordinate before changing the contract.

## Verification ledger

- Approved GB300 checkpoint: existing `npm run check` passes; browser evidence recorded in HANDOFF.
- Expansion source review: all three content modules independently cross-reviewed by Astra agents. No P1/P2 content findings. One Station figure-label clarification applied.
- Expansion invariant/route tests: npm run check now covers all forty lessons, all supported paths/lenses/scenarios, complete route round-trips, topology/rank/physical-GPU counts, canonical rates, asset presence and highlight bounds; passing.
- All 40 lesson screens checked at 1440 × 1000 and 390 × 844: no whole-page horizontal overflow, missing values, unloaded images or visible buttons below 44 px. Wide source figures deliberately scroll inside their own frames.
- All 87 keyboard-operated lens/path/scenario choices retained focus and updated pressed state. This covers all ten systems, including the approved pilot.
- All 40 detailed explorer maps checked at 390 px after lesson integration: no whole-page overflow, missing values or navigation-focus regression.
- Eight distinct new guided-figure dialogs loaded their local images and scope captions and closed with Escape. H200 shares the H100 figure; GB300 enlargement was covered in the pilot. Station’s sources dialog includes the new coherent-memory guidance.
- Spark’s split-budget route restored after reload and Back/Forward. Rubin’s selected lens restored after reload. The GB300 node 7 / GPU 3 explorer deep link still opens directly.
- Independent shared-renderer review found one P2: lesson exits could retain hidden explorer identity until reload. Lesson entry now always uses reference node 1 / GPU 0; browser reproduction confirms identical GPU exit URLs before and after reload. No other P1/P2 findings were reported.
- Representative rendered views inspected for server wiring, split-server ranks, GB200 peer/network paths, Rubin’s physical tray, GH200 addressing, Station memory locality and Spark capacity. Console warnings/errors were empty. Temporary viewport overrides reset.
- `npm run check` and `git diff --check` pass. Browser observations are saved in `artifacts/learning-qa.json`; screenshots include `h200-learning-overview.jpg`, `gb200-learning-diagram.jpg`, `b300-training-placement.jpg` and `spark-learning-budget.jpg`.
- These checks validate authored content, rendering and interaction behavior. They do not establish measured hardware throughput, optimal placement, scheduler behavior or exhaustive OEM/SKU coverage.

## Review corrections and retained limitations

- Cross-review: rack author reviewed server content; server author reviewed coherent-system content; coherent-system author reviewed rack content. All three groups passed without P1/P2 content findings. Station’s figure note was expanded to explain that the GPU’s generic PCIe host-interface capability does not replace its paired Grace C2C connection.
- The shared renderer uses canonical model rate/scope fields. Memory paths now explain published memory-interface conventions without referring to an explorer-only direction control. GH200 and Station explain why a C2C interface peak is not the bandwidth of a GPU read from CPU RAM.
- Source differences remain visible beside the figures: B300 datasheet vs hardware guide, Rubin current rates vs January diagrams, GH200 older HBM3 addressing illustration vs selected HBM3e SKU, and Station architecture maxima vs Desktop configuration. No unsupported reconciliation was invented.
- B200’s source diagram has limited native resolution; enlargement cannot add detail. No current Station system wiring diagram was found, so a clearly scoped NVIDIA silicon diagram accompanies the accurate logical memory map.
