// Curated eight-GPU DGX lessons. Asset provenance and source scopes:
// docs/research/servers.md. Rates are supplied by the existing model traces.
const refs = {
  hopper: 'https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html',
  h100: 'https://www.nvidia.com/en-us/data-center/h100/',
  h200: 'https://www.nvidia.com/en-us/data-center/h200/',
  b200: 'https://docs.nvidia.com/dgx/dgxb200-user-guide/introduction-to-dgxb200.html',
  b200Product: 'https://www.nvidia.com/en-us/data-center/dgx-b200/',
  b300: 'https://docs.nvidia.com/dgx/dgxb300-user-guide/introduction-to-dgxb300.html',
  b300Product: 'https://www.nvidia.com/en-us/data-center/dgx-b300/',
  b300Sheet: 'https://dam-cdn.nvd.orangelogic.com/AssetLink/625w0j7hnw6f07ui7fo63211mti2v08o.pdf',
  slurm: 'https://docs.nvidia.com/dgx-cloud/slurm/latest/cluster-user-guide.html',
  parallelism: 'https://docs.nvidia.com/nemo/megatron-bridge/nightly/parallelisms.html',
  nccl: 'https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html',
  rdma: 'https://docs.nvidia.com/cuda/gpudirect-rdma/'
};

export const figures = {
  'servers-hopper-topology': {
    file: 'servers/dgx-h100-topology.png',
    title: 'The shared DGX H100/H200 topology',
    source: `${refs.hopper}#dgx-h100-200-system-topology`,
    credit: 'NVIDIA DGX H100/H200 User Guide · System Topology',
    alt: 'Two Intel CPU sockets above eight GPUs. All eight GPUs connect to four NVSwitch chips below. Orange ConnectX-7 compute-network modules sit on PCIe paths above the GPUs; storage-network cards and NVMe devices appear at the top.',
    note: 'NVIDIA explicitly publishes this topology for both DGX H100 and DGX H200. Read the lower GPU/NVSwitch fabric separately from the upper PCIe host and peripheral paths. HBM and CPU DIMMs are not drawn.',
    minWidth: 1000
  },
  'servers-b200-topology': {
    file: 'servers/dgx-b200-topology.png',
    title: 'DGX B200: x86 hosts above an eight-GPU fabric',
    source: `${refs.b200}#dgx-b200-system-topology`,
    credit: 'NVIDIA DGX B200 User Guide · System Topology',
    alt: 'DGX B200 topology with two Intel CPUs, eight B200 GPUs, two NVSwitch chips connected to all GPUs, orange ConnectX-7 network modules, blue BlueField-3 cards, and NVMe drives.',
    note: 'This is DGX B200, not a GB200 Grace-based tray. The two switches at the bottom serve all eight GPUs. Their separate purple PCIe connection is a control path, not the GPU peer-data fabric. The original image has limited resolution.',
    minWidth: 900
  },
  'servers-b300-topology': {
    file: 'servers/dgx-b300-topology.png',
    title: 'DGX B300: distinguish the two PCIe paths',
    source: `${refs.b300}#dgx-b300-system-topology`,
    credit: 'NVIDIA DGX B300 User Guide · System Topology',
    alt: 'DGX B300 topology with two Intel CPUs, eight ConnectX-8 modules, eight B300 GPUs, and two NVSwitch chips. Thick purple GPU-to-network-module arrows are PCIe Gen6; thinner host-side arrows are PCIe Gen5. BlueField-3 cards and NVMe drives are at the top.',
    note: 'Use the legend: the GPU-to-ConnectX-8 connection is PCIe Gen6; the CPU-facing path is PCIe Gen5. The many lines beneath the GPUs are the separate NVLink fabric. Memory capacities are not shown; the DGX datasheet and hardware guide disagree on HBM capacity.',
    minWidth: 1100
  }
};

const checked = 'November 2, 2026';
const steps = [
  ['The big picture', 'Find the GPU domain'],
  ['Inside one server', 'Read NVIDIA’s wiring'],
  ['Follow the data', 'Separate the paths'],
  ['Place a training job', '8 GPUs, one or two nodes']
];
const z = (left, top, width, height) => ({left, top, width, height});

