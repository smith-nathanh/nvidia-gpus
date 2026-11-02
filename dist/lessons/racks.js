// Curated lessons for the selected rack references. Evidence and asset provenance:
// docs/research/racks.md. Rates are supplied by the canonical hardware model.
const refs = {
  gbHardware: 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html',
  gbNetwork: 'https://docs.nvidia.com/dgx/dgxgb200-user-guide/networking.html',
  gbProduct: 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/',
  gbArchitecture: 'https://developer.nvidia.com/blog/nvidia-gb200-nvl72-delivers-trillion-parameter-llm-training-and-real-time-inference/',
  gbFabrics: 'https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/network-fabrics.html',
  rubinProduct: 'https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/',
  rubinArchitecture: 'https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/',
  scheduling: 'https://developer.nvidia.com/blog/unlock-exascale-performance-on-nvidia-gb200-nvl72-with-slurm-topology-aware-job-scheduling/',
  collectives: 'https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html'
};

export const figures = {
  'gb200-racks': {
    file: 'racks/gb200-racks.png',
    title: 'Four DGX GB200 racks, four NVLink domains',
    source: refs.gbHardware + '#rack-configuration',
    credit: 'NVIDIA DGX GB User Guide · GB200 rack front view',
    alt: 'Four DGX GB200 racks side by side. Per-rack labels identify management Ethernet switches, power shelves, ten compute nodes above nine NVLink switch trays and eight compute nodes below.',
    note: 'Read one column: 10 + 8 compute trays form one NVL72 rack. The other columns are separate racks. “9 NVLink switches” labels nine switch trays, each with two switch chips. The top Ethernet switches serve management.',
    minWidth: 1050, overviewFit: 'wide'
  },
  'gb200-tray': {
    file: 'racks/gb200-tray.png',
    title: 'One DGX GB200 tray and its rack connections',
    source: refs.gbHardware + '#compute-trays',
    credit: 'NVIDIA DGX GB User Guide · GB200 compute tray block diagram',
    alt: 'GB200 tray block diagram: two Grace CPUs each connect to two GPUs through C2C. Four ConnectX-7 adapters connect above the CPUs, two BlueField-3 devices flank them, and GPU NVLink connections descend through a cable cartridge to nine switch trays.',
    note: 'The upper enclosure is one server. The cable cartridge and nine switch trays below belong to the rack. Light blue means CPU–GPU C2C, pink means CPU-to-CPU CLinks, purple means PCIe, and the thin colored lines below the GPUs are peer NVLink.',
    minWidth: 1050
  },
  'rubin-superchip': {
    file: 'racks/rubin-superchip.png',
    title: 'Vera is the CPU; Rubin is the GPU',
    source: refs.rubinArchitecture,
    credit: 'NVIDIA Technical Blog · Vera Rubin, Figure 17',
    alt: 'Vera Rubin superchip board: two Rubin GPU packages above one Vera CPU with LPDDR5X SOCAMM memory beside it, NVLink 6 connectors at the top and a PCIe Gen6 midplane connector at the bottom.',
    note: 'Find the two GPU packages above the CPU. The LPDDR5X modules beside Vera are CPU memory. The figure’s “2 TB Fast Memory” combines CPU and GPU memory tiers; it does not mean 2 TB of HBM attached to either GPU.',
    minWidth: 1000, overviewFit: 'wide'
  },
  'rubin-tray': {
    file: 'racks/rubin-tray.png',
    title: 'Vera Rubin’s modular compute tray',
    source: refs.rubinArchitecture,
    credit: 'NVIDIA Technical Blog · Vera Rubin, Figure 18',
    alt: 'Annotated Vera Rubin tray with two superchips at the rear, NVLink 6 spine connectors along the back, a BlueField-4 DPU in the middle and ConnectX-9 SuperNICs toward the front. The original prints 14.4 TB/s tray NVLink bandwidth.',
    note: 'This January architecture figure shows component placement, not wiring. Its 14.4 TB/s tray NVLink uses the earlier 3.6 TB/s-per-GPU figure. The current product table used here gives 3 TB/s NVLink and 19.2 TB/s HBM per GPU; the article’s earlier HBM figure is 22 TB/s. “4 TB Fast Memory” combines CPU LPDDR and GPU HBM.',
    minWidth: 1100
  }
};

