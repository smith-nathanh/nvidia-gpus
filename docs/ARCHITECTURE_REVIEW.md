# Architecture and teaching review

Reviewed November 1, 2026, at the user's request to use subagents to review all ten architectures. Three independent reviewers checked the model, generated maps, inspectors and path examples against primary NVIDIA documentation; the main agent reviewed shared UI behavior, reconciled the findings, made corrections, and ran browser checks. Reviewers did not edit files. Each reviewer rechecked the relevant corrections.

## Outcome

All ten selected references were covered. No P1 hardware error was identified. Two P2 architecture/presentation findings and three P2 shared UI/teaching findings were corrected. Source-scope and teaching clarifications were also incorporated.

B300's conflicting published memory reports remain unresolved at the source level. The app now makes that uncertainty explicit rather than choosing an individual-GPU figure that the selected DGX datasheet does not publish. This review is evidence-backed validation of the selected teaching models, not certification of every OEM/SKU, exact wiring, achieved performance, or usability through a user study.

## Review coverage

| Reviewer scope | Systems | Checked result after corrections |
| --- | --- | --- |
| GPU servers | DGX H100, DGX H200 | Eight SXM GPUs, x86 hosts, memory reports, four NVSwitches, local NVLink domain and 400 Gb/s compute endpoints agree with the selected references. |
| GPU servers | DGX B200 | Eight GPUs, two x86 CPUs, reported memory convention, two NVSwitches and 400 Gb/s compute endpoints agree. |
| GPU servers | DGX B300 | Counts, CPU host access, NVLink and direct GPU–NIC Gen6 path agree. Memory now follows explicitly published DGX system totals; individual values are unspecified. |
| Rack systems | GB200 NVL72 | Counts, superchip/tray composition, switch topology, C2C group budget, memory reporting and DGX peripherals agree. Local GPU numbering is consistent across maps and examples. |
| Rack systems | GB300 NVL72 | Counts, two-die GPU, eight HBM stacks, memory maximum, link scopes and Enterprise/DGX peripheral distinction agree. |
| Rack systems | Vera Rubin NVL72 | Current product rates and earlier architecture snapshot are distinguished correctly; current product memory and NVLink figures are retained. |
| Grace / personal systems | GH200 | Selected single HBM3e superchip's CPU/GPU composition, separate memories and coherent C2C agree. Server I/O is appropriately unspecified. |
| Grace / personal systems | DGX Spark | Shared physical LPDDR, CPU/GPU tiles and coherent C2C are distinguished. External port rates are separated from the selected connection example and shared SoC I/O. |
| Grace / personal systems | DGX Station | One-CPU/one-primary-GPU Desktop Superchip, distinct coherent memories and port/adapter network scopes agree. Optional RTX PRO remains excluded explicitly. |

## Corrected findings

### R1 — P2: B300 individual memory rate had an unsupported DGX scope