function paths({gpu, memory, nic, hardware, product, localImpact, hostImpact, peerImpact, remoteImpact, gen6 = false}) {
  return {
    memory: {
      label: 'Its own HBM', question: 'A kernel needs a tensor already stored on this GPU.',
      title: 'The access stays inside one GPU’s memory subsystem.',
      steps: [[memory, 'Physical memory belonging to this GPU', 'memory'], ['Memory controllers', 'Local to the accelerator', 'memory'], [gpu, 'The kernel consumes the tensor', 'gpu']],
      impact: localImpact, source: product
    },
    host: {
      label: 'CPU memory', question: 'The next input batch is in the server’s CPU RAM.',
      title: 'Host-to-GPU transfers use PCIe.',
      steps: [['Intel CPU + RAM', 'Host-side input buffer', 'cpu'], ['PCIe Gen5 host path', 'Separate from GPU peer NVLink', 'cpu'], [gpu + ' + HBM', 'Device-side working buffer', 'gpu']],
      impact: hostImpact, source: hardware
    },
    peer: {
      label: 'Another GPU, same server', question: 'A tensor must reach a different GPU in this DGX.',
      title: 'NVSwitch connects the server’s eight GPU memories.',
      steps: [['GPU 0 + its HBM', 'Source accelerator', 'gpu'], ['NVLink → NVSwitch → NVLink', 'One eight-GPU domain', 'fabric'], ['GPU 4 + its HBM', 'Separate destination memory', 'gpu']],
      impact: peerImpact, source: hardware
    },
    remote: {
      label: 'A GPU in another server', question: 'The receiving rank runs in a second DGX, even in the same rack.',
      title: 'Crossing this server boundary adds the compute network.',
      steps: [['GPU + ' + nic, gen6 ? 'PCIe Gen6 GPU–NIC path' : 'GPU–NIC PCIe path', 'gpu'], ['InfiniBand or Ethernet', 'External compute-network fabric', 'network'], [nic + ' + GPU', 'A different eight-GPU domain', 'gpu']],
      impact: remoteImpact, source: hardware
    }
  };
}

function placement({name, nic, hardware, bridge, takeaway, extraSources = []}) {
  return {
    kind: 'server-placement',
    title: '8 training processes. One GPU per process.',
    intro: `Place eight ranks on ${name}. First use all eight GPUs in one server; then use four GPUs in each of two servers. The remaining physical GPUs are outside this example allocation.`,
    options: ['8 GPUs in one server', '4 GPUs in each of two servers'],
    states: {
      same: {
        title: 'Rank 0 → rank 4 can stay on NVLink.',
        text: 'All eight ranks occupy one server and one NVLink domain. Different CPU affinities inside that server do not divide the GPU fabric into two four-GPU islands.'
      },
      split: {
        title: 'Rank 0 → rank 4 now crosses the compute network.',
        text: `The job still has eight GPUs. The two groups communicate through ${nic} and the external network; putting both chassis in the same rack does not join their NVLink domains.`
      }
    },
    caveat: 'Illustrative allocation, not a Slurm command or a predicted NCCL route. Whether partial-node allocations are allowed, how CPUs are bound, and which nodes are available depend on cluster policy. No runtime or speedup is implied.',
    takeawayLabel: 'THE PLACEMENT QUESTION', takeaway,
    bridge: [
      {
        label: 'FROM CPU-ONLY SLURM', title: 'A node allocation and a rank mapping answer different questions.',
        paragraphs: ['The scheduler grants resources. The launcher starts processes, and each process in this example selects one GPU. Rank 4 is a process identity; after the move, it uses a GPU in server B rather than local GPU 4 in server A.', 'For a real job, inspect both the node list and each process’s GPU assignment. A total of eight GPUs alone does not describe its communication locality.']
      },
      bridge
    ],
    sources: [{url: hardware, label: 'NVIDIA server topology'}, {url: refs.nccl, label: 'NCCL collective operations'}, {url: refs.slurm, label: 'Slurm resources and GPU binding'}, ...extraSources],
    check: {
      question: 'If both servers are in the same rack, can their GPUs use this server’s NVSwitch fabric to reach one another?',
      answer: 'No. In this selected DGX configuration, NVLink connects the eight GPUs inside each server. Traffic between servers uses the compute network, regardless of physical rack proximity.'
    }
  };
}

