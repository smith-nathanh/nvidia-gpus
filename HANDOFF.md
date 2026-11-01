# Agent handoff: NVIDIA Systems Explorer

Prepared November 1, 2026. Read [the project goals](docs/PROJECT_GOALS.md) first for confirmed user intent and the agreed architecture roadmap.

## Immediate assignment

Refine the existing **GB300 NVL72 pilot** with the user. The user wants one architecture done well before building the whole lineup. Preserve the ability to understand an individual GPU, its CPU–GPU grouping, a node, the NVL72 rack/domain, and communication between racks.

The user's latest request was to put the project under Git and record a handoff for another agent. The repo is local; no remote or hosted deployment was requested.

## Start here

```sh
cd /Users/nate/proj/nvidia-gpus
npm run check
npm start
```

- Node.js 18+; no dependency installation or build required.
- Open [the local app](http://127.0.0.1:4173/). The existing browser was last on `/#rack`.
- A local server was launched during the original work. Its lifetime is session-dependent. If port 4173 is already occupied, check whether the app is already running before starting a second server; alternatively use `PORT=4174 npm start`.
- The server binds only to `127.0.0.1`. Environments that restrict listening on a local port may require their normal execution approval.
- Reload after source edits; there is no hot reload.

## Current product

The app has four scale views:

| View | What it shows | Main interaction |
| --- | --- | --- |
| Rack | 18 compute nodes, nine NVLink switch trays, and a logical 72-GPU NVLink domain | Click a tray to open that numbered node; inspect switches and rack infrastructure |
| Node | Two GB300 superchips, each with one Grace CPU and two Blackwell Ultra GPUs; CPU memory, C2C, NICs, DPU, storage | Inspect a superchip header, CPU, interface, or peripheral; click a GPU to enter the package view |
| GPU | Two compute dies, eight HBM3e stacks, NV-HBI, and interfaces toward Grace and peer GPUs | Select memory, dies, or an interface for an explanation |
| Between racks | Two distinct NVL72 domains connected via compute NICs and an external network | Inspect the scale-out network and understand why adding a rack does not automatically extend the NVLink domain |

Other working features:

- Component inspector with explanations, facts, learning notes, and per-component source links.
- Breadcrumbs and scale navigation, with hash routes `#rack`, `#node`, `#gpu`, and `#cluster`.
- Four fixed example paths: peer GPUs in one rack, GPUs across racks, CPU to paired GPUs, and local HBM to GPU.
- Direction toggle for per-direction versus send-plus-receive figures; HBM's published memory bandwidth is deliberately not doubled.
- Link-label toggle, 100–200% diagram zoom, and reset.
- Five-step guided tour and dialogs for research sources, planned coverage, and specification conventions.
- Keyboard-accessible diagram components and arrow-key navigation between path tabs; reduced-motion styling.
- Small-screen layouts with diagram scrolling and a return link from the inspector to the diagram.

The current appearance is a design proposal, not a completed user review. `artifacts/gb300-pilot.png` is the captured desktop preview; it is illustrative documentation, not an automated visual-regression baseline.

## Implementation map

| File | Responsibility |
| --- | --- |
| `dist/index.html` | Page shell, navigation containers, toolbar, trace controls, dialog |
| `dist/data.js` | `sources`, `system`, `views`, `components`, and `traces` exports |
| `dist/app.js` | Inline SVG diagram generation, rendering, component selection, tour, dialogs, zoom, hash handling, and events |
| `dist/style.css` | Visual design, SVG classes, responsive layouts, and reduced motion |
| `server.mjs` | Dependency-free static HTTP server with path containment and content types |
| `scripts/check-data.mjs` | Architecture counts, bandwidth conversions, and source/navigation-reference invariants |
| `package.json` | `start` and `check` commands; ES modules |

**`dist/` is the editable source.** There is no separate `src/` directory or generation step. Do not delete it as disposable build output.

The app is vanilla HTML/CSS/JavaScript and SVG. There is no framework, backend data store, external font/script dependency, or live data API. Research facts are embedded. External source links require internet access; the app itself does not fetch them on startup.

## Research model and accuracy constraints

The pilot follows NVIDIA's **Enterprise reference node** for peripherals, rather than claiming to reproduce every DGX/OEM layout. It deliberately calls out configuration differences.

Current teaching model, as recorded in the implementation:

- One GB300 superchip: one Grace CPU plus two Blackwell Ultra GPUs.
- One node/compute tray: two such superchips, four GPUs, and two CPUs.
- One illustrated rack/domain: 18 nodes, 72 GPUs, and 36 CPUs.
- Nine switch trays contain two NVSwitch ASICs each. Every GPU connects through 18 NVLink links, one to each switch ASIC.
- Each logical GPU contains two compute dies. Do not confuse dies, GPUs, superchips, and nodes.
- Per-GPU NVLink: 1,800 GB/s bidirectional, or 900 GB/s each way, shared across peer transfers. The roughly 130 TB/s rack aggregate sums GPU send/receive interface budgets; it is not a dedicated link speed between any two GPUs.
- CPU–GPU C2C uses the published 900 GB/s bidirectional interface figure. The diagram groups its branches schematically; revisit the exact shared/interface interpretation against primary documentation before adding a port-level model or performance calculator.
- Compute networking: 800 Gb/s per GPU corresponds to 100 GB/s per direction before overhead. Do not confuse bits with bytes or present a line-rate ceiling as measured workload performance.
- HBM: the diagram uses a 288 GB architecture maximum and up to 8 TB/s local bandwidth. Other product/configuration documents quote 279 GB, while NVIDIA rounds rack HBM to about 20 TB. The app explains that these are different reported values, not a guarantee of allocatable capacity. Avoid inventing a cause for the difference without evidence.
- The chosen Enterprise node has one BlueField-3; the DGX hardware guide lists two per tray. The app explains this difference. Storage and power details also vary.
- Coherent or aggregate memory does not imply one physically uniform pool with identical local and remote access costs.
- The external compute fabric can use InfiniBand or Ethernet. The cluster diagram is an illustrative path, not an exact port map or network bill of materials.

Hardware specs and product availability change. Sources were checked during the original work on November 1, 2026; re-check the relevant primary sources when changing claims.

### Primary sources already embedded in the app

The `sources` object is the main link registry. Key starting points:

- [NVIDIA Enterprise NVL72 components](https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html)
- [NVIDIA Enterprise networking hardware](https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/networking-hardware.html)
- [NVIDIA Enterprise network topology](https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/network-logical-architecture.html)
- [NVIDIA Enterprise overview](https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/overview.html)
- [DGX GB rack hardware guide](https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html)
- [Inside NVIDIA Blackwell Ultra](https://developer.nvidia.com/blog/inside-nvidia-blackwell-ultra-the-chip-powering-the-ai-factory-era)
- [GB300 NVL72 product specifications](https://www.nvidia.com/en-us/data-center/gb300-nvl72/)
- [Blackwell Ultra datasheet](https://resources.nvidia.com/en-us-blackwell-architecture/blackwell-ultra-datasheet)
- [Azure ND GB300 v6 deployment example](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nd-gb300-v6-series)

The user also asked which hardware hyperscalers use. Earlier research found public B200/GB200 and B300/GB300 offerings and deployments. It did **not** establish a fleet-share majority for any model. That conversation informed the GB300 pilot selection; no cloud-provider comparison feature has been implemented.

## Verification already performed

### Automated

`npm run check` passed, including a fresh run during this handoff. It checks JavaScript syntax and data invariants, not browser rendering or real hardware performance.

The app previously returned HTTP 200 from the local server.

### Manual browser checks during pilot implementation

- Opened a numbered tray (node 07), then individual GPU details.
- Checked superchip-header selection; corrected an overlapping SVG hit target that had selected the CPU instead.
- Checked cross-rack trace and send-plus-receive conversion to 200 GB/s; HBM remained at the published 8 TB/s.
- Checked trace keyboard navigation, link-label toggle, source dialog, specification dialog, and Escape to close.
- Walked the guided tour, checked zoom, and checked mobile inspector/return navigation.
- Inspected desktop and small-screen layouts. Horizontal diagram scrolling is intentional; no whole-page overflow was observed in those checks.
- The browser console reported no warnings/errors in the checked interactions.

This was a manual QA pass, not a complete accessibility audit or a committed end-to-end test suite. The source count increased from eight to nine after adding the datasheet reference. The most recent screenshot is saved under `artifacts/`.

## Suggested refinement priorities

These are recommendations from the first agent, not additional user requirements:

1. Review the live pilot with the user. Confirm whether the scale transitions, terminology, and diagram detail answer their questions before adding systems.
2. Improve readability and interaction discoverability in the narrow in-app browser panel. Some diagram labels are small until zoomed; check contrast and keyboard/focus behavior more thoroughly.
3. Make the relation between the selected GPU, its superchip, its node, and its rack even clearer. Currently the node number is retained, but clicking GPU 0/1/2/3 opens a generic GPU view without retaining that GPU's index.
4. Consider a clearer visual emphasis on the selected example path. Current SVGs use animated wires and a component inspector; they do not implement arbitrary endpoint selection or precise measured routing.
5. Revisit the C2C schematic and all capacity/source differences before introducing calculated performance claims.
6. If expanding the model, consolidate repeated facts: some counts and diagram strings are hardcoded in `app.js` and HTML in addition to `data.js`. The current invariants do not catch every possible rendering/data mismatch.
7. The CSS is intentionally a compact first pass with late overrides. A cleanup could make further design work easier while preserving current responsive behavior.
8. After the pilot is accepted, design a reusable system/configuration model and comparisons before duplicating diagrams for the rest of the roadmap.

Do not turn these suggestions into an unsolicited large rewrite. The next useful step is to refine the learning experience and resolve the user's feedback.

## Git handoff

The intended baseline is a local `main` branch containing the pilot, its preview, and this documentation. See `git log -1` and `git status` for the actual commit and working-tree state. No remote has been configured as part of this handoff; do not assume GitHub publication is authorized.
