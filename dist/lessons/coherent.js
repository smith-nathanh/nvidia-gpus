// Curated teaching content for the selected single-primary-GPU configurations.
// Evidence, asset extraction and scope decisions: docs/research/coherent.md.
const refs = {
  ghArchitecture: 'https://developer.nvidia.com/blog/nvidia-grace-hopper-superchip-architecture-in-depth/',
  ghSheet: 'https://dam-cdn.nvd.orangelogic.com/AssetLink/tkno03fa645gb7f33w60rf200d330420.pdf',
  gb10: 'https://www.nvidia.com/content/dam/en-zz/Solutions/dgx-spark/nvidia-gb10-superchip-whitepaper.pdf',
  sparkHardware: 'https://docs.nvidia.com/dgx/dgx-spark/hardware.html',
  sparkNetwork: 'https://docs.nvidia.com/dgx/dgx-spark/spark-clustering.html',
  station: 'https://www.nvidia.com/en-us/products/workstations/dgx-station/',
  stationOverview: 'https://docs.nvidia.com/dgx/dgx-station-development-guide/overview.html',
  stationMemory: 'https://docs.nvidia.com/dgx/dgx-station-development-guide/optimization.html#coherent-memory-management',
  ultra: 'https://developer.nvidia.com/blog/inside-nvidia-blackwell-ultra-the-chip-powering-the-ai-factory-era/'
};

export const figures = {
  'gh200-addressing': {
    file: 'coherent/gh200-addressing.png', title: 'Two physical memories, coherent access',
    source: refs.ghArchitecture, credit: 'NVIDIA Technical Blog · Grace Hopper, Figure 5',
    alt: 'Grace CPU and Hopper GPU connected by NVLink-C2C, with LPDDR5X on the left and HBM3 on the right. Both processors use the system page table to address pages in either physical memory.',
    note: 'NVIDIA’s 2022 HBM3-era illustration teaches the addressing mechanism. This lesson selects the later 144 GB HBM3e GH200. The diagonal arrows represent address translation/access relationships, not physical cables. “Remote” here means the other processor’s memory inside this superchip.',
    minWidth: 960
  },
  'spark-tiles': {
    file: 'coherent/spark-tiles.png', title: 'The two GB10 tiles and their shared-memory interface',
    source: refs.gb10 + '#page=8', credit: 'NVIDIA GB10 White Paper · April 2026, Figure 3',
    alt: 'GB10 component ownership map. The S-die contains CPU clusters, I/O, fabric, cache and memory controller. The G-die contains GPU compute and graphics L2. C2C blocks join the two tiles.',
    note: 'The two CPU boxes are core clusters within one 20-core CPU. The two tiles are a CPU/system tile and a GPU tile, not two GPUs. The memory-controller block serves the shared physical LPDDR5X; the memory chips themselves are outside this figure.',
    minWidth: 900
  },
  'spark-topology': {
    file: 'coherent/spark-topology.png', title: 'Where Spark’s memory, storage and network attach',
    source: refs.gb10 + '#page=9', credit: 'NVIDIA GB10 White Paper · April 2026, Figure 4',
    alt: 'DGX Spark topology with one 128 GB LPDDR5X block and SSD connected to GB10. ConnectX-7 connects through two SoC links to two QSFP 200G ports, separate from RJ45 10Gb Ethernet.',
    note: 'At top left, LPDDR5X is working memory and SSD is persistent storage. At bottom right, CX7 is the compute-network adapter. Its two 200 Gb/s ports share SoC-facing I/O; adding the port labels does not establish 400 Gb/s of host throughput.',
    minWidth: 1100
  },
  'station-ultra': {
    file: 'blackwell-ultra.webp', title: 'Inside Station’s GPU architecture',
    source: refs.ultra, credit: 'NVIDIA Technical Blog · Blackwell Ultra, Figure 1',
    alt: 'Architecture-level Blackwell Ultra GPU diagram with two compute dies joined by NV-HBI, HBM controllers around their edges and a separate NVLink-C2C interface on the right.',
    note: 'Architecture illustration, not a DGX Station wiring diagram. Its 288 GB / 8 TB/s HBM labels are architecture maxima; this Station has 252 GB / 7.1 TB/s. The peer-NVLink capability shown at left does not establish an NVSwitch fabric inside Station. The PCIe host-interface label describes another GPU capability; this Station’s paired Grace CPU uses C2C. Grace and its 496 GB LPDDR5X are outside this GPU picture.',
    minWidth: 1100
  }
};

