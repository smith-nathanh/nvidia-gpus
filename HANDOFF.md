# Agent handoff: NVIDIA Systems Explorer

Updated November 2, 2026. Read [the project goals](docs/PROJECT_GOALS.md) first for user decisions and scope. This file records implementation choices and current status.

## All ten visual lessons · November 2

The user approved the GB300 visual redesign, requested the same caliber for all nine other references, and authorized creating a private GitHub repository. The approved checkpoint is `55300b3`, pushed to `main` and `codex/gb300-learning-redesign` at [smith-nathanh/nvidia-gpus](https://github.com/smith-nathanh/nvidia-gpus). The completed expansion is on `codex/all-architecture-lessons`; `main` retains the approved checkpoint for comparison. Check Git for the current expansion commit/push state.

**Every system now opens a four-part lesson.** Each starts with the boundary the reader needs to understand, guides them through actual NVIDIA material, distinguishes data paths, then changes a concrete workload example. All forty detailed explorer maps remain available through the sidebar and existing bookmarks. Lesson URLs preserve step, figure highlight, destination and scenario; entering a lesson consistently resets physical explorer identity to node 1 / GPU 0, including after reload.

The lessons preserve different architectures:

- **H100, H200, B200 and B300:** one eight-GPU server is one NVLink domain. An eight-rank job can fill one server or allocate four GPUs in each of two physical eight-GPU servers; unused GPUs stay visible. NVIDIA’s wiring separates peer fabric, host PCIe, compute NICs and storage.
- **GB200 and Rubin:** two four-GPU compute nodes can share a rack fabric or communicate across separate rack domains. GB200’s C2C/CPU-I/O-to-PCIe NIC path is distinct from the GB300 pilot. Rubin uses its actual physical tray/composition figures while preserving current product rates and omitting unverified switch counts.
- **GH200 and Station:** one CPU and one primary GPU coherently access two distinct physical memory tiers. A fixed example buffer changes location, not size. Station’s optional RTX GPU is outside this reference.
- **Spark:** CPU and GPU share one physical LPDDR5X pool. Increasing the example GPU allocation reduces the capacity left for CPU work and other software. The lesson explains the CPU/GPU tiles using the official GB10 whitepaper.

Three Astra agents authored bounded content groups and cross-reviewed each other’s work against primary sources. Root integrated the shared renderer, inspected the visual results and completed browser QA. Source records: [servers](docs/research/servers.md), [racks](docs/research/racks.md), [coherent systems](docs/research/coherent.md). [The expansion record](docs/LEARNING_REDESIGN_PLAN.md) contains the content contract, review outcomes and verification ledger.

Ten additional local NVIDIA figures support the expansion; the original three remain. Visible captions and source dialogs preserve caveats: the older GH200 image teaches addressing rather than the selected HBM3e SKU; Station uses an explicitly architecture-level GPU image; Rubin’s January figure contains earlier rates; B300 publications still disagree on memory. B200’s original topology image has limited resolution. No hardware rates were changed during the lesson expansion; GH200/Station host-path wording now makes the difference between C2C peak and memory-read throughput explicit.

Integrated validation covers all forty lesson screens at 1440 and 390 px, all forty detailed maps at 390 px, 87 keyboard-operated lesson choices, loaded/enlarged source figures, history and bookmark restoration. No whole-page overflow, missing values, undersized visible buttons or focus regressions were found in these checks. Automated invariants cover topology, rank counts, memory arithmetic, all lesson variants, assets and route round-trips. These checks do not establish achieved hardware performance. Screenshots: `artifacts/h200-learning-overview.jpg`, `artifacts/b300-training-placement.jpg`, `artifacts/spark-learning-budget.jpg`, and `artifacts/gb200-learning-diagram.jpg`.

## Approved GB300 prototype history · November 2

The user asked for one redesigned system on a branch, explaining that the old layout felt like a collection of facts without producing understanding. The pilot used `codex/gb300-learning-redesign` and preserved the existing expansion/review work. That complete approved baseline was subsequently committed as `55300b3` and pushed before the lesson expansion.

GB300 defaults to a four-part visual lesson at [the learning route](http://127.0.0.1:4173/#gb300/learn?step=0). The opening idea distinguishes **18 server/OS boundaries from one 72-GPU NVLink domain**. At this checkpoint the other systems retained their existing explorer; the expansion above adds their lessons. Complete old explorer bookmarks continue to open their original view, and the sidebar switches between lesson and detailed explorer.

The design assessment: the original interface gave counts, scale navigation, component inspection, trace controls, and specification notes similar visual weight. It expected the reader to assemble the hierarchy themselves. This prototype gives each screen one explanatory question, a primary visual, a takeaway, and an explicit next step:

1. Rack overview: a simplified node/fabric relationship beside NVIDIA’s annotated physical rack.
2. Inside a server: three guided highlights over NVIDIA’s actual tray wiring, plus an optional GPU silicon figure. The lesson explicitly explains that the tray I/O drawing omits rack-wide GPU peer NVLink.
3. Data paths: select local HBM, paired CPU memory, another node in the rack, or another rack. The route, explanation, bandwidth direction, and scope change together.
4. Training placement: move an illustrative two-node/eight-rank allocation within one rack or across two racks. GPU count stays fixed while the inter-node path changes. This is an educational example, not a Slurm simulation, launch recipe, or performance prediction.

New files: `dist/learning.js` (lesson content/diagrams), `dist/learning.css` (scoped presentation), `dist/assets/nvidia/` (three unmodified, attributed NVIDIA originals), and `scripts/check-learning.mjs`. `dist/navigation.js` stores lesson, diagram highlight, data destination, and placement in learning URLs. `dist/app.js` handles mode switching and accessible interactions. The static server now serves PNG/WebP with image MIME types. No dependencies or build step were added.

NVIDIA sources were rechecked November 2. Asset provenance is in `dist/assets/nvidia/README.md`. The scheduling reference discusses GB200 and explicitly gives four GPUs per node for both GB200 and GB300; only the shared placement principle is used. Existing memory/SKU caveats remain in the model notes; none of the other hardware models were revised.

Verification: `npm run check` passes, including existing ten-model/forty-map checks and new lesson route/rank/asset invariants. Browser checks covered all four lessons at 390 px, the 586 px app panel, and desktop at 1440 px; no whole-page horizontal overflow was found. The wide NVIDIA tray diagram deliberately scrolls within its own frame on narrow screens. All four destination choices, three diagram highlights, eight-rank placements, reload/Back/Forward restoration, image expansion/Escape, and all ten system selections were exercised. No console warnings/errors were observed. These checks validate the UI and model consistency, not achieved hardware performance. The user approved this prototype and requested the same quality of redesign for all nine remaining architectures. The approved state was checkpointed as `55300b3` before expansion. Screenshot: `artifacts/gb300-learning-overview.jpg`. The local server was restarted on port 4173 to load the image MIME types.

## Latest authorization and status

The user asked for an architecture/code/UI review of the GB300 pilot, authorized the fixes and family expansion, then requested subagent reviews of all architectures. Three reviewers covered all ten references and rechecked targeted corrections. See [the architecture review](docs/ARCHITECTURE_REVIEW.md) for findings, source evidence and resolution status. The user has not separately approved every variant choice or visual detail.

The target remains a local app. The user requested a Git push and creation of a private repository; the remote is now configured. No hosted deployment, new user accounts, telemetry or automation was requested.

## Run and check

```sh
cd /Users/nate/proj/nvidia-gpus
npm start
npm run check
```

Open [the local app](http://127.0.0.1:4173/). Node 18+; no dependencies, installation, build or hot reload. **`dist/` is hand-authored, tracked source.** Reload after edits.

An existing server may already occupy port 4173. Verify the app there rather than stopping an unrelated process or starting a duplicate. `PORT=4174 npm start` is an alternative. The server binds only to `127.0.0.1`; local sandbox policy may require the normal execution approval.

## Current coverage

| Selector | Reference configuration | Local GPU domain / memory model |
| --- | --- | --- |
| GB300 NVL72 | NVIDIA Enterprise reference node; 18 trays, 4 GPUs and 2 Grace CPUs per tray | 72-GPU NVLink 5; 288 GB HBM3e architecture maximum per GPU |
| DGX H100 | Eight H100 SXM GPUs, two Xeon 8480C CPUs | 8-GPU NVLink 4; 80 GB HBM3 per GPU |
| DGX H200 | Eight H200 SXM GPUs, two Xeon 8480C CPUs | 8-GPU NVLink 4; 141 GB HBM3e per GPU |
| GH200 | Single HBM3e superchip, one Grace CPU and one Hopper GPU | 144 GB HBM3e + up to 480 GB CPU LPDDR; illustrative server I/O |
| DGX B200 | Eight B200 GPUs, two Xeon 8570 CPUs | 8-GPU NVLink 5; 180 GB per GPU from DGX’s 1,440 GB total |
| GB200 NVL72 | DGX GB200 tray peripherals and GB200 product memory reporting | 72-GPU NVLink 5; 186 GB per GPU derived from 372 GB per pair |
| DGX B300 | NVIDIA DGX datasheet memory totals, two Xeon 6776P CPUs | 8-GPU NVLink 5; 2.1 TB / 62 TB/s system HBM totals; individual values unspecified |
| Vera Rubin NVL72 | Architecture-level tray composition with current product-table rates | 72-GPU NVLink 6; 288 GB HBM4, 19.2 TB/s HBM and 3 TB/s bidirectional NVLink per GPU |
| DGX Spark | 128 GB NVIDIA GB10 reference | One GPU + one 20-core Arm CPU share physical LPDDR5X; no HBM |
| DGX Station | GB300 Desktop Superchip, primary AI GPU only | One Grace CPU + one GPU; 252 GB HBM3e + 496 GB LPDDR5X |

These are selected configurations, not all SKUs. GH200 NVL2/DGX GH200, NVL4, PCIe Hopper variants, 64 GB Spark, optional Station RTX PRO, and other OEM layouts are not implemented.

## The five review fixes

1. **CPU-to-CPU connection:** dual-host nodes now show a separate inspectable host interconnect. The GB300 CLinks explanation cites [Enterprise Figure 3](https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/_images/nvl72-ai-factory-03.png), separately from CPU–GPU C2C and GPU peer NVLink.
2. **Readable maps and targets:** responsive HTML/CSS maps replace the SVGs that had shrunk subtitles to about 6 pixels and rack targets to about 7 pixels. Map subtitles now use 14 px; tray subtitles use 13 px. Interactive map controls have at least 44 px height. Container queries reflow groups and GPU grids; zoom remains available.
3. **Focus preservation:** scale navigation and tour controls have stable IDs; map controls have stable focus keys. Keyboard Enter retains focus on the replacement navigation/tour control. Drill-down deliberately focuses the new view heading. Narrow-screen pointer inspection moves to the inspector; a return button restores diagram focus.
4. **GPU identity:** state, breadcrumbs, package heading and inspector retain node, superchip and local GPU index. GPU indices are local to a node (0–3 for NVL72 trays; 0–7 for DGX servers).
5. **History:** explicit navigation pushes complete hash routes. Back/Forward restores system, scale, node, GPU, selected component and path. Initial route normalization uses replacement. Legacy `#rack`, `#node`, `#gpu` and `#cluster` links still open the GB300 pilot.

## User experience

- A visible “Read more at NVIDIA” section below the data paths follows the selected system, with two or three official product/hardware/architecture entry points, evidence descriptions, and buttons for the complete sources and configuration notes. Links reuse the existing evidence registry; `readingSources` in `dist/models.js` selects the entry points. Browser checks confirmed updates across all ten selectors and the full-source dialog; `npm run check` passes.
- A native selector groups ten systems by architecture family. Architecture Guide also lists and opens each reference.
- Four views: system/rack context, inside a node/system, GPU and memory, and between systems/racks. Server and desktop references do not inherit the pilot’s 18-node rack topology.
- Model-specific component inspectors, source lists, specification notes and five-step tours.
- Three or four fixed data-path examples. Single-primary-GPU systems omit the local peer-GPU example.
- Per-direction and send-plus-receive conventions; published HBM/shared-memory bandwidth is not doubled.
- Rack maps expose all numbered nodes with readable buttons. Node maps distinguish host access, GPU peer fabric, and a parallel NIC/I/O path.
- Maps show logical relationships, not physical floorplans, exact PCIe lanes, switch-port wiring or network bills of materials.
- Desktop inspectors stay visible while scrolling a long map. Narrow layouts place details below the map.
- No arbitrary endpoint routing or measured-performance calculator. No side-by-side comparison tool; the guide is coverage navigation.

## Code map

| File | Responsibility |
| --- | --- |
| `dist/index.html` | Shell, selector, navigation, workbench, inspector, trace controls, dialog |
| `dist/models.js` | Ten configuration specs, extended source registry, unit formatting, and model-specific components/views/traces |
| `dist/data.js` | Original pilot’s curated explanations, sources and invariants; reused by the GB300 adapter |
| `dist/diagrams.js` | Responsive logical maps for all configurations and four scales; native buttons |
| `dist/navigation.js` | Complete hash-route serialization/parsing and legacy route compatibility |
| `dist/app.js` | State normalization, rendering, navigation/history, focus, tours, dialogs, zoom and events |
| `dist/learning.js` | Shared lesson renderer, topology-specific visuals, experiments, figure registry and source dialogs |
| `dist/lessons/gb300.js` | Approved GB300 lesson preserved from the pilot |
| `dist/lessons/{servers,racks,coherent}.js` | Nine architecture-specific lesson narratives, guided figures, paths and workload examples |
| `dist/learning.css` | Visual lesson layouts, teaching figures, responsive diagrams and examples |
| `dist/assets/nvidia/` | Attributed local NVIDIA figures and provenance records |
| `dist/style.css` | Readable light/green schematic design, semantic component colors, container queries, responsive shell |
| `scripts/check-data.mjs` | Original pilot architecture/unit/source invariants |
| `scripts/check-models.mjs` | Ten reference fixtures, all forty map outputs, component/source/action targets, CPU-link presence, GPU inventory, route identity and memory conventions |
| `scripts/check-learning.mjs` | Forty lessons and their variants, sources/assets/highlights, routes, rank inventories and memory examples |
| `server.mjs` | Dependency-free local static server with path containment |

Sources are embedded and the app does not fetch external content on startup. Internet is needed only to follow source links. All configuration facts must retain primary-source evidence.

## Hardware reporting constraints

- One GPU may contain two compute dies. Do not multiply CUDA-visible GPU counts by die count.
- H100/H200 and B200/B300 DGX servers use x86 hosts and PCIe; GB200/GB300 NVL72 use Grace-based CPU–GPU superchips.
- Each GB200/GB300 rack has 18 compute nodes, 72 GPUs, 36 CPUs, and 9 switch trays × 2 ASICs. Do not inherit the switch count or per-port layout into Rubin; exact Rubin switch counts and die-link rate are deliberately omitted.
- Per-GPU NVLink figures are shared interface budgets. Aggregating them across a domain is not a pairwise speed or a uniformly accessible memory pool.
- CPU–GPU C2C is presented as a published interface/group budget. Exact per-branch allocation is still outside the teaching model; do not turn the schematic into a port-level performance model without further evidence.
- PCIe host figures describe the selected ×16 host-interface ceiling, not end-to-end RAM-to-GPU throughput or a complete switch-lane allocation.
- Compute NIC line rates are converted from bits to bytes before overhead. Station’s 800 Gb/s is an aggregate over two 400 Gb/s ports. GH200 server networking has no invented nominal rate.
- GB300: 288 GB architecture maximum, 279 GB in other product publications, about 20 TB rounded rack HBM. Do not invent an explanation for the differences.
- B200: 180 GB follows the DGX reported 1,440 GB total, rather than substituting 192 GB architecture memory.
- GB200: 186 GB is derived from the product table’s reported 372 GB per pair. Peripherals follow the DGX GB200 reference (ConnectX-7, two BlueField-3 devices per tray).
- B300: the selected DGX datasheet publishes 2.1 TB / 62 TB/s system HBM totals, without separate individual values. The hardware guide's 288 GB per GPU and the HGX datasheet's 270 GB / 7.7 TB/s row have different scopes. Do not assign the HGX figures or a generic Ultra 8 TB/s rate to the selected DGX configuration. The source conflict remains explicitly unresolved.
- Rubin: current product table gives 19.2 TB/s HBM and 3 TB/s NVLink per GPU. The January architecture article gives earlier 22 TB/s and 3.6 TB/s values. The map uses current product rates and records the difference. Its ConnectX-9 1.6 Tb/s endpoint figure has a different scope from the product table’s networking aggregate.
- Spark: shared LPDDR5X capacity and bandwidth are a single system budget. CPU/GPU tiles communicate coherently over C2C; its numerical rate is unspecified. Two external 200 Gb/s ports share SoC-facing I/O. The selected 200 Gb/s example is not labeled a full-adapter aggregate, and no 400 Gb/s host throughput is inferred.
- Station: the Desktop Superchip is 1 CPU + 1 primary GPU, whereas the NVL72 superchip is 1 CPU + 2 GPUs. Optional RTX PRO is excluded explicitly.
- Model source date: November 1, 2026; lesson sources rechecked November 2, 2026. Availability and specs should be rechecked when changing the model. In particular, Rubin is marked available based on the checked product page, not inferred from older launch schedules.

## Verification and remaining review

`npm run check` passes. It validates reference fixtures, syntax, all forty generated maps and route round-trips; it does not establish real hardware performance or replace browser QA.

Browser checks in this refinement verified:

- GB300 node 07 → GPU 3 with superchip 2 context; Back/Forward restored the visited node and GPU routes.
- Keyboard Enter on scale navigation retained focus; advancing the tour retained focus on Next.
- All ten systems could be selected. Node/GPU views showed the expected GPU counts, die counts and memory types, with no pilot rack/CPU assumptions leaking into servers or desktops.
- Narrow-panel map subtitles stayed at 14 px rather than shrinking, and inspected map controls had at least 44 px height.
- Memory bandwidth stayed unchanged in send-plus-receive mode; keyboard path navigation worked with three- and four-path models.
- Model-specific Station notes, dialog Escape behavior, and zoom containment were checked.
- All forty system/scale views were checked at 390 px width: no whole-page horizontal overflow, missing values, or map buttons below 44 px height. Representative views were also checked at 783, 1280 and 1440 px widths; temporary viewport overrides were reset.
- Reloading a complete GB300 node 07 / superchip 2 / GPU 3 bookmark retained its identity. B300 and Rubin source-difference notes and the architecture-guide system switch were checked in the browser.
- Checked console warnings/errors were empty.

Current screenshots: `artifacts/gb300-refined-desktop.jpg` and `artifacts/spark-mobile.jpg`. `gb300-pilot.png` is the older SVG design. Screenshots are illustrative, not automated regression baselines.

The subsequent subagent review corrected rack endpoint numbering and B300 source scopes, clarified personal-system port/tile relationships, and fixed shared tour-entry focus, inspector scrolling and misleading host-path highlighting. Review-era evidence and remaining suggestions are recorded in `docs/ARCHITECTURE_REVIEW.md`; `artifacts/b300-reviewed.jpg` shows the revised B300 memory presentation.

The user’s educational context is real-world distributed LLM training, with existing CPU-only Slurm experience. The visual lessons now implement fixed rank-placement and memory-budget/locality examples. A full Slurm launch workflow, training-step communication overlay, arbitrary parallelism planner, troubleshooting and checkpoint recovery remain suggestions for discussion, not implemented features or separately approved expansion.

Further useful work: have the user assess the broader learning experience, refine explanation depth and long-map navigation based on their feedback, then consider additional exact SKU variants and a real comparison interface. Do not silently add hosted deployment, benchmark predictions or unsupported port-level detail.

## Git

Private remote: `git@github.com:smith-nathanh/nvidia-gpus.git`. Default branch `main` and `codex/gb300-learning-redesign` hold approved checkpoint `55300b3`. Expansion branch: `codex/all-architecture-lessons`. Inspect `git status`, `git log` and remote tracking for its latest commit and push state. GitHub repository visibility was explicitly verified private. The app is still served locally; no hosted site was deployed.
