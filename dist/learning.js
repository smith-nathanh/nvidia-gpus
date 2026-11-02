import { systems, getModel, gpuMemoryLabel } from './models.js';
import { lessonSteps as pilotSteps, learningPage as pilotPage, figures as pilotFigures } from './lessons/gb300.js';
import { lessons as serverLessons, figures as serverFigures } from './lessons/servers.js';
import { lessons as rackLessons, figures as rackFigures } from './lessons/racks.js';
import { lessons as coherentLessons, figures as coherentFigures } from './lessons/coherent.js';

export const lessons = { ...serverLessons, ...rackLessons, ...coherentLessons };
export const figures = { ...pilotFigures, ...serverFigures, ...rackFigures, ...coherentFigures };
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const sourceLink = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗<span class="sr-only"> (opens in a new tab)</span></a>`;
const takeaway = (label, text) => `<div class="lesson-takeaway"><span>${label}</span><p>${text}</p></div>`;

export function lessonSteps(id = 'gb300') { return lessons[id]?.steps || pilotSteps; }
export function lessonOptions(id) {
  const lesson = lessons[id];
  return {
    lenses: lesson ? Object.keys(lesson.inside.lenses) : ['groups','network','storage'],
    paths: lesson ? Object.keys(lesson.paths) : ['memory','host','peer','remote'],
    defaultPath: lesson && !lesson.paths.peer ? 'memory' : 'peer'
  };
}
function pathNumbers(s, key) {
  const trace = getModel(s.id).traces[key];
  if (key !== 'memory' || s.memoryGBps === null) return trace;
  return {...trace, note:s.layout === 'shared'
    ? 'Published total LPDDR5X interface ceiling, shared by CPU and GPU. This is not the C2C link rate or an independent bandwidth budget for each processor.'
    : 'Published local-memory interface ceiling. This is not a send-plus-receive link sum or a prediction of workload throughput.'};
}
export function lessonReferences(id) {
  const lesson = lessons[id];
  if (!lesson) return [];
  const keys = [lesson.overview.figure,lesson.inside.figure,lesson.inside.deeper?.figure].filter(Boolean);
  const refs = keys.map(key=>({title:figures[key].credit,url:figures[key].source,supports:figures[key].note}));
  refs.push(...lesson.experiment.sources.map(ref=>({title:ref.label,url:ref.url,supports:'Supports the lesson’s workload and architecture explanation.'})));
  return refs.filter((ref,i)=>refs.findIndex(r=>r.url === ref.url) === i);
}
function officialFigure(key, compact = false) {
  const f = figures[key];
  return `<figure class="nvidia-figure ${compact ? 'overview-official' : ''} ${f.overviewFit === 'portrait' ? 'portrait-figure' : ''}"><div class="figure-topline"><span>NVIDIA’S DIAGRAM</span><button id="enlarge-${esc(key)}" data-figure="${esc(key)}" aria-label="Enlarge ${esc(f.title)}">Enlarge ↗</button></div><button class="figure-image-button" data-figure="${esc(key)}" aria-label="Enlarge ${esc(f.title)}"><img src="./assets/nvidia/${esc(f.file)}" alt="${esc(f.alt)}"></button><figcaption>${sourceLink(f.source, f.credit)}<p>${esc(f.note)}</p></figcaption></figure>`;
}
export function figureDialog(key) {
  const f = figures[key];
  return `<p>${esc(f.note)}</p><p class="figure-scroll-help">Scroll inside the image to read the original labels on a narrow screen.</p><div class="figure-full"><img style="min-width:${f.minWidth || (key === 'rack' ? 600 : 950)}px" src="./assets/nvidia/${esc(f.file)}" alt="${esc(f.alt)}"></div><p class="figure-credit">© NVIDIA · ${sourceLink(f.source, f.credit)}. Original figure; teaching outlines are shown only in the lesson.</p>`;
}
function gpuCells(s, {allocated = s.gpusPerNode, start = 0, ranks = false} = {}) {
  return `<div class="lesson-gpus ${s.gpusPerNode === 8 ? 'eight-gpus' : ''}">${Array.from({length:s.gpusPerNode}, (_, i) => `<span class="lesson-gpu ${i >= allocated ? 'unallocated-gpu' : ''}"><b>${ranks && i < allocated ? `Rank ${start + i}` : `GPU ${i}`}</b><small>${i >= allocated ? 'outside this job' : ranks ? `GPU ${i} · local HBM` : 'local HBM'}</small></span>`).join('')}</div>`;
}
function server(s, title, options = {}) {
  return `<div class="lesson-server"><div class="server-label"><strong>${esc(title)}</strong><span>${options.ranks ? `${options.allocated ?? s.gpusPerNode} allocated of ${s.gpusPerNode} GPUs` : 'one server / OS'}</span></div><div class="lesson-host">${s.cpusPerNode} ${esc(s.hostKind === 'pcie' ? 'x86 host CPUs' : s.cpuName + 's')}<span>+ their host memory</span></div>${gpuCells(s,options)}</div>`;
}
const fabricDescription = s => s.switchTrays ? `${s.switchTrays} switch trays · ${s.switchTrays * s.switchesPerTray} NVSwitch chips` : s.nvSwitches ? `${s.nvSwitches} NVSwitch chips inside this server` : 'Rack-wide GPU peer communication · switch counts omitted';
function rackOverview(s, o) {
  return `<div class="rack-domain"><div class="domain-caption"><span class="domain-dot"></span>${esc(o.boundaryLabel)}</div><div class="overview-servers"><button id="open-server" class="server-open" data-lesson="1" aria-label="Look inside compute node 01">${server(s,'Compute node 01 ↗')}</button>${server(s,'Compute node 02')}</div><div class="fabric-branches" aria-hidden="true"><i></i><i></i></div><div class="lesson-fabric"><strong>NVLink ${s.nvlinkGeneration} switch fabric</strong><span>${esc(fabricDescription(s))}</span></div><div class="more-servers"><span aria-hidden="true">↑</span><strong>${s.nodes - 2} more servers connect here too</strong><span>Each adds ${s.gpusPerNode} GPUs and ${s.cpusPerNode} CPUs</span></div></div>`;
}
function serverOverview(s, o) {
  return `<div class="rack-domain server-domain"><div class="domain-caption"><span class="domain-dot"></span>${esc(o.boundaryLabel)}</div><div class="lesson-host server-host">2 x86 host CPUs<span>Host software + CPU RAM</span></div><div class="host-path-label"><span aria-hidden="true">↕</span> PCIe host access</div>${gpuCells(s)}<div class="gpu-egress" aria-label="Parallel paths from the GPUs"><div><span class="egress-link">↕ GPU peer NVLink</span><div class="lesson-fabric"><strong>NVLink ${s.nvlinkGeneration} + NVSwitch</strong><span>${esc(fabricDescription(s))}</span></div></div><div><span class="egress-link network-link">↕ GPU / NIC I/O</span><div class="lesson-nic"><strong>${esc(s.nicName)}</strong><span>Compute network adapters</span></div></div></div><p class="boundary-caption">Both paths start at the GPUs. NVSwitch stays inside the server; the NIC reaches other servers.</p></div><button class="lesson-link" data-lesson="1">Read the actual server wiring →</button>`;
}
function coherentMap(s, {memoryTarget = '', workingSetGB} = {}) {
  const shared = s.layout === 'shared';
  const cpuCapacity = s.id === 'station' ? '496 GB LPDDR5X' : s.id === 'gh200' ? 'Up to 480 GB LPDDR5X' : '128 GB shared LPDDR5X';
  return `<div class="coherent-domain ${shared ? 'shared-domain' : ''}"><div class="domain-caption">${shared ? 'GB10 · one CPU tile + one GPU tile' : `${s.id === 'station' ? 'GB300 Desktop' : 'GH200'} · one CPU + one GPU`}</div><div class="coherent-processors"><div class="processor-block cpu-processor"><strong>${esc(s.cpuName)}</strong><span>Host software</span></div><div class="c2c-bridge"><span>↔</span><b>${shared ? 'Coherent C2C' : 'NVLink-C2C'}</b></div><div class="processor-block gpu-processor"><strong>${esc(s.gpuName)}</strong><span>One primary CUDA device</span></div></div>${shared ? `<div class="shared-memory-branches" aria-hidden="true"></div><div class="physical-memory shared-memory"><strong>128 GB LPDDR5X</strong><span>One physical pool shared by CPU + GPU</span></div>` : `<div class="separate-memory"><div class="physical-memory cpu-memory ${memoryTarget === 'host' ? 'memory-target' : ''}"><span class="memory-local-line">↕ local to the CPU</span><strong>${cpuCapacity}</strong><span>Host physical memory</span>${memoryTarget === 'host' ? `<b class="buffer-resident">${workingSetGB} GB example buffer here</b>` : ''}</div><div class="physical-memory gpu-memory ${memoryTarget === 'gpu' ? 'memory-target' : ''}"><span class="memory-local-line">↕ local to the GPU</span><strong>${esc(gpuMemoryLabel(s))}</strong><span>GPU physical memory</span>${memoryTarget === 'gpu' ? `<b class="buffer-resident">${workingSetGB} GB example buffer here</b>` : ''}</div></div>`}<p class="boundary-caption">${shared ? 'Count the memory once. CPU and GPU allocations compete for capacity and bandwidth.' : 'Coherent access connects the address space. The two physical memories retain different locality and bandwidth.'}</p></div>`;
}
function overview(s, lesson) {
  const o = lesson.overview;
  const logical = o.diagram === 'server' ? serverOverview(s,o) : o.diagram === 'rack' ? rackOverview(s,o) : coherentMap(s);
  return `<div class="overview-grid expanded-overview ${o.diagram}"><section class="logical-stage" aria-label="Logical view of ${esc(s.name)}"><div class="stage-heading"><span class="eyebrow">THE LOGICAL VIEW</span><span>${esc(o.stageLabel)}</span></div>${logical}<p class="stage-caption">${esc(o.caption)}</p></section>${officialFigure(o.figure,true)}</div>${takeaway(o.takeawayLabel,o.takeaway)}${o.equation ? `<div class="lesson-relationships">${o.equation.map(e=>`<span><b>${esc(e.value)}</b><small>${esc(e.label)}</small></span>`).join('')}</div>` : ''}`;
}
function inside(s, lesson, state) {
  const c = lesson.inside, lens = c.lenses[state.lens] || Object.values(c.lenses)[0], f = figures[c.figure];
  const zones = (lens.zones || []).map(z=>`<span style="left:${z.left}%;top:${z.top}%;width:${z.width}%;height:${z.height}%"></span>`).join('');
  return `${c.recipe ? `<div class="node-recipe">${c.recipe.map((r,i)=>`${i ? '<i aria-hidden="true">→</i>' : ''}<span><b>${esc(r.value)}</b><small>${esc(r.label)}</small></span>`).join('')}</div>` : ''}<section class="diagram-lesson" aria-label="Guided reading of ${esc(f.title)}"><div class="lesson-controls" aria-label="Choose a part of the architecture">${Object.entries(c.lenses).map(([key,l],i)=>`<button id="lens-${key}" data-lens="${key}" aria-pressed="${key === state.lens}" class="${key === state.lens ? 'active' : ''}"><span>0${i + 1}</span>${esc(l.label)}</button>`).join('')}</div><div class="diagram-reading" aria-live="polite"><h2>${esc(lens.title)}</h2><p>${esc(lens.text)}</p></div><p class="tray-scroll-hint">Wide architecture diagram · scroll sideways to follow the connections, or enlarge it below.</p><div class="tray-scroll" tabindex="0" aria-label="NVIDIA architecture diagram; scroll horizontally on small screens"><div class="tray-annotated" style="min-width:${f.minWidth || 900}px"><img src="./assets/nvidia/${esc(f.file)}" alt="${esc(f.alt)}"><div class="figure-highlights" aria-hidden="true">${zones}</div></div></div><div class="diagram-reading-footer"><p>${esc(lens.hint)}</p><button id="enlarge-inside" data-figure="${c.figure}">Enlarge original ↗</button></div><div class="figure-credit"><p>© NVIDIA · ${sourceLink(f.source,f.credit)} · ${zones ? 'Outlines added by this learning tool.' : 'Original figure.'}</p><p>${esc(f.note)}</p></div></section>${takeaway(c.takeawayLabel,c.takeaway)}${c.deeper ? `<details class="silicon-detail"><summary>Go one level deeper: ${esc(c.deeper.title)}</summary><div class="silicon-grid">${officialFigure(c.deeper.figure)}<div><h2>${esc(c.deeper.title)}</h2>${c.deeper.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<button data-explore="gpu" class="lesson-link">Explore memory and interfaces →</button></div></div></details>` : ''}`;
}
function transfers(s, lesson, state) {
  const key = Object.hasOwn(lesson.paths,state.storyPath) ? state.storyPath : lessonOptions(s.id).defaultPath;
  const p = lesson.paths[key], trace = pathNumbers(s,key);
  return `<section class="transfer-lesson"><div class="destination-label">Where does the data need to go?</div><div class="destination-options" aria-label="Data destination">${Object.entries(lesson.paths).map(([id,path])=>`<button id="destination-${id}" data-story-path="${id}" aria-pressed="${id === key}" class="${id === key ? 'active' : ''}">${esc(path.label)}</button>`).join('')}</div><div class="transfer-result" aria-live="polite"><p class="transfer-question">${esc(p.question)}</p><h2>${esc(p.title)}</h2><div class="route-picture ${key}" aria-label="Illustrative data route">${p.steps.map(([title,sub,kind],i)=>`${i ? '<span class="route-arrow" aria-hidden="true">→</span>' : ''}<div class="route-stop ${kind}"><strong>${esc(title)}</strong><span>${esc(sub)}</span></div>`).join('')}</div><div class="transfer-details"><div><h3>What this means for your code</h3><p>${esc(p.impact)}</p></div><div class="path-budget"><strong>${esc(trace.rate[0])}</strong><span>${esc(trace.rateLabel[0])}</span><p>${esc(trace.note)}</p></div></div><p class="figure-credit">Logical path, not exact routing or measured performance. ${sourceLink(p.source,'NVIDIA reference')}</p></div></section>${takeaway('THE IDEA TO KEEP',lesson.transferTakeaway || 'Locate the data before comparing link rates. A local memory interface, a peer fabric and an external network have different scopes.')}<button class="lesson-link" data-explore="cluster">Inspect the full network and component specifications →</button>`;
}
function placementDomain(s, label, nodes, {rack = false} = {}) {
  return `<div class="placement-domain ${nodes.length === 1 ? 'one-node-domain' : ''}"><span class="placement-domain-label">${esc(label)}</span>${nodes.map(n=>server(s,n.name,{ranks:true,start:n.start,allocated:n.allocated})).join('')}<div class="job-fabric">${rack ? 'Rack-wide' : 'Server-local'} NVLink ${s.nvlinkGeneration} switch fabric</div></div>`;
}
function jobPlacement(s, e, split) {
  const rack = e.kind === 'rack-placement';
  const nodesA = rack ? [{name:'Node 01',start:0,allocated:4},...(!split ? [{name:'Node 02',start:4,allocated:4}] : [])] : [{name:'Server A',start:0,allocated:split ? 4 : 8}];
  const nodesB = [{name:rack ? 'Node 01' : 'Server B',start:4,allocated:4}];
  return `<div class="job-placement ${split ? 'split' : 'same'} ${rack ? 'rack-job' : 'server-job'}">${placementDomain(s,rack ? 'RACK A · NVLINK DOMAIN A' : 'SERVER A · ONE NVLINK DOMAIN',nodesA,{rack})}${split ? `<div class="between-domains"><b>${esc(s.nicName)}</b><span aria-hidden="true">↕</span><strong>Compute network</strong><span aria-hidden="true">↕</span><b>${esc(s.nicName)}</b></div>${placementDomain(s,rack ? 'RACK B · NVLINK DOMAIN B' : 'SERVER B · A SEPARATE NVLINK DOMAIN',nodesB,{rack})}` : ''}</div>`;
}
function memoryPlacement(s,e,split) {
  const trace = pathNumbers(s,split ? 'host' : 'memory');
  return `<div class="memory-placement">${coherentMap(s,{memoryTarget:split ? 'host' : 'gpu',workingSetGB:e.workingSetGB})}<div class="buffer-route"><span class="eyebrow">THE GPU’S ACCESS PATH</span><strong>${split ? 'Host LPDDR5X → CPU → NVLink-C2C → GPU' : 'Local HBM → memory controllers → GPU'}</strong><p>${esc(trace.rate[0])} · ${esc(trace.rateLabel[0])}</p><small>${esc(trace.note)}</small></div></div>`;
}
function sharedBudget(s,e,split) {
  const budget = e.budgets[split ? 'split' : 'same'];
  const total = budget.cpu + budget.gpu + budget.other, over = total > s.gpuMemoryGB;
  const allocations = [['cpu',budget.cpu,'CPU allocations'],['gpu',budget.gpu,'GPU allocations'],['other',budget.other,'OS + other (example)']];
  return `<div class="budget-example"><div class="budget-header"><span>ONE PHYSICAL MEMORY POOL</span><strong>${s.gpuMemoryGB} GB LPDDR5X</strong></div><div class="memory-budget-bar" role="img" aria-label="${total} GB of example allocations, ${over ? total - s.gpuMemoryGB + ' GB above physical capacity' : s.gpuMemoryGB - total + ' GB unallocated'}">${allocations.map(([kind,value,label])=>`<span class="budget-segment ${kind}" style="flex:${value}"><b>${value} GB</b><small>${label}</small></span>`).join('')}${!over && total < s.gpuMemoryGB ? `<span class="budget-segment free" style="flex:${s.gpuMemoryGB - total}"><b>${s.gpuMemoryGB - total} GB</b><small>unallocated</small></span>` : ''}</div><p class="budget-scale-note">${over ? 'The bar shows requested allocations, which together exceed the physical pool.' : 'The bar shows how these illustrative allocations share the physical pool.'}</p><dl class="budget-amounts">${allocations.map(([,v,l])=>`<div><dt>${l}</dt><dd>${v} GB</dd></div>`).join('')}<div class="budget-total ${over ? 'over-budget' : ''}"><dt>Total requested</dt><dd>${total} / ${s.gpuMemoryGB} GB</dd></div></dl><div class="budget-outcome ${over ? 'over-budget' : ''}">${over ? `${total - s.gpuMemoryGB} GB over physical capacity` : `${s.gpuMemoryGB - total} GB remains in this example`}</div></div>`;
}
function experiment(s,lesson,state) {
  const e = lesson.experiment, split = state.placement === 'split', variant = e.states[split ? 'split' : 'same'];
  const job = ['server-placement','rack-placement'].includes(e.kind);
  const visual = job ? jobPlacement(s,e,split) : e.kind === 'shared-budget' ? sharedBudget(s,e,split) : memoryPlacement(s,e,split);
  const quantity = job ? '<b>8 ranks · 8 allocated GPUs</b><span>One process per GPU in this example</span>' : e.kind === 'shared-budget' ? `<b>${s.gpuMemoryGB} GB physical capacity</b><span>CPU + GPU + OS share the budget</span>` : `<b>${e.workingSetGB} GB example buffer</b><span>Same size · different physical memory</span>`;
  return `<section class="job-lesson experiment-${e.kind}"><div class="job-setup"><div><span class="eyebrow">A CONCRETE EXAMPLE</span><h2>${esc(e.title)}</h2><p>${esc(e.intro)}</p></div><div class="allocation-summary">${quantity}</div></div><div class="placement-switch" aria-label="Example scenario">${['same','split'].map((key,i)=>`<button id="placement-${key}" data-placement="${key}" aria-pressed="${state.placement === key}" class="${state.placement === key ? 'active' : ''}">${esc(e.options[i])}</button>`).join('')}</div><div class="allocation-result" aria-live="polite">${visual}<div class="placement-verdict"><span class="eyebrow">${job ? 'SAME GPU COUNT · DIFFERENT CONNECTIVITY' : 'CHANGE ONE THING · FOLLOW THE CONSEQUENCE'}</span><h3>${esc(variant.title)}</h3><p>${esc(variant.text)}</p></div></div><p class="lesson-note">${esc(e.caveat)}</p></section>${takeaway(e.takeawayLabel,e.takeaway)}<div class="training-bridge">${(e.bridge || []).map(b=>`<div><span class="eyebrow">${esc(b.label)}</span><h2>${esc(b.title)}</h2>${b.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</div>`).join('')}</div><p class="lesson-sources">Read the mechanism: ${(e.sources || []).map(r=>sourceLink(r.url,r.label)).join(' · ')}</p><details class="knowledge-check"><summary>Check your understanding: ${esc(e.check.question)}</summary><p>${esc(e.check.answer)}</p></details>`;
}
export function learningPage(state) {
  if (state.systemId === 'gb300' || !lessons[state.systemId]) return pilotPage(state);
  const s = systems[state.systemId], lesson = lessons[s.id], step = Math.max(0,Math.min(3,state.lesson));
  const content = [()=>overview(s,lesson),()=>inside(s,lesson,state),()=>transfers(s,lesson,state),()=>experiment(s,lesson,state)][step]();
  return `<div class="lesson-topline"><span>${esc(s.name)} <span class="lesson-edition">/ ${esc(s.family.toUpperCase())}</span></span><span>0${step + 1} / 04</span></div><header class="lesson-intro"><h1 id="learning-title" tabindex="-1">${lesson.titles[step]}</h1><p>${esc(lesson.intros[step])}</p></header>${content}<nav class="lesson-pagination" aria-label="Lesson navigation">${step ? `<button id="lesson-prev" data-lesson="${step - 1}">← ${esc(lesson.steps[step - 1][0])}</button>` : '<span class="lesson-duration">Four ideas, one architecture.</span>'}${step < 3 ? `<button id="lesson-next" class="lesson-next" data-lesson="${step + 1}">${esc(lesson.steps[step + 1][0])}<span>→</span></button>` : '<button id="lesson-finish" class="lesson-next" data-explore="rack">Explore the hardware <span>→</span></button>'}</nav><footer class="lesson-footer"><span>${esc(lesson.reference)}<br>Diagrams © NVIDIA · references checked ${esc(lesson.checked)}</span><button data-dialog="notes">Configuration & number notes ↗</button></footer>`;
}