const hopperLenses = {
  groups: {
    label: 'The GPU fabric', title: 'Start below the GPUs, not at the CPUs.',
    text: 'Follow the bundles from GPU 0–7 to the four turquoise NVSwitch chips. Every GPU participates in the same peer fabric, including GPUs drawn under different CPU sockets.',
    hint: 'The left/right halves organize host attachment; they do not mark two isolated GPU domains.',
    zones: [z(17, 43, 74, 39)]
  },
  network: {
    label: 'The host path', title: 'Now follow a purple line upward from a GPU.',
    text: 'PCIe connects each GPU into the x86 host’s I/O hierarchy. CPU RAM belongs to the host, while HBM belongs to a GPU; neither memory is drawn here. The pale-blue horizontal arrow joins the two CPU sockets.',
    hint: 'CPU–GPU PCIe and GPU–GPU NVLink are different paths with different jobs.',
    zones: [z(27, 15, 55, 16), z(17, 30, 74, 14)]
  },
  storage: {
    label: 'Network + storage', title: 'The orange modules are the way out to other servers.',
    text: 'Eight ConnectX-7 compute adapters sit above the GPUs. The blue cards at the top serve storage networking; the green drive icons are local NVMe. A network port, an SSD and HBM are three different resources.',
    hint: 'Compute traffic leaves through ConnectX, not through an external port on the server’s NVSwitch chips.',
    zones: [z(17, 30, 74, 11), z(17, 0, 32, 14), z(61, 0, 31, 14)]
  }
};

