# GB200 / Vera Rubin lesson expansion

Updated November 2, 2026. Owner: rack lesson subagent. Scope: `dist/lessons/racks.js`, `dist/assets/nvidia/racks/`, this file only. Shared renderer/state/tests/browser QA belong to root. No commit.

## Progress

- Read AGENTS, goals, handoff, learning contract, approved GB300 lesson/CSS and current model constraints.
- Rechecked NVIDIA GB200 hardware, networking, SuperPOD, product and architecture pages; Rubin product and January architecture article; NVIDIA Slurm scheduling and NCCL collective references.
- Downloaded and visually inspected unmodified local GB200 tray and four-rack front diagram, Rubin tray and superchip. Asset provenance follows below. Completed architecture-specific four-step lessons for both systems in `dist/lessons/racks.js`.
- No contract change proposed. GB200 figure includes NVLink fanout (unlike pilot); Rubin physical figure cannot support port-wiring assertions.

## Primary evidence

- [DGX GB hardware](https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html): compute tray runs an OS; 18 trays with 2 CPUs/4 GPUs each; 9 switch trays each containing 2 ASICs; GB200 four ConnectX-7 and two BF3. Guide now covers GB200 and GB300 in tabs; use correct tab assets.
- [GB200 product](https://www.nvidia.com/en-us/data-center/gb200-nvl72/): 372 GB HBM and 16 TB/s per superchip; 186 GB/GPU is division, not separately published. Keep chosen model, not architecture maximum.
- [GB200 architecture](https://developer.nvidia.com/blog/nvidia-gb200-nvl72-delivers-trillion-parameter-llm-training-and-real-time-inference/): C2C group budget, rack-scale domain.
- [GB200 SuperPOD components](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/dgx-superpod-components.html) and [network fabrics](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/network-fabrics.html): separate NVLink, compute, storage/management tiers. This DGX compute fabric is InfiniBand, so lesson does not imply the model's generic Ethernet alternative is this exact SuperPOD BOM.
- [DGX GB networking](https://docs.nvidia.com/dgx/dgxgb200-user-guide/networking.html): ConnectX-7 computenet, BF3 storagenet/dgxnet, separate BMC management.
- [Rubin current product](https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/): 72 GPUs, 36 Vera CPUs; 288 GB HBM4 and 19.2 TB/s per GPU, 3 TB/s NVLink per GPU, 1.8 TB/s C2C per superchip, up to 1.5 TB LPDDR5X per CPU. Current product 0.45 TB/s bidirectional per-GPU networking is not the same scope as architecture 1.6 Tb/s ConnectX-9 endpoint.
- [Rubin January architecture](https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/): 2 GPUs/1 CPU per superchip, 2 superchips per tray; NVLink6 scale-up, CX9 scale-out, BF4 infrastructure. Earlier 22 TB/s HBM and 3.6 TB/s NVLink differ from product table. Exact switch counts, internal die-link rate deliberately omitted from selected model.
- [NVIDIA Slurm topology scheduling](https://developer.nvidia.com/blog/unlock-exascale-performance-on-nvidia-gb200-nvl72-with-slurm-topology-aware-job-scheduling/): node and NVLink block locality; this is GB200/GB300-specific, not evidence for Rubin scheduler implementation.
- [NCCL collectives](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html): rank participation and AllReduce/AlltoAll semantics. Experiment is an illustrative mapping, not launch/configuration advice or performance estimation.

## Downloaded assets and visual interpretation

All © NVIDIA, unmodified originals downloaded November 2, 2026. App overlays are separate HTML outlines. No image generation or image editing.

| Local file (under dist/assets/nvidia/racks) | Original URL | Attribution | Inspected meaning |
| --- | --- | --- | --- |
| gb200-tray.png | https://docs.nvidia.com/dgx/dgxgb200-user-guide/_images/hardware-compute-tray-block-diagram.png | DGX GB Hardware, GB200 compute tray block diagram | CPU0/CPU1 in two gray groups; light-blue C2C down to GPUs0–3; pink CPU Clinks; four gold CX7 above; blue BF3 on each flank; NVMe green; GPU NVLink lines down through passive cartridge to all nine switch trays. PCIe upstream NIC path can include C2C access from GPU. Do not copy GB300 direct GPU-PCIe drawing. |
| gb200-racks.png | https://docs.nvidia.com/dgx/dgxgb200-user-guide/_images/hardware-rack-configuration.png | DGX GB Hardware, GB200 rack front view | Four separate NVL72 racks, not four parts of one domain. Counts on left are per rack; 10+8 compute trays, nine switch trays; top Ethernet is management. |
| rubin-tray.png | https://developer-blogs.nvidia.com/wp-content/uploads/2026/01/Figure-18.png | Inside Vera Rubin, Figure 18 | Physical view of two CPU/GPU boards at rear, NVLink spine rear edge; BlueField4 center; CX9 front sides. Actual current downloaded image says 4 TB fast memory (alt text in article says 2 TB; trust pixels for visual description). It prints older 14.4 TB/s NVLink for four-GPU tray. This is not the current product's 3 TB/s/GPU figure; explicit adjacent note required. |
| rubin-superchip.png | https://developer-blogs.nvidia.com/wp-content/uploads/2026/01/image9.png | Inside Vera Rubin, Figure 17 | Two separate Rubin GPU packages above Vera CPU, LPDDR SOCAMM alongside CPU, NVLink connectors top, PCIe midplane bottom. “2 TB Fast Memory” combines tiers; not 2 TB HBM or one uniform memory bank. Use the figure for composition, not peak compute claims. |

## Quality and uncertainty guardrails

- Model canonical rates remain unchanged; lesson paths obtain rate/scope/caveat from renderer/model, not copied fields.
- Rack placement fixed at 8 ranks, two full four-GPU trays. Same vs split rack changes GPU peer traffic tier; external compute network is a parallel GPU/NIC path, not an NVSwitch output.
- Rubin tray article supports physical composition, not a verified detailed OS/scheduler launch recipe. Avoid claiming its source proves a particular Slurm configuration.
- Exact per-link allocations, lane routing, NIC board counts for Rubin, switch counts and achieved performance are not inferred.
- Browser QA pending root. This agent does not use browser UI. Root notified that the Rubin source-difference note must appear next to the guided figure, not only in the enlargement dialog.


## Implementation and local validation completed

- `dist/lessons/racks.js` exports `lessons.gb200`, `lessons.rubin`, and four globally unique figures; no renderer/shared file changes and no commit.
- Each system has four narrative screens, three measured figure hotspots, four tensor destinations, and two states for an eight-rank/two-tray rack placement experiment. Rates remain in canonical models.
- GB200 remote path identifies C2C/host I/O to PCIe-attached CX7; CPU I/O participation does not imply CPU RAM staging. GB200 selected DGX compute fabric is InfiniBand.
- Rubin current product numbers remain the app's chosen scope. The original physical tray caption flags the older 14.4 TB/s tray NVLink figure. Current product also allows InfiniBand; article's Spectrum-X depiction is not presented as the only deployment choice.
- `node --check dist/lessons/racks.js` passed. A module validation checked four steps/titles/intros, four paths, all fixed lens keys, existing referenced assets, all hotspot rectangles inside 0–100%, no copied rate/scope fields, and rack-placement kind.
- All four local originals opened with image viewer. PNG signatures/dimensions checked: GB200 rack 2122×1458, GB200 tray 1579×1117, Rubin superchip 1232×726, Rubin tray 1630×780.
- Root owns `npm start`, final `npm run check` integration, browser reload, layout/interaction QA and shared renderer corrections.

## Scope decisions for future refinements

Rubin overview uses its actual superchip composition diagram beside the logical rack instead of importing the January NVLink switch-count diagram. This preserves the current model's deliberate omission of exact switch counts. The physical tray illustration supports locating hardware but cannot justify specific lanes, port fanout, or a CPU-to-NIC per-branch bandwidth allocation. No user decision is inferred from this presentation choice.


Asset SHA-256 (downloaded originals):

```text
a5b864013f560c2490bb68913720ecabe4978cc414dde825977c9954dd278074  gb200-racks.png
66e398ad2df97cb459d8ed00763ad39b534f3ef1b41661f761c9d605c7374393  gb200-tray.png
2e0887f5e0896b7dda46e86513a82b9a414fecc6d492ad6279b51a6612c773fe  rubin-superchip.png
f6cbd4920481e3df4222cacc826f502b50918115300cc5bb23b71bc819715525  rubin-tray.png
```