export const lessons = {
  gb200: {
    steps: [['The big picture', '18 nodes share a GPU fabric'], ['Inside one tray', 'Two different ways out'], ['Follow the data', 'Memory, NVLink or network'], ['Place a training job', 'Ranks across rack boundaries']],
    titles: ['Your node count<br><em>is not your fabric count.</em>', 'One tray.<br><em>Two communication tiers.</em>', 'Follow the tensor,<br><em>not the rack label.</em>', 'Two nodes can mean<br><em>two different paths.</em>'],
    intros: [
      'GB200 NVL72 brings a GPU fabric across server boundaries. Each of its 18 trays is a node, while all 72 GPUs share the rack’s NVLink domain.',
      'Start with the two gray CPU–GPU groups. Then distinguish the adapters above them from the NVLink connections below. Both leave the compute tray, but they do different jobs.',
      'A GB200 GPU has its own HBM, coherent access to paired Grace memory, rack-wide GPU peers, and a separate compute-network path. Select a destination to see the difference.',
      'Keep eight processes and eight GPUs fixed. Move only the second four-GPU node, and watch which communication boundary the job crosses.'
    ],
    reference: 'DGX GB200 tray and rack · GB200 product memory reporting',
    checked: 'November 2, 2026',
    overview: {
      figure: 'gb200-racks', diagram: 'rack',
      stageLabel: 'One GB200 NVL72 rack', boundaryLabel: '72 GPUs · one NVLink 5 domain',
      caption: 'The diagram shows two of 18 compute nodes. Every GPU joins the rack fabric; each node keeps its own host CPUs and operating system.',
      takeawayLabel: 'TWO BOUNDARIES',
      takeaway: 'A node request identifies servers. NVLink locality identifies how their GPUs communicate. On GB200 NVL72, GPU peer traffic can cross node boundaries while staying inside one rack’s fabric.',
      equation: [{value: '4 GPUs', label: 'per compute node'}, {value: '18 nodes', label: 'per NVL72 rack'}, {value: '72 GPUs', label: 'in one NVLink domain'}]
    },
    inside: {
      figure: 'gb200-tray',
      recipe: [{value: '1 GB200 superchip', label: '1 Grace CPU + 2 Blackwell GPUs'}, {value: '1 compute tray', label: '2 superchips · 4 GPUs'}, {value: '1 NVL72 rack', label: '18 trays · 72 GPUs'}],
      lenses: {
        groups: {
          label: 'CPU + GPU groups', title: 'Two gray groups make one four-GPU node.',
          text: 'Each Grace CPU connects to two Blackwell GPUs over the light-blue C2C links. The pink CLinks line joins the CPUs. These CPU connections are separate from the GPU NVLink lines leaving the bottom of the tray.',
          hint: 'GPU0–GPU3 are four accelerators. Each Blackwell GPU’s two internal compute dies do not double that count.',
          zones: [{left:31,top:21,width:20,height:35},{left:51,top:21,width:20,height:35}]
        },
        network: {
          label: 'NVLink + compute network', title: 'Trace downward for rack peers; upward for the compute network.',
          text: 'The thin lines below the GPUs fan out to the rack’s NVLink switches. The four gold ConnectX-7 adapters above Grace provide the external compute-network path. Their purple host connections are PCIe; GPU access can traverse C2C and host I/O without staging the payload in CPU RAM.',
          hint: 'An NVLink switch does not feed a ConnectX adapter. These are separate GPU communication paths.',
          zones: [{left:33,top:9,width:36,height:10},{left:6,top:58,width:89,height:32}]
        },
        storage: {
          label: 'Storage + management', title: 'The two blue adapters serve a different network.',
          text: 'BlueField-3 devices flank the CPUs and handle storage and in-band management in this DGX reference. Green E1.S and M.2 symbols are local NVMe storage. These drives hold persistent data; they are separate from Grace RAM and GPU HBM.',
          hint: 'Distinguish loading a dataset or checkpoint from exchanging tensors between training ranks.',
          zones: [{left:11,top:20,width:20,height:14},{left:70,top:18,width:18,height:17}]
        }
      },
      takeawayLabel: 'READ THE ENCLOSURES',
      takeaway: 'The upper outline is one server. The lower switch row is shared rack infrastructure. A four-GPU node therefore has access to GPU peers well beyond its own enclosure.'
    },
    paths: {
      memory: {
        label: 'Its own HBM', question: 'The weights are already in this GPU’s HBM3e.', title: 'Kernel memory access stays inside one GPU package.',
        steps: [['Local HBM3e', 'This GPU’s physical memory', 'memory'], ['Memory controllers', 'Local GPU interface', 'memory'], ['GPU compute', 'One CUDA accelerator', 'gpu']],
        impact: 'The selected capacity is 186 GB per GPU, derived from the product table’s 372 GB per two-GPU superchip. Adding the other GPUs’ capacity does not make it all local to this kernel.', source: refs.gbProduct
      },
      host: {
        label: 'Paired Grace memory', question: 'The tensor is in the paired Grace CPU’s LPDDR5X.', title: 'Coherent access crosses the CPU–GPU interface.',
        steps: [['Grace LPDDR5X', 'Paired CPU memory', 'cpu'], ['NVLink-C2C', 'Shared CPU–GPU group interface', 'cpu'], ['Blackwell GPU', 'Separate local HBM3e', 'gpu']],
        impact: 'Coherence makes the CPU and GPU memory relationship easier to program. It does not give a tensor in LPDDR the access cost of a tensor in local HBM. Data placement still matters.', source: refs.gbArchitecture
      },
      peer: {
        label: 'Another node, same rack', question: 'Rank 0 sends data to a GPU in a second tray of this rack.', title: 'The server boundary does not end NVLink.',
        steps: [['GPU · node 01', 'Source HBM', 'gpu'], ['NVLink 5 → NVSwitch → NVLink 5', 'One rack-wide domain', 'fabric'], ['GPU · node 02', 'Destination HBM', 'gpu']],
        impact: 'The peer-GPU path goes through the rack switches. It does not require the external ConnectX-7 network or a detour through host RAM. The interface budget is shared across communicating peers.', source: refs.gbFabrics
      },
      remote: {
        label: 'A different rack', question: 'The receiving GPU belongs to another NVL72 rack.', title: 'Cross-rack traffic uses ConnectX-7 and the compute fabric.',
        steps: [['GPU · rack A', 'C2C / host I/O to adapter', 'gpu'], ['ConnectX-7 → fabric → ConnectX-7', 'DGX compute network · InfiniBand', 'network'], ['GPU · rack B', 'Separate NVLink domain', 'gpu']],
        impact: 'In this DGX tray, the diagram attaches ConnectX-7 to Grace by PCIe. That I/O path can move GPU data without staging it in CPU RAM. A successful SSH connection exercises a different network from this training-data path.', source: refs.gbNetwork
      }
    },
    transferTakeaway: 'Name both endpoints before comparing rates. Local HBM, coherent CPU access, rack-wide peer NVLink and the external compute network describe different data paths.',
    experiment: {
      kind: 'rack-placement', title: '8 ranks on 2 four-GPU nodes.',
      intro: 'Assume one process per GPU and two whole compute trays. The rank is a process identity; GPU0 is a device index local to its node. Move the second node while keeping the allocation size fixed.',
      options: ['Both nodes in one rack', 'One node in each rack'],
      states: {
        same: {title: 'Rank 0 → rank 4 can use the same NVLink domain.', text: 'The processes occupy two operating systems, but all eight GPUs share the rack’s GPU fabric. The other 64 GPUs in that rack are outside this example allocation.'},
        split: {title: 'Rank 0 → rank 4 now crosses the ConnectX-7 fabric.', text: 'The process and GPU counts are unchanged. Communication between these two nodes now needs the external compute network because their GPUs belong to different NVLink domains.'}
      },
      caveat: 'Illustrative allocation, not a Slurm simulation. Asking for two nodes does not itself guarantee one-rack placement; topology configuration, policy and resource availability determine the actual assignment.',
      takeawayLabel: 'ASK ONE MORE QUESTION',
      takeaway: 'After “How many GPUs did I get?”, ask “Which NVLink domains contain them?” Node count alone no longer tells you the communication tier.',
      bridge: [
        {label: 'FROM CPU-ONLY SLURM', title: 'Allocation and rank mapping are separate.', paragraphs: ['The scheduler assigns nodes and GPUs; the launcher starts processes; the training framework maps work and communication to ranks. One process per GPU is the example here, not a hardware requirement.', 'Record the node and GPU used by each rank, then relate those nodes to the rack’s NVLink domain. That makes a slow cross-node transfer an architectural question you can investigate.']},
        {label: 'DURING TRAINING', title: 'A collective spans the participants you choose.', paragraphs: ['An AllReduce combines values from its participating ranks and returns the result to each. If that group spans two racks, communication must cross their compute network somewhere.', 'Actual NCCL algorithms can combine multiple paths and offloads. This exercise identifies the boundary that changed, without predicting an algorithm or completion time.']}
      ],
      sources: [{url:refs.scheduling,label:'NVIDIA: Slurm placement on GB200 NVL72'},{url:refs.collectives,label:'NCCL collective operations'}],
      check: {question: 'Do two GB200 nodes always communicate over InfiniBand?', answer: 'No. Two nodes in one NVL72 domain can exchange GPU data over rack-wide NVLink. Nodes in different racks use the external compute fabric. CPU and management traffic are separate cases.'}
    }
  },
  rubin: {
    steps: [['The big picture', 'Vera, Rubin and NVL72'], ['Inside one tray', 'Compute, scale-up, scale-out'], ['Follow the data', 'Separate memory and fabric tiers'], ['Place a training job', 'Keep communication locality visible']],
    titles: ['New chips.<br><em>The rack boundary still matters.</em>', 'One modular tray.<br><em>Three distinct roles.</em>', 'More memory tiers.<br><em>Different routes to each.</em>', 'Eight ranks.<br><em>Choose their fabric boundary.</em>'],
    intros: [
      'Vera is the host CPU; Rubin is the GPU. Their NVL72 superchip pairs one CPU with two GPUs. Eighteen four-GPU trays join a 72-GPU NVLink 6 domain.',
      'Use NVIDIA’s physical tray view to locate the processors, the rack-facing NVLink spine and the external network adapters. A physical neighbor is not necessarily on the same data path.',
      'HBM4, Vera’s LPDDR5X, NVLink 6 and ConnectX-9 solve different data-movement problems. Select the tensor’s destination before looking at a bandwidth number.',
      'A newer fabric does not remove placement decisions. Hold the job size fixed and compare two trays inside one NVLink domain with two trays in separate racks.'
    ],
    reference: 'Vera Rubin NVL72 · architecture tray composition, current product-table rates',
    checked: 'November 2, 2026',
    overview: {
      figure: 'rubin-superchip', diagram: 'rack',
      stageLabel: 'One Vera Rubin NVL72 rack', boundaryLabel: '72 GPUs · one NVLink 6 domain',
      caption: 'Two trays are shown out of 18. The shared fabric connects GPUs across trays; Vera CPUs and their LPDDR remain host resources associated with the compute nodes.',
      takeawayLabel: 'READ THE NAME IN LAYERS',
      takeaway: 'Rubin names the GPU. Vera Rubin names the CPU–GPU combination. NVL72 names the 72-GPU fabric domain. None of those names means that every memory byte is equally local to every rank.',
      equation: [{value:'2 Rubin GPUs',label:'per Vera CPU–GPU superchip'},{value:'4 GPUs',label:'per two-superchip tray'},{value:'72 GPUs',label:'across 18 trays'}]
    },
    inside: {
      figure: 'rubin-tray',
      recipe: [{value:'1 Vera Rubin superchip',label:'1 Vera CPU + 2 Rubin GPUs'},{value:'1 compute tray',label:'2 superchips · 4 GPUs'},{value:'1 NVL72 domain',label:'18 trays · 72 GPUs'}],
      lenses: {
        groups: {
          label: 'Compute + NVLink spine', title: 'Start at the rear: two superchips and the rack-facing spine.',
          text: 'The two outlined boards each contain one Vera CPU and two Rubin GPUs. The NVLink 6 spine connectors along the rear join GPU peer traffic to the rack fabric. The outline shows component placement, not the individual link wiring.',
          hint: 'The tray contains four GPUs. Two compute dies within each Rubin GPU still form one accelerator.',
          zones: [{left:7,top:18,width:25,height:25},{left:7,top:18,width:17,height:7}]
        },
        network: {
          label: 'Scale-out networking', title: 'Find the ConnectX-9 modules toward the front.',
          text: 'ConnectX-9 supplies the compute-network endpoints for GPU communication beyond the NVLink domain. These endpoints connect through the tray’s I/O architecture; they are a separate path from the rear NVLink spine.',
          hint: 'The figure’s 1.6 Tb/s per-GPU endpoint figure is not the current product table’s bidirectional networking aggregate.',
          zones: [{left:14,top:54,width:10,height:13},{left:29,top:54,width:9,height:13}]
        },
        storage: {
          label: 'Infrastructure services', title: 'Locate BlueField-4 between the compute and network modules.',
          text: 'BlueField-4 handles infrastructure tasks such as storage, networking and security. It serves a different role from both the Rubin GPUs that execute the model and the ConnectX-9 path carrying distributed compute traffic.',
          hint: 'A checkpoint or dataset request and an exchange between training ranks need not use the same network service.',
          zones: [{left:20,top:45,width:9,height:11}]
        }
      },
      takeawayLabel: 'FOLLOW FUNCTION, NOT POSITION',
      takeaway: 'NVLink carries peer-GPU traffic within the rack. ConnectX carries compute traffic beyond it. BlueField serves infrastructure. The physical tray puts these together without making them one interchangeable network.',
      deeper: {
        figure:'rubin-superchip', title:'“Fast memory” still contains two physical memory types.',
        paragraphs: ['The LPDDR5X modules alongside Vera are host memory. Each Rubin GPU has its own 288 GB of HBM4. The superchip’s capacity summary combines them, but a kernel sees different interfaces depending on where its data lives.', 'NVLink-C2C makes CPU–GPU memory access coherent. It does not turn host LPDDR into HBM, nor give one GPU the whole rack’s aggregate memory bandwidth.']
      }
    },
    paths: {
      memory: {
        label:'Its own HBM4', question:'The tensor is in this Rubin GPU’s local HBM4.', title:'The memory transaction stays local to the GPU.',
        steps:[['Local HBM4','288 GB on this GPU','memory'],['Memory controllers','GPU-local interface','memory'],['Rubin compute','One accelerator','gpu']],
        impact:'Keep per-GPU capacity and bandwidth separate from rack totals. A tensor sharded over many GPUs is distributed data; it is not one tensor backed by a single uniformly local HBM pool.', source:refs.rubinProduct
      },
      host: {
        label:'Paired Vera memory', question:'The data is in the paired Vera CPU’s LPDDR5X.', title:'NVLink-C2C connects distinct CPU and GPU memory tiers.',
        steps:[['Vera LPDDR5X','Paired CPU’s memory','cpu'],['NVLink-C2C','Coherent CPU–GPU group interface','cpu'],['Rubin GPU','Separate local HBM4','gpu']],
        impact:'Vera can provide a larger host-memory tier, but that data reaches the GPU through C2C. Treat offload and placement as software decisions; coherence alone does not promise automatic spilling or HBM-speed access.', source:refs.rubinProduct
      },
      peer: {
        label:'Another tray, same rack', question:'A GPU in another tray of this NVL72 rack needs the tensor.', title:'NVLink 6 crosses the tray boundary.',
        steps:[['Rubin · tray 01','Source GPU HBM4','gpu'],['NVLink 6 → switch fabric → NVLink 6','One 72-GPU domain','fabric'],['Rubin · tray 02','Destination GPU HBM4','gpu']],
        impact:'The rack’s fabric makes GPUs in other trays peer endpoints. The current per-GPU interface budget is shared across those peers; it is not a separate full-rate connection to each of the other 71 GPUs.', source:refs.rubinProduct
      },
      remote: {
        label:'A different rack', question:'The destination GPU is outside this NVL72 domain.', title:'ConnectX-9 connects the job to the external compute fabric.',
        steps:[['Rubin · rack A','GPU data through tray I/O','gpu'],['ConnectX-9 → fabric → ConnectX-9','External compute network','network'],['Rubin · rack B','Another NVLink domain','gpu']],
        impact:'The January architecture describes Spectrum-X Ethernet scale-out; the current product also lists Quantum-X800 InfiniBand. The deployed network determines the route. The endpoint line rate shown here does not predict end-to-end collective performance.', source:refs.rubinArchitecture
      }
    },
    transferTakeaway:'The current product rates and the January diagram rates differ. Keep the selected source, component scope and bandwidth direction attached to every number; a larger rack aggregate cannot replace a per-GPU path budget.',
    experiment: {
      kind:'rack-placement', title:'8 ranks on 2 Vera Rubin compute trays.',
      intro:'Use one process per GPU on two complete four-GPU trays. Rank 0 and rank 4 are on different trays in both arrangements; only their rack locality changes.',
      options:['Both trays in one rack','One tray in each rack'],
      states:{
        same:{title:'Rank 0 → rank 4 can remain on NVLink 6.',text:'All eight assigned GPUs belong to one rack-wide domain. The job uses only two of its 18 compute trays; sharing a fabric does not allocate the other GPUs to this job.'},
        split:{title:'Rank 0 → rank 4 now requires the compute network.',text:'Each group of four ranks retains its own rack’s NVLink connectivity. Traffic between the two groups crosses ConnectX-9 endpoints and the external fabric. Eight GPUs no longer describes one communication tier.'}
      },
      caveat:'An illustrative rank-to-hardware mapping, not a verified Rubin Slurm configuration or a throughput estimate. Actual placement, process affinity and transport selection depend on the deployed cluster and software.',
      takeawayLabel:'LOCALITY SURVIVES GENERATIONS',
      takeaway:'Newer GPUs and faster fabrics change interface budgets. The useful diagnostic question remains: which rank-to-rank exchanges stay inside one NVLink domain, and which must leave it?',
      bridge:[
        {label:'DISTRIBUTED MODEL WORK',title:'Place the communication group on the hardware map.',paragraphs:['A model can create several groups of ranks for different parallel operations. An all-to-all exchanges different pieces of data among participants; an AllReduce combines their values. Both need paths between the GPUs in the group.', 'First identify the participants, then their tray and rack locations. The operation’s name alone does not tell you whether it stays on NVLink.']},
        {label:'FROM YOUR SLURM MENTAL MODEL',title:'Keep allocation, execution and transport distinct.',paragraphs:['Node and GPU allocation supplies resources. Processes execute the training code on those resources. Communication libraries use the available GPU and network connections.', 'This example changes placement only. A real investigation also checks process-to-GPU mapping and the transport actually selected, rather than inferring either from an NVL72 product name.']}
      ],
      sources:[{url:refs.rubinArchitecture,label:'NVIDIA: Vera Rubin compute and network hierarchy'},{url:refs.collectives,label:'NCCL collective operations'}],
      check:{question:'Does “one rack-scale accelerator” mean one process with uniformly local memory?',answer:'No. NVL72 joins 72 GPUs through a fabric. Each GPU retains its own HBM, CPU memory is a separate tier, and distributed software still assigns work and communication to processes.'}
    }
  }
};