export const lessons = {
  h100: {
    steps, checked, reference: 'DGX H100 · eight 80 GB SXM GPUs · two Intel Xeon 8480C hosts',
    titles: ['One server.<br><em>Eight connected GPUs.</em>', 'One chassis contains<br><em>two different interconnects.</em>', 'A tensor’s location<br><em>chooses its path.</em>', 'Eight ranks fit here.<br><em>Placement still matters.</em>'],
    intros: ['Start with the node you know from Slurm. DGX H100 adds eight accelerators, each with its own HBM, and a dedicated GPU fabric inside that one server.', 'Read this diagram in layers: GPU peer traffic below, host I/O above. The two CPU sockets do not split the eight GPUs into separate NVLink domains.', 'Local memory access, a host transfer, a peer exchange and a cross-node exchange exercise different parts of the machine.', 'An eight-GPU job can fill one DGX H100 or span two partially allocated servers. Keep the GPU count fixed and watch the communication boundary move.'],
    overview: {
      figure: 'servers-hopper-topology', diagram: 'server', stageLabel: 'One DGX H100 server', boundaryLabel: '8 GPUs · one NVLink domain',
      caption: 'Logical view: one host/OS boundary encloses eight GPU memories and the NVLink fabric. Other servers connect through compute NICs.',
      takeawayLabel: 'THE IDEA TO KEEP',
      takeaway: 'For this DGX H100, the server boundary is also the NVLink-domain boundary. A second server adds a network hop, even when it is beside the first.',
      equation: [{value: '1', label: 'server / OS'}, {value: '8', label: 'GPUs with local HBM'}, {value: '1', label: 'NVLink domain'}]
    },
    inside: {
      figure: 'servers-hopper-topology',
      recipe: [{value: '2 x86 CPUs', label: 'Host execution + system RAM'}, {value: '8 H100 GPUs', label: '80 GB HBM3 on each'}, {value: '4 NVSwitches', label: 'One eight-GPU peer fabric'}],
      lenses: hopperLenses,
      takeawayLabel: 'TWO PATHS, TWO PURPOSES',
      takeaway: 'The CPU feeds and controls GPU work through PCIe. GPU peers exchange data through NVLink and NVSwitch. An NVLink exchange does not need to pass through CPU RAM.'
    },
    paths: paths({gpu: 'H100 GPU', memory: 'Local 80 GB HBM3', nic: 'ConnectX-7', hardware: refs.hopper, product: refs.h100,
      localImpact: 'A tensor allocated on GPU 0 consumes GPU 0’s memory. The server’s 640 GB total does not give that tensor a single 640 GB local allocation.',
      hostImpact: 'Batch preparation can run on the CPUs, then copy inputs into HBM. CPU memory placement and process affinity can affect the host path; the peer NVLink rate does not describe this transfer.',
      peerImpact: 'A model partition on GPU 0 can exchange activations with GPU 4 through NVLink despite their different host attachments. Each GPU still owns its own HBM.',
      remoteImpact: 'With supported GPUDirect RDMA, GPU data can reach the NIC without staging in CPU RAM. The external fabric is a new communication tier, not an extension of the internal NVLink domain.'}),
    transferTakeaway: 'Ask which memory owns the tensor and whether its peer is inside this server. Those two facts separate local HBM, PCIe, NVLink and network traffic.',
    experiment: placement({name: 'DGX H100', nic: 'ConnectX-7', hardware: refs.hopper,
      takeaway: 'Count allocated GPUs, then locate them. Eight ranks within one DGX can communicate inside its GPU fabric; four plus four across DGX servers need the network.',
      bridge: {label: 'DURING TRAINING', title: 'A gradient collective follows the allocation.', paragraphs: ['An AllReduce combines values across participating ranks and returns the result to each. In the split placement, some of that communication must cross between servers.', 'NCCL may use several links and algorithms. The picture identifies the changed hardware boundary; it is not a literal collective schedule.']}})
  },
  h200: {
    steps, checked, reference: 'DGX H200 · eight 141 GB SXM GPUs · shared H100/H200 server topology',
    titles: ['More memory per GPU.<br><em>The same server boundary.</em>', 'A familiar fabric.<br><em>A larger local working set.</em>', 'More HBM changes fit.<br><em>It does not erase distance.</em>', 'Keep eight ranks.<br><em>Move the server boundary.</em>'],
    intros: ['DGX H200 keeps the eight-GPU Hopper server organization. The key change from DGX H100 is the larger, faster HBM on each accelerator, not a rack-wide GPU domain.', 'NVIDIA publishes one topology for DGX H100 and H200. Use it to separate what changed in GPU memory from what stayed the same in connectivity.', '141 GB on an H200 is local to that GPU. CPU RAM, another GPU’s HBM and a second server remain distinct destinations.', 'Larger GPU memories can change how you partition a model. They do not change what happens when an eight-rank allocation spans two DGX servers.'],
    overview: {
      figure: 'servers-hopper-topology', diagram: 'server', stageLabel: 'One DGX H200 server', boundaryLabel: '8 H200 GPUs · one NVLink domain',
      caption: 'The same host and fabric organization as DGX H100, with H200 SXM GPUs. This is not the separately sold H200 NVL configuration.',
      takeawayLabel: 'WHAT H200 CHANGES',
      takeaway: 'H200 gives each GPU 141 GB of HBM3e instead of H100 SXM’s 80 GB. The local NVLink domain still contains eight GPUs inside one server.',
      equation: [{value: '141 GB', label: 'local HBM per GPU'}, {value: '8', label: 'separate GPU memories'}, {value: '1,128 GB', label: 'summed server HBM'}]
    },
    inside: {
      figure: 'servers-hopper-topology',
      recipe: [{value: 'Same host layout', label: '2 Intel CPUs + PCIe'}, {value: 'Different HBM', label: '141 GB HBM3e per GPU'}, {value: 'Same domain', label: '8 GPUs through 4 NVSwitches'}],
      lenses: {
        ...hopperLenses,
        groups: {...hopperLenses.groups, title: 'The GPU fabric is shared; the memories are still separate.', text: 'All eight H200 GPUs reach the four NVSwitch chips. Each GPU has its own 141 GB HBM3e, omitted from this wiring drawing. NVLink enables communication between those memories; it does not turn them into one local memory bank.'},
        network: {...hopperLenses.network, title: 'The host remains a two-socket Intel server.', text: 'H200 in this DGX is attached through PCIe, as H100 is. It is not the Grace Hopper superchip: there is no Grace CPU–GPU C2C path here. The pale-blue line is the CPU socket interconnect.'}
      },
      takeawayLabel: 'CAPACITY AND CONNECTIVITY',
      takeaway: 'A larger local memory may let a partition keep more data on one GPU. If the application still exchanges tensors with peers, it still pays the cost of the corresponding path.'
    },
    paths: paths({gpu: 'H200 GPU', memory: 'Local 141 GB HBM3e', nic: 'ConnectX-7', hardware: refs.hopper, product: refs.h200,
      localImpact: 'H200 offers more room for weights, activations and runtime buffers on each GPU. A model fitting in 141 GB is a different question from its full training state fitting there.',
      hostImpact: 'Host offload still adds PCIe transfers. Extra GPU HBM can reduce the need for offload in some workloads, but neither software placement nor a speedup follows automatically.',
      peerImpact: 'The peer interface remains fourth-generation NVLink. More HBM capacity and bandwidth on H200 do not imply a faster or larger peer-GPU domain than this H100 server topology.',
      remoteImpact: 'The compute adapters remain ConnectX-7 in this reference. More local HBM does not change a cross-server transfer into an NVLink transfer.'}),
    transferTakeaway: 'Separate three questions: does the working set fit, how fast can its local GPU read it, and how must ranks exchange it? HBM capacity answers only the first.',
    experiment: placement({name: 'DGX H200', nic: 'ConnectX-7', hardware: refs.hopper,
      takeaway: 'Memory capacity and rank locality are independent decisions. H200 increases the local memory budget; splitting the allocation still introduces the external network.',
      bridge: {label: 'WHEN PLANNING A JOB', title: 'A server total is not a per-rank budget.', paragraphs: ['With one rank per GPU, each rank starts with one GPU’s 141 GB physical HBM budget. Frameworks partition or replicate model state; they do not automatically present 1,128 GB as one rank’s local allocation.', 'Leave room for activations, optimizer state, communication buffers and runtime overhead. This lesson maps hardware boundaries, not the memory required by a particular training recipe.']}})
  },
  b200: {
    steps, checked, reference: 'DGX B200 · eight Blackwell GPUs · two Intel Xeon 8570 hosts',
    titles: ['B200 GPUs.<br><em>An x86 DGX server.</em>', 'New GPU fabric.<br><em>Still a PCIe host.</em>', 'B200 is the GPU.<br><em>GB200 is a different system.</em>', 'Eight GPUs stay eight.<br><em>Their locality can change.</em>'],
    intros: ['The “B” names the Blackwell GPU. DGX B200 puts eight of them in an Intel-hosted server. It does not use the Grace-based CPU–GPU arrangement of GB200 NVL72.', 'Look for two NVSwitch chips beneath eight GPUs, then trace the separate host and NIC paths above them. Fewer switch chips than Hopper does not mean fewer connected GPUs.', 'Follow the endpoints rather than the generation name. Blackwell GPU peer traffic uses NVLink; this DGX’s Intel host traffic uses PCIe.', 'Use one process per GPU. Each B200 has two compute dies that work as one CUDA accelerator, so this remains an eight-GPU, eight-rank example.'],
    overview: {
      figure: 'servers-b200-topology', diagram: 'server', stageLabel: 'One DGX B200 server', boundaryLabel: '8 B200 GPUs · one NVLink 5 domain',
      caption: 'Two x86 hosts and eight B200 GPUs share a chassis. The GPU fabric ends at that server; its ConnectX adapters connect it to the cluster.',
      takeawayLabel: 'DECODE THE NAME',
      takeaway: 'B200 is a GPU; DGX B200 is a complete eight-GPU server. GB200 combines Grace CPUs and Blackwell GPUs into superchips with a different host path and rack-scale arrangement.',
      equation: [{value: '2', label: 'Intel host CPUs'}, {value: '8', label: 'B200 GPU packages'}, {value: '1', label: 'eight-GPU domain'}]
    },
    inside: {
      figure: 'servers-b200-topology',
      recipe: [{value: '8 GPU packages', label: '2 dies each, still 8 GPUs'}, {value: '2 NVSwitches', label: 'Connect every GPU'}, {value: '2 Intel hosts', label: 'PCIe, not NVLink-C2C'}],
      lenses: {
        groups: {label: 'Eight GPUs, two switches', title: 'Both switches serve all eight GPUs.', text: 'Trace the bundles beneath GPU 0–7. Every GPU reaches both turquoise switches. Their left/right positions do not make two four-GPU islands, and the two dies inside each GPU do not add extra ranks.', hint: 'The thin purple control connection to the switches is separate from the bundled NVLink data paths.', zones: [z(18, 44, 72, 38)]},
        network: {label: 'The x86 host path', title: 'CPU 0 and CPU 1 are Intel hosts, not Grace.', text: 'The purple PCIe lines carry host I/O. The blue horizontal line joins the CPU sockets. NVLink 5 connects GPU peers below; it does not replace the PCIe connection from these CPUs to their GPUs.', hint: 'Do not import a GB200 superchip’s coherent CPU–GPU C2C link into this diagram.', zones: [z(27, 15, 55, 16), z(18, 30, 72, 14)]},
        storage: {label: 'Two network roles', title: 'Orange is compute networking; blue is infrastructure I/O.', text: 'The orange ConnectX-7 modules carry traffic to other servers. The blue BlueField-3 cards serve storage and management networking. NVMe drive icons describe persistent storage, not the 1,440 GB summed GPU HBM.', hint: 'NIC traffic and local NVLink traffic use separate interfaces on the GPU side.', zones: [z(18, 30, 72, 12), z(17, 0, 32, 15), z(60, 0, 32, 15)]}
      },
      takeawayLabel: 'THE SHAPE OF THE MACHINE',
      takeaway: 'Blackwell changes the GPU and peer fabric, but this reference remains an eight-GPU x86 server. Keep its PCIe host path separate from its NVLink GPU path.'
    },
    paths: paths({gpu: 'B200 GPU', memory: 'Local 180 GB HBM3e', nic: 'ConnectX-7', hardware: refs.b200, product: refs.b200Product,
      localImpact: 'The selected DGX reports 1,440 GB across eight GPUs: 180 GB per GPU by division. Use that reference-specific capacity, not the larger architecture-level maximum.',
      hostImpact: 'CPU preparation or offload crosses the PCIe host interface. A B200’s NVLink 5 peer bandwidth says nothing about how quickly Intel-host RAM can supply its HBM.',
      peerImpact: 'GPU 0 and GPU 4 can exchange tensors through either side of the shared NVSwitch fabric. The per-GPU NVLink budget is shared among peer traffic, not replicated for each destination.',
      remoteImpact: 'Leaving the server uses ConnectX-7, even though the internal fabric is newer NVLink 5. A faster GPU interconnect does not automatically raise the external network’s line rate.'}),
    transferTakeaway: 'Generation names do not identify a route. For DGX B200, CPU → GPU means PCIe; GPU → local GPU means NVLink; GPU → remote server means a NIC and network.',
    experiment: placement({name: 'DGX B200', nic: 'ConnectX-7', hardware: refs.b200, extraSources: [{url: refs.parallelism, label: 'NVIDIA on parallelism'}],
      takeaway: 'Eight B200 GPUs can occupy one NVLink 5 domain or two domains joined by a network. The number of GPU dies does not change the number of ranks in this example.',
      bridge: {label: 'MODEL PARALLELISM', title: 'Place the group that communicates together.', paragraphs: ['Tensor-parallel ranks exchange intermediate results while computing a layer. Where that group lives determines whether its exchanges remain within one server or cross the compute network.', 'Data, tensor and pipeline parallelism can be combined. This example isolates the hardware boundary; it does not prescribe an optimal parallelism configuration.']}})
  },
  b300: {
    steps, checked, reference: 'DGX B300 · x86 server topology · datasheet HBM totals retained',
    titles: ['Blackwell Ultra.<br><em>One eight-GPU server.</em>', 'Follow the NIC path.<br><em>Then the host path.</em>', 'Two PCIe generations.<br><em>Different endpoints.</em>', 'Faster networking.<br><em>Still a separate domain.</em>'],
    intros: ['DGX B300 is the Intel-hosted Blackwell Ultra server. Its GPUs share one local NVLink fabric; ConnectX-8 supplies the next tier for communication between servers.', 'This diagram makes a useful distinction visible: the GPU-to-network-adapter connection and the CPU-facing connection are not the same PCIe generation.', 'A GPU can have a newer NIC connection while retaining a different host path. Read the source and destination before attaching a bandwidth number.', 'Move eight ranks between one full server and two half-filled servers. ConnectX-8 changes the network capability, not the location of the NVLink-domain boundary.'],
    overview: {
      figure: 'servers-b300-topology', diagram: 'server', stageLabel: 'One DGX B300 server', boundaryLabel: '8 B300 GPUs · one NVLink 5 domain',
      caption: 'The selected DGX datasheet reports 2.1 TB total HBM. The hardware guide reports 8 × 288 GB; the discrepancy is unresolved and no exact individual capacity is assigned here.',
      takeawayLabel: 'THE IDEA TO KEEP',
      takeaway: 'DGX B300 has eight GPUs and x86 hosts, unlike GB300 NVL72’s Grace-based rack. Its faster compute-network tier connects servers without merging their local NVLink domains.',
      equation: [{value: '8', label: 'GPU packages'}, {value: '2', label: 'Intel host CPUs'}, {value: '1', label: 'local GPU domain'}]
    },
    inside: {
      figure: 'servers-b300-topology',
      recipe: [{value: 'NVLink 5', label: 'GPU ↔ GPU through 2 switches'}, {value: 'PCIe Gen6', label: 'GPU ↔ ConnectX-8'}, {value: 'PCIe Gen5', label: 'CPU-facing host path'}],
      lenses: {
        groups: {label: 'The GPU fabric', title: 'The two turquoise switches join eight GPU packages.', text: 'The colored bundles under the GPUs are peer NVLink. Every GPU joins this one domain. A package contains two compute dies but presents one CUDA accelerator, so there are eight GPUs here.', hint: 'The thin PCIe control line to NVSwitch is not the path for a tensor moving between GPU peers.', zones: [z(10, 43, 82, 38)]},
        network: {label: 'GPU to compute NIC', title: 'Find the thick purple arrows above the GPUs.', text: 'Each GPU has a PCIe Gen6 connection to an orange ConnectX-8 module. Those adapters provide the external compute-network path. They do not attach as outputs of the NVSwitch fabric below.', hint: 'The legend distinguishes thick Gen6 arrows from thinner Gen5 arrows; follow both ends of a line.', zones: [z(10, 29, 82, 15)]},
        storage: {label: 'CPU + infrastructure', title: 'Now trace the thinner lines toward the Intel CPUs.', text: 'The host-side I/O path is PCIe Gen5. At the top, BlueField-3 cards and NVMe drives serve infrastructure and storage. CPU RAM and GPU HBM are separate memories, both omitted from the drawing.', hint: 'A Gen6 GPU–NIC link is not a claim that every CPU–GPU or storage transfer is Gen6.', zones: [z(9, 0, 83, 28)]}
      },
      takeawayLabel: 'READ AN INTERFACE AS A PAIR OF ENDPOINTS',
      takeaway: '“PCIe Gen6” describes the GPU–ConnectX-8 connection here. CPU host traffic follows a different path; GPU peer traffic follows NVLink.'
    },
    paths: paths({gpu: 'B300 GPU', memory: 'Local HBM3e', nic: 'ConnectX-8', hardware: refs.b300, product: refs.b300Sheet, gen6: true,
      localImpact: 'The selected DGX datasheet gives 2.1 TB capacity and 62 TB/s HBM bandwidth for the whole server. Those aggregates are not one GPU’s capacity or access rate; individual values remain unspecified because published sources conflict.',
      hostImpact: 'Input batches or offloaded state cross the CPU-facing PCIe Gen5 path. The Gen6 link drawn between the GPU and ConnectX-8 does not establish the host-memory transfer ceiling.',
      peerImpact: 'Peer data stays on the server’s NVLink 5 fabric. NVSwitch does not make every GPU’s HBM equally local, and the system-wide bandwidth sum is not a rate for one pair.',
      remoteImpact: 'The GPU reaches ConnectX-8 over PCIe Gen6, then uses the external network. GPUDirect RDMA can avoid host-RAM staging; software support and the rest of the fabric still determine achieved throughput.'}),
    transferTakeaway: 'Keep three scopes separate: one GPU’s HBM, its specific interface to another component, and a sum across eight GPUs. A system aggregate cannot substitute for a missing local rate.',
    experiment: placement({name: 'DGX B300', nic: 'ConnectX-8', hardware: refs.b300,
      takeaway: 'ConnectX-8 makes the network tier more capable, but the split job still crosses a boundary the one-server job can avoid. Peak link rates alone cannot predict the training-step difference.',
      bridge: {label: 'WHEN READING A CLUSTER SPEC', title: 'Match the published number to the resource you need.', paragraphs: ['The selected DGX B300 datasheet reports 2.1 TB HBM and 62 TB/s summed HBM bandwidth. The hardware guide’s 288 GB per GPU conflicts with that total; this lesson does not resolve the difference by inventing a per-rank budget.', 'For an actual run, inspect the installed GPUs and available device memory. Then check rank placement separately: a memory-capacity figure does not tell you which fabric the collective will use.']}})
  }
};
