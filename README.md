# NVIDIA Systems Explorer

A locally launched architecture explorer. The first pilot covers **GB300 NVL72**.

For another agent picking up this project, start with [project goals and agreed architecture coverage](docs/PROJECT_GOALS.md), then read the [implementation handoff](HANDOFF.md). [AGENTS.md](AGENTS.md) contains repository working notes.

## Run

Requires Node.js 18 or later. There are no packages to install.

```sh
npm start
```

Open http://127.0.0.1:4173. Set `PORT` if you need a different port. Stop the server with Ctrl+C.

## Explore

- **Rack:** 18 compute nodes and nine NVLink switch trays; click a compute tray to drill into that node.
- **Node:** two GB300 superchips, four GPUs, two Grace CPUs, NICs, and local storage.
- **GPU:** two compute dies, eight HBM3e stacks, and distinct CPU/GPU interfaces.
- **Between racks:** separate NVLink domains connected over an external compute network.
- Select a component for its explanation and primary sources. The four data-path examples change the view and explain bandwidth scope and direction.
- Use diagram zoom, the bandwidth convention toggle, guided tour, and research/specification dialogs for more context.
- Keyboard: Tab to components, Enter/Space to inspect; arrow keys move between data-path tabs. Escape closes dialogs.

## Research conventions

This is a logical teaching schematic, not an exact rack elevation or port-level cabling plan. It follows NVIDIA's Enterprise reference node (one BlueField-3 DPU) and explains the differences from the DGX peripheral configuration. Cluster networking is illustrative. GPU capacity uses the **288 GB architecture maximum**; publications also quote 279 GB for particular configurations, and NVIDIA rounds rack HBM to about 20 TB. These distinctions are explained in the app.

Bandwidth figures are published peaks, not measured workload results. NVLink is shared across peer transfers. Aggregated memory across GPUs is distributed, not one uniform pool. HBM bandwidth is not doubled when selecting send + receive.

Source URLs and component data are in `dist/data.js`, checked November 1, 2026. Rendering and interaction are in `dist/app.js`; no external scripts, fonts, or services are needed to run the app offline after startup. Source links require internet access.

## Check

```sh
npm run check
```

Checks JavaScript syntax and important architecture, unit-conversion, and source-reference invariants.

## Agreed future coverage

H100/H200; Grace Hopper/GH200; B200/GB200; B300/GB300; Rubin/Vera Rubin; DGX Spark; DGX Station. Only GB300 NVL72 is implemented in the pilot.
