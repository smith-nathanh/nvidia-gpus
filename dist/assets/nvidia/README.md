# NVIDIA figure provenance

Downloaded November 2, 2026 for the local GB300 architecture lesson. Originals are unmodified. All figures are © NVIDIA; source links and attribution appear beside the figures in the app. CSS outlines on the tray lesson are separately identified as this tool’s annotations. Local copies keep the lesson usable without third-party image requests.

| Local file | Original asset | Context |
| --- | --- | --- |
| `gb300-rack.png` | https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/_images/nvl72-ai-factory-01.png | [Enterprise Reference Architecture, Figure 1](https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html#figure-1): physical rack with 10 + 8 compute trays and 9 NVLink switch trays |
| `gb300-tray.png` | https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/_images/nvl72-ai-factory-03.png | [Enterprise Reference Architecture, Figure 3](https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html#figure-3): sample logical compute-tray I/O; omits rack GPU NVLink. The selection handles visible on a CX-8 box are in NVIDIA’s published original. |
| `blackwell-ultra.webp` | https://developer-blogs.nvidia.com/wp-content/uploads/2025/08/NVIDIA-Blackwell-Ultra-GPU-chip-png.webp | [Inside NVIDIA Blackwell Ultra, Figure 1](https://developer.nvidia.com/blog/inside-nvidia-blackwell-ultra-the-chip-powering-the-ai-factory-era/): architecture-level silicon figure; GPU memory capacity varies by SKU |

The rack image is this Enterprise reference’s physical arrangement, not a promise about all OEM racks. The silicon figure’s interface labels and memory maximum retain their original publication scope; the app adds the existing direction and configuration caveats in its caption.

The other nine architecture lessons add ten local NVIDIA figures. Provenance, original URLs, dimensions and configuration caveats are recorded in [servers](servers/README.md), [racks](../../../docs/research/racks.md), and [coherent systems](../../../docs/research/coherent.md). H100/H200 share the official topology figure. Station reuses the architecture-level Blackwell Ultra image above with a Station-specific scope warning. Spark’s two figures were extracted from the official GB10 whitepaper without altering their figure content.
