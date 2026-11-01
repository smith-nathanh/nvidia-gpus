# Project goals and agreed coverage

Recorded November 1, 2026. This document captures decisions from the user conversation; `HANDOFF.md` describes the current implementation.

## Purpose

Build a locally launched app/webpage that helps the user understand how NVIDIA's main GPU systems are architected, from an individual GPU and its memory through a CPU–GPU combination, a server/node, a rack, and connections between racks.

The user understands GPUs and LLMs already. The learning gap is how servers, racks, memory, switches, and networks fit together. Explain the relationships clearly, with technical detail available on demand.

## Confirmed user preferences

- Use an **interactive architecture map**: click components to drill down, inspect connections, and eventually compare systems.
- Prioritize how everything connects: **GPU memory → CPUs/GPUs → node/server or tray → rack → multiple racks**.
- Explain what names such as **GB300**, **node**, and **NVL72** actually refer to. The user explicitly requested both the individual GPU and the node/rack context.
- Research hardware architecture online, using NVIDIA documentation and other credible sources where useful.
- Discuss and agree on architecture coverage before implementing broadly.
- **Build one system first, refine it, then expand.** The user explicitly chose **GB300 NVL72** as the pilot.
- Include **DGX Spark and DGX Station** in the eventual scope.
- Another agent will pick up and refine the initial pilot. Provide enough persistent context that the new agent does not need this chat.

## Agreed architecture families

Only the GB300 NVL72 pilot currently exists. The table records eventual coverage; exact configurations within each family remain to be finalized.

| Family | Intended scope | Current status |
| --- | --- | --- |
| Hopper: H100 / H200 | Main GPU/server architectures, including HGX/DGX-class systems and their network context | Planned |
| Grace Hopper: GH200 | Grace CPU–Hopper GPU composition and representative connected systems | Planned |
| Blackwell: B200 / GB200 | Server-based and Grace-based/rack-scale systems; explain B versus GB naming | Planned |
| Blackwell Ultra: B300 / GB300 | Server-based and Grace-based/rack-scale systems | **GB300 NVL72 pilot implemented**; other configurations planned |
| Rubin / Vera Rubin | Representative server and rack-scale architectures, with availability and specs checked when implemented | Planned |
| DGX Spark | Personal AI system architecture and CPU/GPU/memory relationships | Planned |
| DGX Station | Deskside AI system architecture and its relationship to larger data-center systems | Planned |

CPUs, memory, NVLink/NVSwitch, compute NICs, storage/management networking, local storage, and relevant power/cooling infrastructure are supporting parts of these systems. The purpose is architectural understanding, not just a GPU specification table.

## Learning outcomes

A successful version should help the user answer questions such as:

1. What is one GPU, and how do its dies and HBM relate to it?
2. How does a GB300 superchip differ from an individual GPU or a compute node?
3. What does a node/tray contain, and how many nodes make the illustrated rack?
4. What is the NVL72 domain, and which GPUs communicate through its NVLink switches?
5. How do CPU–GPU, local-memory, peer-GPU, and cross-rack transfers use different paths?
6. Which bandwidth figures are per GPU, shared, per direction, or aggregated across a rack?
7. Which details change across hardware generations and vendor/reference configurations?

## Initial implementation choices, not separate user approvals

The first agent selected a light schematic/block-diagram style with a dark header, a scale-navigation sidebar, and a component inspector. It added a guided tour, four example data paths, zoom, source links, and specification notes.

These are a starting point for refinement. The user has not explicitly approved every aspect of the visual design or each interaction. The original reference was a screenshot of a GB200 node/rack diagram in [Open Athena's expert-parallelism article](https://openathena.ai/blog/expert-parallelism/); it served as inspiration for architectural detail, not a requirement to copy its exact presentation or deployment numbers.

## Scope decisions still open

- The full enumeration of variants within each agreed family, and the order of implementation after the pilot.
- How eventual system-to-system comparison should work.
- The balance of logical diagrams, physical rack views, and hardware photographs.
- Whether later versions should add arbitrary endpoint path tracing, workload examples, or performance estimation. The pilot uses fixed illustrative paths and published peak figures.
- How much detailed chip microarchitecture to expose beyond the package/memory view.

No request has been made for a hosted deployment, accounts, telemetry, recurring research automation, or a remote Git repository. The current delivery target is a local app.
