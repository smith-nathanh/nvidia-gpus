# GH200, DGX Spark and DGX Station source notes

Sources checked November 2, 2026.

## Teaching examples

- GH200: coherent access joins **two physically separate memory homes**. The experiment keeps a 100 GB illustrative GPU-read buffer constant while placing it in HBM versus Grace LPDDR5X. No automatic migration or timing is predicted.
- Spark: CPU and GPU share **one physical 128 GB pool**. The experiment uses disjoint example allocations: 24 GB CPU work + 80/104 GB GPU work + 8 GB other = 112/136 GB total. The 8 GB is explicitly an invented allowance, not a recommended OS reserve. Totals yield 16 GB remaining or 8 GB over capacity. No out-of-memory, swap or compression behavior is predicted.
- Station: **748 GB coherent capacity includes only 252 GB GPU-local HBM**. The experiment fixes a 200 GB buffer and changes its physical residency between HBM and Grace LPDDR5X. The guided silicon figure separately establishes two compute dies = one primary AI GPU.
- LLM connections discuss weight storage versus other allocations, frequently accessed state versus capacity, and the network boundary introduced by a second machine. Slurm connections are conceptual; no scheduler configuration or job submission recipe is implied.

## Primary evidence checked

### GH200

1. [GH200 datasheet, March 2025](https://dam-cdn.nvd.orangelogic.com/AssetLink/tkno03fa645gb7f33w60rf200d330420.pdf), pages 1 and 4: one Grace CPU/Hopper GPU; HBM3 versus HBM3e variants; selected 144 GB HBM3e / up to 4.9 TB/s; up to 480 GB LPDDR5X; 900 GB/s C2C total. GH200 NVL2 is a distinct two-superchip configuration. The datasheet has CPU-memory configuration-dependent rates; the lesson intentionally does not add an unneeded single CPU-memory rate.
2. [NVIDIA Grace Hopper Superchip Architecture In-Depth](https://developer.nvidia.com/blog/nvidia-grace-hopper-superchip-architecture-in-depth/), November 10, 2022: Figure 5 shows physical CPU/GPU memory and shared address translation; C2C coherency and 450 GB/s per direction. This is an **older HBM3-era diagram**, not evidence for current HBM3e capacities. The lesson explicitly labels the version difference.
3. Server network and I/O remain deployment-specific. The single-superchip reference has no local peer GPU and does not inherit the blog's larger NVLink-network examples.

Figure 5 illustrates address translation without the older Figure 2’s HBM3 capacities or external GPU domain.

### DGX Spark

1. [GB10 Superchip whitepaper, WP-12718-001_v02, April 2026](https://www.nvidia.com/content/dam/en-zz/Solutions/dgx-spark/nvidia-gb10-superchip-whitepaper.pdf): Figure 3 (printed page 4 / PDF page 8) maps CPU/system S-die, GPU G-die, C2C and memory controller; Figure 4 (printed page 5 / PDF page 9) shows LPDDR5X, SSD, CX7 and external ports; Figure 5/text (printed page 6) explains two PCIe Gen5 x4 interfaces using Socket Direct; printed page 11 explicitly describes a unified physical memory pool. No numerical C2C rate is invented.
2. [Spark hardware guide](https://docs.nvidia.com/dgx/dgx-spark/hardware.html), checked November 2: one 20-core CPU, Blackwell GPU, 128 GB LPDDR5X at published 273 GB/s; NVMe storage; distinct 10 GbE and ConnectX connectivity.
3. [Spark ConnectX-7 guide](https://docs.nvidia.com/dgx/dgx-spark/spark-clustering.html): two external QSFP ports, each up to 200 Gb/s, and two SoC-facing PCIe Gen5 x4 links. Ethernet clustering connects separate systems. The lesson retains the existing selected 200 Gb/s connection example and does not infer 400 Gb/s SoC throughput.

The block labels “CPU” appear twice in Figure 3 because the CPU has two core clusters. They are not two CPU sockets or two GPUs. The green/orange colors identify IP ownership, not memory locality. These points are explained in the guided lens.

### DGX Station

1. [Station product specifications](https://www.nvidia.com/en-us/products/workstations/dgx-station/), checked November 2: one Blackwell Ultra GPU, one 72-core Grace CPU, 252 GB HBM3e / 7.1 TB/s; 496 GB LPDDR5X / 396 GB/s; 900 GB/s C2C; ConnectX-8 up to 800 Gb/s aggregate and two QSFP112 400 Gb/s ports. Optional RTX PRO is explicitly excluded from this lesson's primary AI-GPU count.
2. [Station Development Guide: System Overview](https://docs.nvidia.com/dgx/dgx-station-development-guide/overview.html), last updated October 30, 2026: physically attached CPU and GPU memories and coherent C2C connection agree with product specifications.
3. [Station Development Guide: Coherent Memory Management](https://docs.nvidia.com/dgx/dgx-station-development-guide/optimization.html#coherent-memory-management): host-resident buffers can be accessed coherently; `cudaMalloc` remains GPU-local and recommended for performance-critical data. The lesson expresses the locality lesson without offering an unverified allocation or offload recipe.
4. [Inside NVIDIA Blackwell Ultra](https://developer.nvidia.com/blog/inside-nvidia-blackwell-ultra-the-chip-powering-the-ai-factory-era/), August 22, 2025, Figure 1: two reticle dies joined by NV-HBI form one CUDA accelerator; separate HBM controllers and C2C interface. **The figure is architecture-level, not a Station wiring figure.** Its 288 GB / 8 TB/s maxima differ from the selected Station 252 GB / 7.1 TB/s; app captions and guided HBM lens explicitly state this. The illustrated NVLink-to-switch interface does not establish a local NVSwitch fabric in Station.

A current NVIDIA Station-specific system block diagram was not found in the product page or development guide. Search results for NVIDIA Station whitepapers mostly refer to old V100 systems and were rejected. Using the existing official Blackwell Ultra silicon figure, with clear scope and an accurate adjacent logical Station diagram, is the deliberate choice. Do not substitute an old four-GPU Station or an NVL72 tray figure.

## Asset provenance

All visual material is © NVIDIA. Local image content is unchanged; guided highlights are separate UI overlays. PDF raster extraction preserves the original full figure pixels and omits page furniture, not parts of the figure. Originals contain their own minor typography artifacts; these were not retouched.

| Local asset relative to `dist/assets/nvidia/` | Original | Dimensions / context |
| --- | --- | --- |
| `coherent/gh200-addressing.png` | [Original PNG](https://developer-blogs.nvidia.com/wp-content/uploads/2022/11/address-translation-services-grace-hopper-superchip.png) | 1435 × 671; Grace Hopper blog Figure 5; original downloaded November 2 |
| `coherent/spark-tiles.png` | [GB10 PDF](https://www.nvidia.com/content/dam/en-zz/Solutions/dgx-spark/nvidia-gb10-superchip-whitepaper.pdf#page=8) | 1490 × 1109; Figure 3; PDF page 8 image object 22 |
| `coherent/spark-topology.png` | [GB10 PDF](https://www.nvidia.com/content/dam/en-zz/Solutions/dgx-spark/nvidia-gb10-superchip-whitepaper.pdf#page=9) | 1564 × 998; Figure 4; PDF page 9 image object 25 |
| `blackwell-ultra.webp` (existing shared asset, not modified) | [Original WebP](https://developer-blogs.nvidia.com/wp-content/uploads/2025/08/NVIDIA-Blackwell-Ultra-GPU-chip-png.webp) | 2182 × 1420; Blackwell Ultra blog Figure 1; existing GB300 asset reused by `station-ultra` key |

Extraction: `pdfimages -f 8 -l 10 -png /tmp/coherent-research/gb10.pdf /tmp/coherent-research/gb10`; resulting `gb10-000.png` and `gb10-001.png` copied to `spark-tiles.png` and `spark-topology.png`. Source pages rendered using `pdftoppm -f 8 -l 9 -r 85 -png` and inspected. Figure pixels and their page captions match.

SHA-256:

```text
7359b0833873214aa7b173708dd54718547f12d2727784ee1ea9f82b732be2ab  coherent/gh200-addressing.png
5fe6e03f97811579ca033c3be55a023d8ebcee703698a819daae65c2e22df41c  coherent/spark-tiles.png
fc5336f1d6f2d845b2cec4f358c75e6bdaa5537c80ed9704f0262ba53ff22ca1  coherent/spark-topology.png
ac1f266cf4c669dbaa9afcac4748a59bfadfd48742dac60760f293457af9a8d8  blackwell-ultra.webp
```