export const lessons = {
  gh200: {
    steps: [['The big picture', 'Coherent ≠ equally local'], ['Read the memory map', 'Addresses and physical memory'], ['Follow the data', 'HBM, host or another server'], ['Place a working set', 'Same buffer, different route']],
    titles: ['One CPU. One GPU.<br><em>Two memory homes.</em>', 'An address is not<br><em>a physical location.</em>', 'Where the bytes live<br><em>changes the access path.</em>', 'Same 100 GB buffer.<br><em>Different locality.</em>'],
    intros: ['GH200 makes the Grace CPU’s memory accessible to its paired Hopper GPU. That expands what the GPU can work with, while keeping HBM and CPU memory physically distinct.', 'Read NVIDIA’s diagram from the physical memories at the edges to the shared addressing mechanism below. Coherence helps processors agree on data; it does not erase distance.', 'A GPU reading its HBM, reading Grace memory, and exchanging data with a second server use three different routes.', 'Keep the data size and GPU fixed. Move one illustrative working buffer between HBM and Grace memory to see what changes during GPU reads.'],
    reference: 'Single GH200 · 144 GB HBM3e + up to 480 GB LPDDR5X · server I/O varies', checked: 'November 2, 2026',
    overview: {
      figure: 'gh200-addressing', diagram: 'coherent', stageLabel: 'ONE GH200 SUPERCHIP', boundaryLabel: '1 Grace CPU + 1 Hopper GPU',
      caption: 'The selected superchip is one building block inside a server. GH200 NVL2 and DGX GH200 combine more superchips and are different configurations.',
      takeawayLabel: 'THE IDEA TO KEEP', takeaway: '<strong>GPU-accessible capacity and GPU-local capacity differ.</strong> The GPU has 144 GB of HBM3e; it can also access the paired Grace CPU’s separate LPDDR5X through NVLink-C2C.',
      equation: [{value: '1', label: 'Grace CPU'}, {value: '1', label: 'Hopper GPU'}, {value: '2', label: 'physical memory types'}]
    },
    inside: {
      figure: 'gh200-addressing',
      recipe: [{value: 'LPDDR5X', label: 'physically attached to Grace'}, {value: 'NVLink-C2C', label: 'coherent CPU–GPU connection'}, {value: 'HBM3e', label: 'physically attached to Hopper'}],
      lenses: {
        groups: {label: 'Find the two memories', title: 'Page A and Page B have different physical homes.', text: 'The blue column is CPU LPDDR5X. The orange column is GPU HBM. They are separate memories even when software can address both. The original drawing says HBM3; our selected later GH200 has 144 GB HBM3e.', hint: 'Look at the physical-memory labels on the far left and far right.', zones: [{left: 9.5, top: 5.5, width: 10.3, height: 80}, {left: 79.8, top: 5, width: 10.5, height: 81}]},
        network: {label: 'Find the coherent link', title: 'C2C connects the paired processors.', text: 'The vertical NVLink-C2C strip joins Grace and Hopper within one superchip. A GPU load from CPU-resident memory crosses this connection. It is neither the server’s external NIC nor a link to another local GPU.', hint: 'Here “remote access” stays inside this CPU–GPU pair; it does not mean another Slurm node.', zones: [{left: 45, top: 8, width: 10, height: 32}]},
        storage: {label: 'Read the page table', title: 'One addressing mechanism can name either memory.', text: 'The system page table maps addresses to physical pages. Both processors can use those mappings. The diagonal arrows explain which pages they can access; they are not additional memory buses and do not route every payload through the page table.', hint: 'PTE means page-table entry. Address translation tells the processor where the data resides.', zones: [{left: 21.8, top: 71, width: 56, height: 15}]}
      },
      takeawayLabel: 'ACCESSIBILITY IS NOT LOCALITY', takeaway: 'A valid pointer answers <strong>“can I access it?”</strong> Its physical backing answers <strong>“which path will carry the data?”</strong> Keep both questions when debugging memory behavior.'
    },
    paths: {
      memory: {label: 'GPU-local HBM', question: 'A kernel reads a tensor resident in Hopper HBM3e.', title: 'The data stays on the GPU’s memory path.', steps: [['HBM3e', '144 GB local GPU capacity', 'memory'], ['Memory controllers', 'Hopper memory interface', 'memory'], ['Hopper GPU', 'Kernel consumes the tensor', 'gpu']], impact: 'Repeated accesses to a GPU-resident working set use HBM. A larger coherent address space does not increase the amount of physical HBM.', source: refs.ghSheet},
      host: {label: 'Grace LPDDR5X', question: 'The same GPU reads data resident in Grace memory.', title: 'The memory access crosses NVLink-C2C.', steps: [['Grace LPDDR5X', 'Separate physical memory', 'memory'], ['Grace → NVLink-C2C', 'Coherent access to host memory', 'cpu'], ['Hopper GPU', 'Same kernel, different locality', 'gpu']], impact: 'A host-resident dataset or offloaded state can remain accessible to the GPU. The CPU-memory interface and C2C now matter; coherence does not guarantee HBM-like throughput.', source: refs.ghArchitecture},
      remote: {label: 'Another server', question: 'This single-superchip server exchanges data with a second server.', title: 'The deployed server’s network carries the exchange.', steps: [['GH200 server A', 'One GPU in this reference', 'gpu'], ['Server I/O → NIC → network', 'Adapter and fabric chosen by deployment', 'network'], ['Server B', 'Separate processors and memory', 'gpu']], impact: 'Before mapping a multi-node job, identify the actual server NIC and network. “GH200” alone does not specify the network rate, port count or a multi-GPU NVLink topology.', source: refs.ghSheet}
    },
    transferTakeaway: 'For this single-GPU reference, <strong>C2C is the CPU–GPU path</strong>. A second GH200 server does not join the coherent pair just because its processor has the same name.',
    experiment: {
      kind: 'memory-placement', title: 'Read the same 100 GB buffer from two locations.', intro: 'Treat this as one GPU-read working buffer, not a complete model or training memory estimate. Both locations have enough published capacity for the example.', options: ['Buffer in GPU HBM', 'Buffer in Grace memory'], workingSetGB: 100,
      states: {
        same: {title: 'HBM holds the buffer; GPU reads remain local.', text: 'The 100 GB buffer occupies part of the selected 144 GB HBM3e. Its repeated reads use the Hopper memory interface. Additional tensors, activations and runtime allocations still need their own space.'},
        split: {title: 'Grace holds the buffer; GPU reads cross C2C.', text: 'The buffer is still 100 GB and the computation still runs on Hopper. Its backing has moved to LPDDR5X, so GPU reads now use the CPU-memory path and NVLink-C2C. This saves HBM capacity but changes locality.'}
      },
      caveat: 'Illustrative residency choice. This is not a memory-migration simulation, allocation recipe or runtime prediction. Actual placement depends on allocation APIs, operating system, runtime and access patterns.',
      takeawayLabel: 'WHAT CHANGED?', takeaway: '<strong>The number of bytes stayed fixed; the access route changed.</strong> Coherent capacity can help a workload fit, but fitting and running efficiently are separate questions.',
      bridge: [{label: 'FROM CPU-ONLY SLURM', title: 'Think about memory locality inside a node.', paragraphs: ['A node allocation identifies a server; it does not tell you where each tensor is physically resident. With GH200, ask whether GPU-read data is backed by HBM or Grace LPDDR5X.', 'For a distributed job, add a second question: which NIC and fabric connect the allocated servers? This single-superchip lesson makes no assumption about that deployment.']}, {label: 'DURING LLM WORK', title: 'Treat offloaded state as a placement decision.', paragraphs: ['Weights, activations and optimizer state have different access patterns. A large host-resident object may be useful, but frequent GPU reads will exercise C2C. Profile the actual workload before assuming a capacity increase improves throughput.']}],
      sources: [{url: refs.ghSheet, label: 'Selected GH200 memory specifications'}, {url: refs.ghArchitecture, label: 'Coherent access and address translation'}],
      check: {question: 'Does 144 GB of HBM plus up to 480 GB of LPDDR mean up to 624 GB at HBM speed?', answer: 'No. It is combined accessible capacity across two physical memories. GPU-local HBM reads and reads from Grace LPDDR5X follow different paths.'}
    }
  },
  spark: {
    steps: [['The big picture', 'One shared physical pool'], ['Read the GB10 diagram', 'Separate tiles, shared memory'], ['Follow the data', 'Local pool or another Spark'], ['Budget an LLM workload', 'Every allocation counts']],
    titles: ['CPU and GPU.<br><em>One 128 GB pool.</em>', 'Two compute tiles.<br><em>One memory budget.</em>', 'Inside one Spark,<br><em>sharing is physical.</em>', 'More GPU allocations.<br><em>Less room for everything else.</em>'],
    intros: ['DGX Spark’s CPU and GPU share physical LPDDR5X. The 128 GB belongs to the whole system: model data, CPU work, operating system and other allocations compete for it.', 'NVIDIA’s component map shows why shared memory does not mean a single compute die. Identify the CPU/system tile, GPU tile and C2C connection before tracing the memory controller.', 'The shared pool simplifies CPU–GPU data exchange. Connecting a second Spark adds a network boundary and another physical pool.', 'Try two illustrative allocation budgets for one Spark. Keep CPU work and other usage fixed, then grow the GPU workload.'],
    reference: '128 GB NVIDIA DGX Spark · GB10 · one GPU and one 20-core Arm CPU', checked: 'November 2, 2026',
    overview: {
      figure: 'spark-tiles', diagram: 'shared', stageLabel: 'ONE DGX SPARK', boundaryLabel: 'GB10 · CPU/system tile + GPU tile',
      caption: 'CPU and GPU use one physical 128 GB LPDDR5X pool. The 273 GB/s published memory bandwidth is also one system budget; there is no separate HBM pool.',
      takeawayLabel: 'THE IDEA TO KEEP', takeaway: '<strong>128 GB shared means 128 GB total.</strong> Memory used by CPU-side data preparation is part of the same physical capacity needed for GPU model data.',
      equation: [{value: '1', label: '20-core Arm CPU'}, {value: '1', label: 'Blackwell GPU'}, {value: '128 GB', label: 'shared physical LPDDR5X'}]
    },
    inside: {
      figure: 'spark-tiles', recipe: [{value: 'S-die', label: 'CPU, I/O and memory controller'}, {value: 'C2C', label: 'coherent connection between tiles'}, {value: 'G-die', label: 'one Blackwell GPU'}],
      lenses: {
        groups: {label: 'Find CPU and GPU', title: 'Two CPU clusters belong to one CPU; the G-die is the GPU.', text: 'On the left, the S-die holds the CPU clusters and much of the system logic. On the right, the G-die holds GPU compute. These are two different kinds of processor within one GB10 superchip, not two GPU ranks.', hint: 'The orange and green colors identify component ownership in NVIDIA’s figure, not separate physical memory pools.', zones: [{left: 2, top: 19, width: 30, height: 20}, {left: 77.5, top: 38, width: 20, height: 33}]},
        network: {label: 'Find coherent C2C', title: 'C2C bridges the system tile and GPU tile.', text: 'The two vertical C2C blocks meet across the tile boundary. This coherent internal connection lets the GPU participate in the shared-memory architecture. It is separate from the ConnectX-7 adapter used between machines.', hint: 'NVIDIA does not publish a numerical GB10 C2C rate here. Do not substitute the 900 GB/s rate of a Grace–Hopper or Grace–Blackwell system.', zones: [{left: 63.8, top: 5, width: 13.3, height: 80}]},
        storage: {label: 'Find the memory interface', title: 'The LPDDR controller is on the S-die.', text: 'The bottom-left memory-controller block serves the common physical LPDDR5X pool. GPU access reaches that memory through the coherent tile connection; CPU use and GPU use share its capacity and memory bandwidth.', hint: 'The cache blocks are small on-chip storage structures. They are not an extra 128 GB of system memory.', zones: [{left: 2, top: 75.5, width: 61.3, height: 9.3}]}
      },
      takeawayLabel: 'SHARED DOES NOT MEAN IDENTICAL', takeaway: '<strong>CPU and GPU are distinct processors with a coherent connection.</strong> What they share is the physical LPDDR5X capacity, rather than separate host RAM and GPU HBM.',
      deeper: {figure: 'spark-topology', title: 'Follow the connections beyond GB10.', paragraphs: ['The top-left LPDDR5X block is working memory; the SSD below it stores files and checkpoints. Disk capacity cannot be added to the physical RAM budget.', 'At bottom right, CX7 connects to two external 200 Gb/s QSFP ports through shared SoC-facing I/O. The separate RJ45 10 GbE connection is another network path. Two Sparks still have separate memory pools, joined by Ethernet.']}
    },
    paths: {
      memory: {label: 'GPU reads shared RAM', question: 'The GPU reads model data in this Spark’s LPDDR5X.', title: 'The data comes from the shared physical pool.', steps: [['Shared LPDDR5X', 'One 128 GB system pool', 'memory'], ['Memory controller + C2C', 'System tile to GPU tile', 'cpu'], ['Blackwell GPU', 'Consumes model data', 'gpu']], impact: 'The GPU can use a large part of system memory, but CPU and OS allocations also consume it. The published memory bandwidth is shared, not 273 GB/s for each processor independently.', source: refs.gb10},
      host: {label: 'CPU prepares GPU data', question: 'The CPU prepares data that the GPU will consume.', title: 'The data can stay in the same physical memory pool.', steps: [['Arm CPU', 'Prepare a batch or other inputs', 'cpu'], ['Shared LPDDR5X + coherent C2C', 'Accessible from both tiles', 'memory'], ['Blackwell GPU', 'Consume the prepared data', 'gpu']], impact: 'The architecture can avoid maintaining separate CPU-RAM and GPU-HBM copies. The application still needs correct synchronization and suitable APIs; coherence does not make every framework allocation zero-copy.', source: refs.gb10},
      remote: {label: 'A second Spark', question: 'A tensor must reach a GPU in another Spark.', title: 'The exchange crosses Ethernet through ConnectX-7.', steps: [['Spark A', 'Its own 128 GB pool', 'gpu'], ['ConnectX-7 → Ethernet → ConnectX-7', 'External network or direct cable', 'network'], ['Spark B', 'A separate 128 GB pool', 'gpu']], impact: 'Distributed software must place work and communicate between machines. Two Sparks provide two physical pools, not a single 256 GB allocation with local-memory behavior.', source: refs.sparkNetwork}
    },
    transferTakeaway: '<strong>Internal C2C and external ConnectX do different jobs.</strong> Coherent sharing within GB10 does not extend across a cable to a second Spark.',
    experiment: {
      kind: 'shared-budget', title: 'One physical pool funds the whole workload.', intro: 'These are invented, disjoint allocation totals in decimal GB. “GPU” includes all GPU-workload allocations; “CPU” is separate CPU-workload data; “other” is an example allowance for everything else.',
      options: ['80 GB GPU workload', '104 GB GPU workload'],
      budgets: {same: {cpu: 24, gpu: 80, other: 8}, split: {cpu: 24, gpu: 104, other: 8}},
      states: {
        same: {title: '112 GB used; 16 GB remains in the arithmetic budget.', text: '80 GB for GPU work + 24 GB for CPU work + 8 GB for other allocations totals 112 GB. All three categories occupy the same 128 GB LPDDR5X pool.'},
        split: {title: '136 GB requested; the budget exceeds physical RAM by 8 GB.', text: 'Only the GPU-workload allocation increased, but total demand now exceeds the same 128 GB pool. The CPU’s 24 GB cannot be moved into a second host-memory pool: this Spark has no such pool.'}
      },
      caveat: 'Example allocation arithmetic, not a model-fit guarantee or an OS-memory reserve recommendation. Real usage includes framework caches, temporary buffers and runtime overhead; sharing and accounting rules can differ. No swap, compression or out-of-memory behavior is simulated.',
      takeawayLabel: 'WHAT CHANGED?', takeaway: '<strong>Increasing GPU use reduces room for the rest of the system.</strong> CPU data preparation, model execution and other software draw on the same physical capacity.',
      bridge: [{label: 'DURING LLM WORK', title: 'Budget more than the checkpoint weights.', paragraphs: ['Weights are only part of a workload’s memory demand. Inference also needs KV cache and temporary buffers; training adds activations, gradients and optimizer state according to the method.', 'The totals here are illustrative allocations, not a claim that a model of a particular parameter count will fit. Measure the software you intend to run.']}, {label: 'WHEN YOU ADD A SECOND SPARK', title: 'Capacity grows across a network boundary.', paragraphs: ['A second machine brings its own CPU, GPU and physical memory. The workload must distribute data and exchange results over Ethernet; a single local allocation does not automatically grow to 256 GB.', 'This is the same distinction you know from Slurm: two nodes add resources, while the program determines how to use and communicate between them.']}],
      sources: [{url: refs.gb10 + '#page=15', label: 'GB10 unified physical memory'}, {url: refs.sparkHardware, label: '128 GB Spark hardware specification'}, {url: refs.sparkNetwork, label: 'Connecting separate Sparks'}],
      check: {question: 'If the GPU workload uses 104 GB, are another 128 GB available for CPU work?', answer: 'No. CPU and GPU share the same 128 GB physical pool. In this example, 104 GB + 24 GB + 8 GB exceeds that pool by 8 GB.'}
    }
  },
  station: {
    steps: [['The big picture', '748 GB has two memory homes'], ['Read the GPU diagram', 'Two dies still mean one GPU'], ['Follow the data', 'HBM, LPDDR or Ethernet'], ['Place a working set', 'Capacity and locality']],
    titles: ['748 GB accessible.<br><em>252 GB GPU-local.</em>', 'Look inside one GPU.<br><em>Keep the boundaries straight.</em>', 'One GPU can reach<br><em>different memory tiers.</em>', 'Same 200 GB buffer.<br><em>Two ways to feed the GPU.</em>'],
    intros: ['DGX Station’s GB300 Desktop Superchip pairs one Grace CPU with one Blackwell Ultra GPU. Its 748 GB coherent capacity combines physically separate GPU HBM and CPU LPDDR5X.', 'NVIDIA’s silicon figure reveals another boundary: two compute dies form the one primary AI GPU. It shows the GPU architecture, not the complete Station or an NVL72 rack.', 'Start from the primary AI GPU. Its own HBM, the paired Grace memory, and another Station each require a different route.', 'Keep one illustrative GPU-read buffer fixed at 200 GB. Place it in GPU HBM or Grace memory and watch the access path change.'],
    reference: 'GB300 Desktop Superchip · 1 Grace CPU + 1 primary AI GPU · optional RTX PRO excluded', checked: 'November 2, 2026',
    overview: {
      figure: 'station-ultra', diagram: 'coherent', stageLabel: 'ONE DGX STATION', boundaryLabel: 'GB300 Desktop · 1 CPU + 1 primary GPU',
      caption: 'The Desktop Superchip is one CPU plus one GPU. A GB300 NVL72 superchip has one CPU plus two GPUs; that rack topology does not apply to this Station.',
      takeawayLabel: 'THE IDEA TO KEEP', takeaway: '<strong>252 GB HBM3e + 496 GB LPDDR5X = 748 GB coherent capacity.</strong> The GPU can access both, but its local HBM and the CPU’s memory have different interfaces and access speeds.',
      equation: [{value: '252 GB', label: 'GPU-local HBM3e'}, {value: '496 GB', label: 'Grace LPDDR5X'}, {value: '748 GB', label: 'combined coherent capacity'}]
    },
    inside: {
      figure: 'station-ultra', recipe: [{value: '2 compute dies', label: 'one CUDA accelerator'}, {value: '1 Grace CPU', label: 'connected by NVLink-C2C'}, {value: '1 Desktop Superchip', label: 'one CPU + one primary GPU'}],
      lenses: {
        groups: {label: 'Count the GPU once', title: 'The two silicon halves are one GPU.', text: 'Find the narrow NV-HBI strip in the center. It joins the two compute dies into a single CUDA accelerator. An ordinary one-process-per-GPU job counts this whole device once; the seam is not a second GPU or a network boundary.', hint: 'Do not turn the two silicon halves into two training ranks with independent GPUs.', zones: [{left: 45.6, top: 20.8, width: 4, height: 67.8}]},
        network: {label: 'Find the CPU connection', title: 'The right edge connects to Grace through C2C.', text: 'NVLink-C2C is the coherent CPU–GPU interface. Grace and its 496 GB LPDDR5X sit outside this picture. The NVLink-to-switch label on the opposite edge is an architecture capability; it does not imply a peer-GPU fabric in this Station.', hint: 'Two Stations communicate through ConnectX-8 Ethernet. The silicon drawing is not their external wiring diagram.', zones: [{left: 76.6, top: 23.5, width: 7, height: 55}]},
        storage: {label: 'Find local HBM', title: 'HBM controllers feed the GPU’s local working memory.', text: 'The HBM CTRL blocks ring the two dies. For this selected Station, local HBM3e is 252 GB at a published 7.1 TB/s. The figure’s 288 GB / 8 TB/s callout describes architecture maxima, not this Desktop configuration.', hint: 'Grace LPDDR5X adds accessible capacity, not another 496 GB at the HBM interface rate.', zones: [{left: 17.1, top: 20.8, width: 61.4, height: 6.4}, {left: 17.1, top: 82, width: 61.4, height: 6.6}]}
      },
      takeawayLabel: 'THREE DIFFERENT BOUNDARIES', takeaway: '<strong>Dies join to form a GPU. C2C joins that GPU to Grace. Ethernet joins separate Stations.</strong> None of those boundaries changes the selected count of one primary AI GPU per Station.'
    },
    paths: {
      memory: {label: 'GPU-local HBM', question: 'The primary GPU reads a tensor resident in its HBM3e.', title: 'The read uses the local HBM interface.', steps: [['252 GB HBM3e', 'Physical GPU-local memory', 'memory'], ['HBM controllers', 'Across one two-die GPU', 'memory'], ['Blackwell Ultra GPU', 'One CUDA accelerator', 'gpu']], impact: 'The GPU-local working set uses the HBM interface. NVIDIA’s Station guide recommends local device allocations for performance-critical data, even though the GPU can also access host memory.', source: refs.stationMemory},
      host: {label: 'Grace LPDDR5X', question: 'The primary GPU reads a buffer backed by CPU memory.', title: 'The read uses Grace memory and crosses C2C.', steps: [['496 GB LPDDR5X', 'Physically attached to Grace', 'memory'], ['Grace → NVLink-C2C', 'Coherent host-memory access', 'cpu'], ['Blackwell Ultra GPU', 'Same compute device', 'gpu']], impact: 'Large host-resident data can be directly accessible without a duplicate HBM buffer when the software supports it. The 396 GB/s CPU-memory interface also constrains this path; C2C’s link budget alone is not end-to-end throughput.', source: refs.station},
      remote: {label: 'Another Station', question: 'Data must reach the primary GPU in a second Station.', title: 'The exchange crosses ConnectX-8 Ethernet.', steps: [['Station A', 'One primary GPU and its memory', 'gpu'], ['ConnectX-8 → Ethernet → ConnectX-8', 'Two systems communicate', 'network'], ['Station B', 'Separate coherent memory domain', 'gpu']], impact: 'Each Station retains its own HBM and LPDDR5X. The 800 Gb/s networking figure is the adapter aggregate over two 400 Gb/s ports, not an 800 Gb/s single port or a shared-memory bus.', source: refs.station}
    },
    transferTakeaway: '<strong>A shared software view does not make every byte equally local.</strong> HBM, Grace memory and another Station remain distinct physical destinations.',
    experiment: {
      kind: 'memory-placement', title: 'Move one buffer; preserve the GPU and data size.', intro: 'This 200 GB buffer is an illustrative part of a workload. It fits within either published memory capacity; it is not an estimate for a complete LLM.', options: ['Buffer in 252 GB HBM', 'Buffer in 496 GB LPDDR'], workingSetGB: 200,
      states: {
        same: {title: 'The GPU repeatedly reads from local HBM.', text: 'The buffer uses 200 GB of the 252 GB HBM capacity. Other GPU allocations still need room. Reads stay on the local HBM path; the 496 GB Grace memory remains a separate physical resource.'},
        split: {title: 'The same GPU repeatedly reads across C2C.', text: 'The 200 GB buffer now resides in Grace LPDDR5X. Its GPU reads traverse the CPU-memory interface and C2C. HBM capacity is freed for other allocations, while the buffer’s locality has changed.'}
      },
      caveat: 'Illustrative residency choice, not an automatic spill policy or performance estimator. Allocation APIs, runtime behavior and data-access patterns determine real placement and traffic. Published interface peaks are not measured workload throughput.',
      takeawayLabel: 'CAPACITY AND SPEED ANSWER DIFFERENT QUESTIONS', takeaway: '<strong>748 GB tells you the combined capacity; residency tells you the access path.</strong> A workload that fits across both memories can behave differently from one whose hot data stays in HBM.',
      bridge: [{label: 'DURING LLM WORK', title: 'Separate hot data from capacity pressure.', paragraphs: ['A model can require more than weight storage: KV cache, activations, gradients, optimizer state and temporary buffers depend on the workload. Ask which of those allocations are GPU-local and which the GPU reads through C2C.', 'Coherence permits useful placement choices. It does not predict how a particular offload strategy affects token latency or training throughput.']}, {label: 'FROM DESK TO CLUSTER', title: 'A familiar GPU does not imply a familiar topology.', paragraphs: ['Developing on one Station gives you one primary AI GPU. Moving the job to GB300 NVL72 adds more GPUs per node and a rack-wide NVLink fabric; distributed placement and communication become new concerns.', 'If you instead connect two Stations, the new boundary is Ethernet. The shared GB300 name does not turn them into an NVL72 system.']}],
      sources: [{url: refs.station, label: 'Station memory and network specifications'}, {url: refs.stationMemory, label: 'Station coherent-memory guidance'}, {url: refs.ultra, label: 'Why two dies count as one GPU'}],
      check: {question: 'Does the two-die GPU provide two independent GPU slots for a two-rank job?', answer: 'No. The two compute dies form one CUDA accelerator. In the ordinary one-process-per-physical-GPU example, this selected Station provides one primary AI GPU; the optional RTX PRO card is outside this lesson.'}
    }
  }
};
