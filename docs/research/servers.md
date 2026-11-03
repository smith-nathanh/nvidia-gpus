# Eight-GPU DGX source notes

Sources checked November 2, 2026.

## Primary topology evidence and asset provenance

All images are unmodified NVIDIA originals, downloaded November 2, 2026. Copyright NVIDIA. Highlights are UI overlays; original files remain intact.

| Local asset | Original | Source and scope | Size |
| --- | --- | --- | --- |
| `dist/assets/nvidia/servers/dgx-h100-topology.png` | https://docs.nvidia.com/dgx/dgxh100-user-guide/_images/dgx-h100-system-topology.png | https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html#dgx-h100-200-system-topology — explicitly shared DGX H100/H200 topology | 10795 × 6298 |
| `dist/assets/nvidia/servers/dgx-b200-topology.png` | https://docs.nvidia.com/dgx/dgxb200-user-guide/_images/dgx-b200-system-topology.png | https://docs.nvidia.com/dgx/dgxb200-user-guide/introduction-to-dgxb200.html#dgx-b200-system-topology — DGX B200 | 805 × 461 |
| `dist/assets/nvidia/servers/dgx-b300-topology.png` | https://docs.nvidia.com/dgx/dgxb300-user-guide/_images/dgx-b300-system-topology.png | https://docs.nvidia.com/dgx/dgxb300-user-guide/introduction-to-dgxb300.html#dgx-b300-system-topology — DGX B300 | 1100 × 720 |

H100 and B300 PNGs are transparent; display on white for readable black labels. B200 original is low resolution; retain rather than manufacture detail. H100 original has very high resolution; responsive CSS should constrain rendered size. Highlights measured as percentages of the whole original, including legend.

## Reading the diagrams

- H100/H200: GPUs 0–7 and four turquoise NVSwitch chips occupy lower half. Each GPU connects to every NVSwitch; two illustrated CPU halves are not two independent NVLink islands. Purple PCIe joins hosts and peripheral modules; pale blue links CPU sockets. Orange ConnectX-7 compute modules differ from blue storage-network cards at top. Local NVMe is separate from RAM/HBM.
- B200: same broad x86 host/server organization, but two NVSwitch chips connect all eight GPUs; the left/right placement of switches does not split the GPU domain. Blue top adapters are BlueField-3, orange modules are ConnectX-7. Eight GPUs, not sixteen, despite two dies per GPU. B200 is not Grace-based GB200.
- B300: eight orange ConnectX-8 modules between hosts and GPUs; legend explicitly distinguishes thick GPU-facing PCIe Gen6 and thin CPU-facing PCIe Gen5. Two NVSwitch chips remain a separate GPU-peer path. BlueField-3 and NVMe are at top. CPU0 also has a thin PCIe control path to the switches; do not teach this as GPU payload passing through CPU RAM or NICs hanging off NVSwitch outputs.

## Additional primary sources

- https://www.nvidia.com/en-us/data-center/h100/ — selected SXM capacity/rates.
- https://www.nvidia.com/en-us/data-center/h200/ — 141 GB HBM3e, 4.8 TB/s; H200 NVL is a separate reference.
- https://www.nvidia.com/en-us/data-center/dgx-b200/ — eight Blackwell GPUs and published system aggregates.
- https://www.nvidia.com/en-us/data-center/dgx-b300/ — 800 Gb/s networking and 2.1 TB system HBM reporting.
- https://dam-cdn.nvd.orangelogic.com/AssetLink/625w0j7hnw6f07ui7fo63211mti2v08o.pdf — selected February 2026 DGX B300 memory totals (2.1 TB / 62 TB/s), re-opened and checked on page 3 against the conflicting guide.
- https://developer.nvidia.com/blog/inside-nvidia-blackwell-ultra-the-chip-powering-the-ai-factory-era/ — two dies work as one CUDA accelerator. Architecture maximums are not DGX SKU values.
- https://docs.nvidia.com/cuda/gpudirect-rdma/ — NIC/GPU DMA via PCIe can avoid staging in host RAM; platform/software support matters.
- https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html — ranks, AllReduce, ReduceScatter/AllGather. Placement examples are educational inference from documented topology, not measured NCCL algorithms or scheduling policy.
- https://docs.nvidia.com/dgx-cloud/slurm/latest/cluster-user-guide.html — GPU counts per job/node/task and GPU binding are distinct. Used only for these general Slurm concepts, not to imply the selected servers are a particular DGX Cloud deployment.
- https://docs.nvidia.com/nemo/megatron-bridge/nightly/parallelisms.html — tensor/model parallelism and hardware locality; added as B200 lesson reading. No launcher recipe or optimal performance recommendation is inferred.

## Constraints retained

- H100: 8 × 80 GB SXM. H200: 8 × 141 GB SXM; more memory does not enlarge NVLink domain. Both have two Xeon 8480C hosts, four NVSwitches, eight 400 Gb/s compute adapters.
- B200: 1,440 GB DGX total → 180 GB per GPU by arithmetic. Do not substitute 192 GB. Two Xeon 8570 hosts, two NVSwitches, eight ConnectX-7 400 Gb/s endpoints. CPU host access is PCIe, not C2C.
- B300: selected datasheet total 2.1 TB / 62 TB/s; hardware guide says 8 × 288 GB = 2.3 TB. Keep unresolved conflict visible; never derive a supposedly exact individual HBM number from rounded totals or use HGX/GB300 values. GPU-to-ConnectX-8 Gen6 differs from Gen5 CPU host access.
- Rates remain sourced from model traces in shared renderer. No bandwidth/performance estimates in new content.
- Placement holds eight ranks/GPUs fixed: 8 in one physical server vs 4 in each of two physical 8-GPU servers. Four GPUs in each split server are unallocated in the example, not absent or disabled. Server crossing uses network even if chassis share a rack. Allocation exclusivity and launcher binding depend on cluster policy.

B200’s topology image has limited native resolution; enlargement cannot add detail. The B300 source conflict remains unresolved.
