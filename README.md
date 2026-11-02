# NVIDIA Systems Explorer

A local, source-backed interactive guide to NVIDIA system architecture: memory → CPU/GPU grouping → server → rack/domain → external network.

Ten reference configurations are included: **DGX H100, DGX H200, GH200, DGX B200, GB200 NVL72, DGX B300, GB300 NVL72, Vera Rubin NVL72, DGX Spark, and DGX Station.**

Read [the project goals](docs/PROJECT_GOALS.md), then [the implementation handoff](HANDOFF.md) for scope, source conventions and verification details. [The architecture review](docs/ARCHITECTURE_REVIEW.md) records the independent reviews of all ten references and their corrections. [AGENTS.md](AGENTS.md) records repository working instructions.

## Run

Requires Node.js 18+. No dependencies to install and no build step.

```sh
npm start
```

Open [the local app](http://127.0.0.1:4173/). Use `PORT=4174 npm start` for another port. Reload after edits: there is no hot reload. **`dist/` is editable source**, not generated output.

## Explore

Choose a reference system, then move between system/rack context, a compute node, a GPU and its memory, and connections between systems. Click a component for explanations, scoped facts and primary sources. Arrow-marked cards drill down.

Rack-scale systems expose numbered compute nodes. GPU drill-down retains the node, superchip and GPU identity. Full hash bookmarks and browser Back/Forward preserve that context. Legacy pilot links still work.

Each system has a guided tour and relevant communication examples. Single-GPU configurations omit the local peer-GPU example. Use One direction / Send + receive to inspect interface conventions; local HBM and shared-memory bandwidth retain their published value. Component maps reflow in narrow panels and can be zoomed.

Keyboard: Tab to native controls; Enter/Space to activate; arrow keys/Home/End switch data-path tabs; Escape closes dialogs.

## Reference conventions

These are selected configurations, not every variant. The model distinguishes x86 GPU servers, Grace/Vera rack systems, a single GH200 HBM3e superchip, Spark’s shared physical LPDDR5X, and Station’s one-GPU Desktop Superchip. CPU-to-CPU, CPU-to-GPU, local-memory, peer-GPU and scale-out connections have different roles.

Primary links and source disagreements are available per system. Examples include B300 hardware-guide versus product-page memory totals and Rubin’s current product rates versus earlier architecture figures. Published peaks are not measured performance, and logical maps are not exact port/cabling plans.

No external scripts, fonts, APIs or accounts are needed to run the app. Source links require internet access.

## Check

```sh
npm run check
```

Checks syntax, ten reference fixtures, all forty map outputs, source/action references, host links, GPU inventories, route identity and bandwidth conventions. Browser checks remain necessary for layout, focus, history and interaction behavior.
