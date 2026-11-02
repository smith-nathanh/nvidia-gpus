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
- After the code/architecture/UI review, the user explicitly authorized fixing the five findings and moving on to the other agreed architectures (November 1, 2026). Expansion is now approved; the earlier pilot-only gate has been satisfied.
- The user subsequently requested subagent reviews of every implemented architecture for accuracy and helpfulness. Findings and follow-up corrections are recorded in `docs/ARCHITECTURE_REVIEW.md`; these review outcomes are distinct from additional user scope decisions.
- Include **DGX Spark and DGX Station** in the eventual scope.
- The user requested visible NVIDIA links on the architecture pages, suggesting the bottom of each page. A system-specific official reading section now complements the existing source dialog and component citations.
- The user clarified the learning context: preparing to work with real-world distributed LLM training on GPU clusters, building on experience with a CPU-only Slurm cluster. Suggestions for training workflows and job-to-hardware mapping are educational priorities for discussion, not approval to implement every proposed feature.
- On November 2, 2026, the user asked for a layout/learning-experience review and a **one-system redesign on a new branch**, with greater use of NVIDIA diagrams. They felt the existing page presented many facts without building understanding. They authorized stopping the local server during this work. The GB300 visual lesson and eight-rank placement exercise were implementation choices for that prototype.
- The user then approved the GB300 redesign ("Nice I like this") and explicitly requested pushing it and redesigning **all nine remaining reference architectures** to the same quality. They authorized using Astra subagents for substantial portions and emphasized durable context across compactions. Preserve architecture-specific topology, real NVIDIA diagrams, a clear teaching sequence, and meaningful interactions. This authorizes the lesson expansion, not new hardware variants or hosted deployment.
- When told the repository had no remote, the user explicitly requested creating a **private GitHub repository** with the installed GitHub CLI. The destination is now [smith-nathanh/nvidia-gpus](https://github.com/smith-nathanh/nvidia-gpus).
- After reviewing the complete ten-system redesign, the user explicitly approved it as the new app and requested promoting all changes to `main` and pushing everything to GitHub (November 2, 2026).
- Another agent will pick up and refine the initial pilot. Provide enough persistent context that the new agent does not need this chat.

## Agreed architecture families

The app now implements ten selected reference configurations across these families. The user approved family-level expansion; the exact reference choices below are implementation choices, not separate user decisions or exhaustive variant coverage.

| Family | Intended scope | Current status |
| --- | --- | --- |
| Hopper: H100 / H200 | Main GPU/server architectures, including HGX/DGX-class systems and their network context | DGX H100 and DGX H200 eight-GPU SXM servers implemented |
| Grace Hopper: GH200 | Grace CPU–Hopper GPU composition and representative connected systems | Single GH200 HBM3e superchip implemented; server I/O marked deployment-specific |
| Blackwell: B200 / GB200 | Server-based and Grace-based/rack-scale systems; explain B versus GB naming | DGX B200 and DGX GB200 NVL72 tray/rack implemented |
| Blackwell Ultra: B300 / GB300 | Server-based and Grace-based/rack-scale systems | DGX B300 implemented; GB300 NVL72 Enterprise pilot refined |
| Rubin / Vera Rubin | Representative server and rack-scale architectures, with availability and specs checked when implemented | Vera Rubin NVL72 logical model implemented; current product rates distinguished from earlier architecture rates |
| DGX Spark | Personal AI system architecture and CPU/GPU/memory relationships | 128 GB GB10 reference implemented; shared physical LPDDR5X |
| DGX Station | Deskside AI system architecture and its relationship to larger data-center systems | GB300 Desktop Superchip implemented; one primary AI GPU, separate HBM and CPU LPDDR |

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

The refinement replaces shrinking SVGs with responsive HTML/CSS logical maps so component labels and hit areas remain readable. The system selector, reusable model, complete hardware-context bookmarks, and model-specific tours/path examples are implementation choices supporting the approved expansion.

## Scope decisions still open

- Additional variants within each family beyond the ten selected references, including GH200 NVL2/DGX GH200, NVL4, PCIe variants, and OEM-specific layouts.
- How eventual system-to-system comparison should work.
- The balance of logical diagrams, physical rack views, and hardware photographs.
- Whether later versions should add arbitrary endpoint path tracing, workload examples, or performance estimation. The pilot uses fixed illustrative paths and published peak figures.
- How much detailed chip microarchitecture to expose beyond the package/memory view.

The complete ten-system redesign is the approved app on the private repository’s `main` branch. Its development branch is `codex/all-architecture-lessons`; the earlier GB300 checkpoint remains on `codex/gb300-learning-redesign`. No hosted deployment, new user accounts, telemetry, or recurring automation was requested. The app itself remains local.