The app previously presented 288 GB and 8 TB/s on each DGX B300 GPU, with capacity-guide conflicts noted but no equivalent bandwidth distinction. The [DGX B300 datasheet, page 3](https://dam-cdn.nvd.orangelogic.com/AssetLink/625w0j7hnw6f07ui7fo63211mti2v08o.pdf) publishes **2.1 TB total HBM and 62 TB/s aggregate bandwidth** across eight GPUs, without separate individual capacity/rate specifications. The [hardware guide](https://docs.nvidia.com/dgx/dgxb300-user-guide/introduction-to-dgxb300.html) reports eight 288 GB GPUs. The [Blackwell Ultra datasheet, page 5](https://dam-cdn.nvd.orangelogic.com/AssetLink/1k0p832eq8r5ca0u5383ie5o4tp3bst1.pdf) separately lists HGX B300 individual values that must not silently become DGX specifications.

**Correction:** selected the DGX datasheet's system totals, marked individual values unspecified, and carried that scope through stats, node/GPU cards, inspectors, the tour and memory path. Conflicts remain in the reference notes. No exact individual rate is inferred by dividing a rounded total. The GPU-server reviewer rechecked the final generated data and render branches.

### R2 — P2: GB200/Rubin peer examples used unexplained global indices

Their examples said GPU 0 → GPU 71 while node views use GPU 0–3. This made the destination hard to locate and undermined hardware identity.

**Correction:** rack examples now consistently use **GPU 0 · Node 01 → GPU 3 · Node 18**, matching GB300. Regression checks cover all three rack references. The rack reviewer rechecked the change.

### R3 — P2: a local host path highlighted the unrelated CPU-to-CPU connection

The CPU→paired-GPU example's chain did not include the other host CPU, but the map highlighted that separate link as part of the path.

**Correction:** removed the CPU-to-CPU link from this active path. It remains independently inspectable and has visible selection feedback. The rack reviewer rechecked generated maps.

### R4 — P2: a new inspector selection retained the previous explanation's scroll position

On desktop, scrolling through an inspector's sources and selecting a different component could leave the new title above the visible panel. This was reproduced in the browser.

**Correction:** a changed system/node/GPU/component identity resets inspector scrolling to the top. Browser verification confirmed a previously scrolled inspector returned to zero for the new selection.

### R5 — P2: starting a keyboard tour did not focus its controls

Tour advancement preserved focus, but starting a tour left focus on the sidebar launcher. Tab navigation could traverse many unrelated controls before reaching Next.

**Correction:** tour entry and advancement focus Next. The tour now has an accessible region label. Keyboard browser verification passed.

## Incorporated source and teaching clarifications

- **Spark ports and selected connection:** the [networking guide](https://docs.nvidia.com/dgx/dgx-spark/spark-clustering.html) describes two external ports, each up to 200 Gb/s. The [GB10 whitepaper, page 6](https://www.nvidia.com/content/dam/en-zz/Solutions/dgx-spark/nvidia-gb10-superchip-whitepaper.pdf) describes two SoC-facing PCIe Gen5 ×4 Socket Direct links and a 200 Gb/s example using one connected port. The map keeps that selected example, explicitly distinguishes its scope, and does not infer 400 Gb/s host throughput from the port sum.
- **GB10 tiles and C2C:** the same whitepaper documents CPU and GPU tiles joined by coherent C2C. These are now explained in inspectors and the package map while retaining one shared LPDDR pool and leaving the numerical C2C rate unspecified.
- **Station ports versus adapter sum:** the [Station table](https://www.nvidia.com/en-us/products/workstations/dgx-station/) specifies two 400 Gb/s ports. Maps and inspectors show 50 GB/s per port per direction before overhead, separately from the 100 GB/s adapter sum.
- **B300 GPU network attachment:** the DGX hardware guide explicitly identifies GPU-to-ConnectX-8 PCIe Gen6. The map now names this path without changing the separate CPU host-interface ceiling.
- **GB200 provenance:** added its [architecture article](https://developer.nvidia.com/blog/nvidia-gb200-nvl72-delivers-trillion-parameter-llm-training-and-real-time-inference/) to explain the shared C2C superchip budget directly rather than relying chiefly on a cross-generation comparison table.

## Principal sources checked by the reviewers

- [DGX H100/H200 hardware](https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html), [H100 SXM](https://www.nvidia.com/en-us/data-center/h100/), [H200](https://www.nvidia.com/en-us/data-center/h200/)
- [DGX B200 hardware](https://docs.nvidia.com/dgx/dgxb200-user-guide/introduction-to-dgxb200.html), [DGX B200 specifications](https://www.nvidia.com/en-us/data-center/dgx-b200/)
- [GB200 product table](https://www.nvidia.com/en-us/data-center/gb200-nvl72/), [DGX GB rack hardware](https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html)
- [GB300 Enterprise components](https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html), [Enterprise networking](https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/networking-hardware.html), [Blackwell Ultra architecture](https://developer.nvidia.com/blog/inside-nvidia-blackwell-ultra-the-chip-powering-the-ai-factory-era)
- [Vera Rubin current specifications](https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/), [January architecture article](https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/)
- [GH200 datasheet](https://dam-cdn.nvd.orangelogic.com/AssetLink/tkno03fa645gb7f33w60rf200d330420.pdf), [Grace Hopper architecture](https://developer.nvidia.com/blog/nvidia-grace-hopper-superchip-architecture-in-depth/)
- [Spark hardware](https://docs.nvidia.com/dgx/dgx-spark/hardware.html), plus the more specific Spark/Station and B300 sources linked above

## Verification

- `npm run check` passes, including new regressions for B300's unknown individual values/system totals, rack endpoint identity, personal-system rate scopes, and host-path highlighting.
- All forty model/scale views were exercised at 390 px width after the corrections. No whole-page horizontal overflow, missing values or map buttons below 44 px height were found.
- Targeted desktop checks covered tour entry, highlighted host links, changed inspector scrolling, B300 memory displays, and source/port-scope explanations.
- Checked browser console warnings/errors were empty. Temporary viewport overrides were reset.

## Useful later refinements

The reviewers suggested a clearly illustrative rack containing multiple independent GPU servers, rather than only a single-server context card, and scoped aggregate memory summaries for additional rack models. These remain suggestions, not failed checks or separate user approvals. Exact C2C branch allocation, physical switch-port maps, additional OEM/SKU variants and measured performance remain outside the current model.
