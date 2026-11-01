import { sources, system, views, components, traces } from './data.js';

const $ = (q) => document.querySelector(q);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initial = location.hash.slice(1);
const state = { view: views[initial] ? initial : 'rack', selected: views[initial]?.selected || 'rack', labels: true, bandwidth: 'oneway', trace: 'peer', node: 1, tour: -1, zoom: 1 };
const order = Object.keys(views);
const tourSteps = [
  { view: 'rack', component: 'rack', title: 'Start with the domain', text: 'NVL72 is the group of 72 GPUs that share NVLink. This reference fits that group into one rack.' },
  { view: 'node', component: 'node', title: 'Open one compute node', text: 'Each of the 18 trays is an independent server. Count two CPUs and four GPUs inside it.' },
  { view: 'node', component: 'superchip', title: 'Find the superchips', text: 'Each outlined group pairs one Grace CPU with two GPUs. That is a GB300 superchip; two groups make a node.' },
  { view: 'gpu', component: 'hbm', title: 'Look at one GPU', text: 'Two dies function as one accelerator. HBM is its local memory; NVLink is the path to the other GPUs.' },
  { view: 'cluster', component: 'network', title: 'Cross the rack boundary', text: 'A transfer to another rack uses ConnectX-8 and the compute network. Each rack keeps its own NVLink domain.' }
];
const text = (x, y, value, cls = '', anchor = 'start') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(value)}</text>`;
function box(x, y, w, h, title, sub = '', kind = 'neutral', component = '', go = '', extra = '') {
  return `<g ${component ? `class="component ${state.selected === component ? 'is-selected' : ''}" role="button" tabindex="0" aria-label="${esc(title + (sub ? ': ' + sub : ''))}" data-component="${component}" ${go ? `data-go="${go}"` : ''}` : ''} ${extra}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="box ${kind}"/>${text(x + 16, y + (sub ? 28 : h / 2 + 5), title, 'box-title')}${sub ? text(x + 16, y + 49, sub, 'box-sub') : ''}${go ? text(x + w - 17, y + 27, '↗', 'box-arrow', 'end') : ''}</g>`;
}
function wire(d, kind = 'green', active = false, label = '', x = 0, y = 0) {
  return `<path d="${d}" class="wire ${kind} ${active ? 'flow' : ''}"/>${label && state.labels ? `<g class="wire-label">${text(x, y, label, kind)}</g>` : ''}`;
}
const label = (x, y, value, kind = '') => state.labels ? text(x, y, value, `annotation ${kind}`) : '';
function svg(body, desc) { return `<svg viewBox="0 0 1000 620" role="group" aria-labelledby="svg-title svg-desc"><title id="svg-title">${esc(views[state.view].title)}</title><desc id="svg-desc">${esc(desc)}</desc><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill="#d9dfd5"/></pattern></defs><rect width="1000" height="620" fill="url(#dots)"/>${body}</svg>`; }

function rackDiagram() {
  let b = `<rect x="38" y="34" width="272" height="545" rx="12" class="rack-shell"/>${text(58, 64, 'NVL72 / RACK 01', 'rack-label')}${text(58, 84, 'Schematic arrangement', 'muted-tiny')}`;
  let n = 0;
  for (let i = 0; i < 27; i++) {
    const sw = i >= 9 && i < 18;
    const y = 105 + i * 15;
    if (!sw) n++;
    b += `<g class="component rack-row ${!sw && n === state.node ? 'current-node' : ''}" role="button" tabindex="0" data-component="${sw ? 'fabric' : 'node'}" ${!sw ? `data-go="node" data-node="${n}"` : ''} aria-label="${sw ? `NVLink switch tray ${i - 8}: two switch ASICs` : `Open compute node ${n}: four GPUs and two CPUs`}"><rect x="58" y="${y}" width="230" height="12" rx="2" class="${sw ? 'switch-row' : 'compute-row'}"/>${text(65, y + 9, sw ? `SW ${String(i - 8).padStart(2, '0')}` : `NODE ${String(n).padStart(2, '0')}`, 'row-label')}${Array.from({ length: sw ? 2 : 4 }, (_, k) => `<rect x="${sw ? 197 + 40 * k : 173 + 27 * k}" y="${y + 3}" width="${sw ? 31 : 19}" height="6" rx="1" class="slot ${sw ? 'switch-slot' : ''}"/>`).join('')}</g>`;
  }
  b += box(58, 522, 230, 36, 'Power · cooling · management', '', 'neutral', 'infrastructure');
  b += `${text(360, 61, 'THE LOGICAL CONNECTION', 'section-label')}${text(360, 82, 'All 72 GPUs join the same switched fabric.', 'annotation')}`;
  b += `<rect x="355" y="110" width="605" height="430" rx="12" class="domain-outline"/>${text(375, 136, 'ONE 72-GPU NVLINK DOMAIN', 'domain-label')}`;
  b += box(390, 156, 250, 82, 'Compute node 01', '4 GPUs · 2 Grace CPUs', 'neutral', 'node', 'node', 'data-node="1"');
  b += box(680, 156, 245, 82, 'Compute node 18', '4 GPUs · 2 Grace CPUs', 'neutral', 'node', 'node', 'data-node="18"');
  const active = state.trace === 'peer';
  b += wire('M 515 238 V 286', 'green', active);
  b += wire('M 800 238 V 286', 'green', active);
  b += box(390, 286, 535, 105, 'NVLink 5 switch fabric', '9 switch trays × 2 NVSwitch ASICs = 18 switches', 'gpu', 'fabric');
  b += Array.from({ length: 18 }, (_, i) => `<rect x="${406 + i * 28}" y="360" width="20" height="10" rx="2" class="switch-chip"/>`).join('');
  b += wire('M 515 391 V 432', 'green', active);
  b += wire('M 800 391 V 432', 'green', active);
  b += box(390, 432, 250, 76, 'Nodes 02–09', '32 more GPUs', 'neutral', 'node', 'node', 'data-node="2"');
  b += box(680, 432, 245, 76, 'Nodes 10–17', '32 more GPUs', 'neutral', 'node', 'node', 'data-node="10"');
  b += label(360, 575, '18 NVLink links per GPU · one to each switch ASIC', 'green');
  b += `<path d="M 310 112 H 335 V 195 H 380" class="callout"/>${text(359, 602, 'Click any tray to open its node architecture.', 'annotation')}`;
  return svg(b, 'Rack with 18 clickable compute trays and nine NVLink switch trays. A logical diagram shows the nodes connected through 18 switch ASICs in one NVLink domain.');
}

function nodeDiagram() {
  let b = `${text(35, 35, `COMPUTE NODE ${String(state.node).padStart(2, '0')} / 1 OF 18 TRAYS`, 'section-label')}${text(35, 57, 'Each outlined CPU + GPU group is one GB300 superchip.', 'annotation')}`;
  const host = state.trace === 'host';
  for (let p = 0; p < 2; p++) {
    const x = 35 + p * 480;
    b += `<rect x="${x}" y="80" width="450" height="307" rx="12" class="superchip-boundary ${state.selected === 'superchip' ? 'boundary-selected' : ''}"/><g class="component" role="button" tabindex="0" data-component="superchip" aria-label="GB300 superchip ${p + 1}: one Grace CPU and two GPUs"><rect x="${x + 8}" y="85" width="434" height="31" rx="4" class="superchip-hit"/>${text(x + 18, 107, `GB300 SUPERCHIP ${p + 1}`, 'superchip-label')}</g>`;
    b += box(x + 22, 123, 406, 46, 'LPDDR5X · CPU system memory', '', 'cpu', 'cpu');
    b += wire(`M ${x + 225} 169 V 186`, 'amber', host);
    b += box(x + 100, 186, 250, 58, `Grace CPU ${p}`, '72 Arm cores', 'cpu', 'cpu');
    b += `<g class="component" role="button" tabindex="0" data-component="c2c" aria-label="Inspect NVLink C2C CPU to GPU connections"><rect x="${x + 35}" y="249" width="380" height="47" rx="5" fill="transparent"/>${wire(`M ${x + 225} 244 V 268 H ${x + 125} V 300 M ${x + 225} 268 H ${x + 330} V 300`, 'amber', host)}${label(x + 145, 288, 'NVLink-C2C', 'amber')}</g>`;
    for (let k = 0; k < 2; k++) {
      const gx = x + 22 + k * 209;
      b += box(gx, 300, 197, 65, `GPU ${p * 2 + k}`, 'Blackwell Ultra · HBM3e', 'gpu', 'gpu', 'gpu');
      b += wire(`M ${gx + 98} 365 V 426`, 'green', !host);
    }
  }
  b += box(35, 426, 930, 63, 'To the rack’s NVLink switch fabric', 'Every GPU has 18 links to the rack’s 18 switch ASICs', 'gpu', 'fabric');
  b += label(620, 415, '900 GB/s per GPU in each direction', 'green');
  b += box(35, 525, 295, 68, '4 × ConnectX-8', 'Compute network · 800 Gb/s per GPU', 'net', 'nic');
  b += box(350, 525, 295, 68, '1 × BlueField-3', 'Storage + in-band management', 'net', 'dpu');
  b += box(665, 525, 300, 68, 'Local NVMe storage', '1 boot drive + 4 cache drives', 'storage', 'storage');
  b += `${text(35, 511, 'OTHER NODE COMPONENTS · I/O WIRING OMITTED', 'muted-tiny')}`;
  return svg(b, 'Two GB300 superchips in one server node. Each superchip has one Grace CPU, LPDDR5X memory and two GPUs connected through NVLink C2C. All four GPUs connect to external rack NVLink switches. Network adapters and NVMe storage are listed separately; their I/O wiring is omitted.');
}

function gpuDiagram() {
  let b = `${text(38, 35, 'ONE BLACKWELL ULTRA GPU', 'section-label')}${text(38, 57, 'Package-level view · one of the rack’s 72 accelerators', 'annotation')}`;
  b += `<rect x="145" y="87" width="710" height="390" rx="18" class="package"/>${text(165, 113, 'GPU PACKAGE', 'domain-label')}`;
  for (let i = 0; i < 8; i++) {
    const x = 183 + (i % 4) * 169;
    const y = i < 4 ? 139 : 385;
    b += box(x, y, 128, 58, `HBM ${i}`, 'HBM3e stack', 'gpu', 'hbm');
    b += wire(`M ${x + 64} ${i < 4 ? y + 58 : y} V ${i < 4 ? 225 : 357}`, 'green', state.trace === 'memory');
  }
  b += box(219, 225, 250, 132, 'Compute die 0', 'Compute engines + cache', 'die-box', 'die');
  b += box(535, 225, 250, 132, 'Compute die 1', 'Compute engines + cache', 'die-box', 'die');
  b += Array.from({ length: 8 }, (_, i) => `<rect x="${238 + (i % 4) * 51}" y="${301 + Math.floor(i / 4) * 18}" width="40" height="12" rx="2" class="compute-unit"/><rect x="${554 + (i % 4) * 51}" y="${301 + Math.floor(i / 4) * 18}" width="40" height="12" rx="2" class="compute-unit"/>`).join('');
  b += wire('M 469 283 H 535 M 469 299 H 535', 'green', false);
  b += `${text(502, 272, 'NV-HBI', 'muted-tiny', 'middle')}${label(467, 375, '10 TB/s die-to-die')}${label(210, 462, '8 stacks · up to 288 GB¹ · up to 8 TB/s local memory', 'green')}`;
  b += wire('M 309 477 V 515', 'amber', state.trace === 'host');
  b += wire('M 689 477 V 515', 'green', state.trace === 'peer');
  b += box(145, 515, 330, 70, 'NVLink-C2C → Grace', 'Coherent CPU–GPU interface', 'cpu', 'c2c');
  b += box(525, 515, 330, 70, 'NVLink 5 → peer GPUs', 'Through the rack’s NVSwitch fabric', 'gpu', 'fabric');
  return svg(b, 'One GPU package containing two compute dies connected by NV HBI and eight HBM3e stacks. Separate external interfaces lead to the Grace CPU via NVLink C2C and other GPUs via the rack NVLink switches.');
}

function clusterDiagram() {
  let b = `${text(35, 35, 'TWO RACKS / ILLUSTRATIVE COMPUTE NETWORK', 'section-label')}${text(35, 57, 'Each rack remains a separate 72-GPU NVLink domain.', 'annotation')}`;
  for (let k = 0; k < 2; k++) {
    const x = 35 + k * 535;
    b += `<rect x="${x}" y="90" width="430" height="248" rx="12" class="domain-outline"/>${text(x + 20, 118, `RACK ${k ? 'B' : 'A'} · NVL72 DOMAIN`, 'domain-label')}`;
    b += box(x + 20, 137, 390, 70, '18 nodes · 72 GPUs', '36 Grace CPUs + local memory', 'neutral', 'rack', 'rack');
    b += wire(`M ${x + 110} 207 V 239 M ${x + 320} 207 V 239`, 'green', false);
    b += box(x + 20, 239, 390, 71, 'NVLink 5 switch fabric', '900 GB/s per GPU · each direction', 'gpu', 'fabric');
    b += wire(`M ${x + 215} 338 V 368`, 'blue', state.trace === 'remote');
    b += box(x + 45, 368, 340, 67, 'ConnectX-8 SuperNICs', '800 Gb/s per GPU · 4 adapters / node', 'net', 'nic');
  }
  b += wire('M 250 435 V 481 H 500 V 515 M 785 435 V 481 H 500', 'blue', state.trace === 'remote');
  b += box(190, 515, 620, 74, 'External GPU compute network', 'Quantum-X800 InfiniBand or Spectrum-X Ethernet', 'net', 'network');
  b += label(300, 466, '100 GB/s per direction per GPU · before overhead', 'blue');
  return svg(b, 'Two separate NVL72 rack domains connected through ConnectX-8 adapters and an external InfiniBand or Ethernet compute network. This is a conceptual path; network switch tiers and port wiring are not shown.');
}

function render() {
  const focused = document.activeElement;
  const focusId = focused?.id;
  const focusLabel = focused?.getAttribute('aria-label');
  const wasComponent = focused?.hasAttribute('data-component');
  $('#scale-nav').innerHTML = order.map((key, i) => `<button class="scale-item ${state.view === key ? 'active' : ''}" data-view="${key}" ${state.view === key ? 'aria-current="page"' : ''}><span class="scale-number">0${i + 1}</span><span><strong>${views[key].name}</strong><small>${views[key].subtitle}</small></span><span class="scale-arrow">↗</span></button>`).join('');
  $('#stats').innerHTML = [['72', 'Blackwell Ultra GPUs'], ['36', 'Grace CPUs'], ['18', 'Compute nodes'], ['9', 'NVLink switch trays']].map(([v, l]) => `<div class="stat"><span class="stat-value">${v}</span><span class="stat-label">${l}</span></div>`).join('');
  const crumbs = [{ label: 'GB300 NVL72', view: 'rack' }];
  if (state.view === 'node' || state.view === 'gpu') crumbs.push({ label: `Node ${String(state.node).padStart(2, '0')}`, view: 'node' });
  if (state.view === 'gpu') crumbs.push({ label: 'Individual GPU', view: 'gpu' });
  if (state.view === 'cluster') crumbs.push({ label: 'Between racks', view: 'cluster' });
  $('#breadcrumbs').innerHTML = crumbs.map((c, i) => `${i ? '<span class="crumb-separator">/</span>' : '<span class="crumb-icon">▦</span>'}<button data-view="${c.view}" ${i === crumbs.length - 1 ? 'aria-current="location"' : ''}>${c.label}</button>`).join('');
  $('#view-kicker').textContent = views[state.view].kicker;
  $('#view-title').textContent = views[state.view].title;
  $('#diagram').innerHTML = ({ rack: rackDiagram, node: nodeDiagram, gpu: gpuDiagram, cluster: clusterDiagram })[state.view]();
  updateZoom();
  $('#labels-button').setAttribute('aria-pressed', String(state.labels));
  $('#label-indicator').textContent = state.labels ? 'ON' : 'OFF';
  renderInspector();
  renderTrace();
  renderTour();
  if (focusId && document.getElementById(focusId)) document.getElementById(focusId).focus({ preventScroll: true });
  else if (wasComponent && focusLabel) {
    const match = [...document.querySelectorAll('[data-component]')].find(el => el.getAttribute('aria-label') === focusLabel);
    if (match) match.focus({ preventScroll: true });
    else { $('#view-title').tabIndex = -1; $('#view-title').focus({ preventScroll: true }); }
  }
}

function renderInspector() {
  const c = components[state.selected] || components.rack;
  const sourceLinks = c.sources.map(k => `<a href="${sources[k].url}" target="_blank" rel="noopener noreferrer">${esc(sources[k].title)} ↗</a>`).join('');
  $('#inspector').innerHTML = `<div class="eyebrow inspector-label"><span class="status-dot"></span> COMPONENT INSPECTOR</div><div class="component-icon" aria-hidden="true">${({ gpu: '▦', hbm: '▤', cpu: '▧', fabric: '⇄', node: '▣', rack: '▥', network: '⌁', cluster: '⌘' })[state.selected] || '◇'}</div><div class="eyebrow type-label">${c.type}</div><h2>${c.title}</h2><p class="component-description">${c.text}</p><dl class="facts">${c.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><div class="insight"><span class="eyebrow">WHY THIS MATTERS</span><p>${c.insight}</p></div>${c.action ? `<button class="primary-button" data-view="${c.action[0]}">${c.action[1]} <span>→</span></button>` : ''}${['gpu', 'hbm'].includes(state.selected) ? '<button class="memory-note text-button" data-dialog="notes">¹ About memory capacity</button>' : ''}<details class="component-sources"><summary>Sources for this component <span>${c.sources.length}</span></summary><div>${sourceLinks}</div></details><button class="text-button inspector-back" data-scroll="diagram">Back to diagram ↑</button>`;
}

function renderTrace() {
  $('#trace-tabs').innerHTML = Object.entries(traces).map(([k, t], i) => `<button id="trace-${k}" role="tab" aria-selected="${state.trace === k}" aria-controls="trace-content" tabindex="${state.trace === k ? '0' : '-1'}" class="trace-tab ${state.trace === k ? 'active' : ''}" data-trace="${k}"><span class="trace-number">0${i + 1}</span><span><strong>${t.name}</strong><small>${t.subtitle}</small></span><span class="trace-tab-arrow">↗</span></button>`).join('');
  const t = traces[state.trace];
  const mode = state.bandwidth === 'both' ? 1 : 0;
  $('#trace-content').setAttribute('aria-labelledby', `trace-${state.trace}`);
  $('#trace-content').innerHTML = `<div class="trace-explanation"><div class="trace-chain">${t.chain.map((c, i) => `${i ? '<span class="chain-arrow" aria-hidden="true">→</span>' : ''}<span>${c}</span>`).join('')}</div><h3>${t.title}</h3><p>${t.body}</p></div><div class="trace-rate"><strong>${t.rate[mode]}</strong><span>${t.rateLabel[mode]}</span><p>${t.note}</p></div>`;
}

function setView(key, selected = views[key]?.selected, keepTrace = false) {
  if (!views[key]) return;
  if (state.view !== key) state.zoom = 1;
  state.view = key;
  state.selected = selected;
  if (!keepTrace) state.trace = ({ rack: 'peer', node: 'host', gpu: 'memory', cluster: 'remote' })[key];
  history.replaceState(null, '', `#${key}`);
  render();
}
function setTrace(key, focus = false) {
  if (!traces[key]) return;
  state.trace = key;
  setView(traces[key].view, traces[key].component, true);
  if (focus) $(`#trace-${key}`).focus();
}

function renderTour() {
  const el = $('#tour');
  if (state.tour < 0) { el.hidden = true; return; }
  const t = tourSteps[state.tour];
  el.hidden = false;
  el.innerHTML = `<div><span class="eyebrow">GUIDED TOUR / ${state.tour + 1} OF ${tourSteps.length}</span><h3>${t.title}</h3><p>${t.text}</p></div><div class="tour-controls"><button data-tour="prev" ${state.tour === 0 ? 'disabled' : ''} aria-label="Previous tour step">←</button><button class="primary-button" data-tour="next">${state.tour === tourSteps.length - 1 ? 'Finish tour ✓' : 'Next step →'}</button><button data-tour="close" aria-label="Close guided tour">×</button></div>`;
}
function stepTour(step) {
  if (step === 'close' || (step === 'next' && state.tour === tourSteps.length - 1)) { state.tour = -1; renderTour(); return; }
  state.tour = step === 'start' ? 0 : Math.max(0, Math.min(tourSteps.length - 1, state.tour + (step === 'next' ? 1 : -1)));
  const t = tourSteps[state.tour];
  setView(t.view, t.component);
  $('#view-title').scrollIntoView({ behavior: 'instant', block: 'start' });
}

const noteContent = `<p>This explorer follows a <strong>GB300 NVL72 reference layout</strong>. Counts and GPU connectivity are consistent across the cited sources; peripheral equipment and memory reporting vary by implementation.</p><h3>Bandwidth has a direction and a scope</h3><ul><li><strong>NVLink 5:</strong> 1,800 GB/s per GPU is send + receive, equivalent to 900 GB/s each way. It is the GPU’s aggregate interface budget, shared across peers.</li><li><strong>NVLink-C2C:</strong> 900 GB/s is the published bidirectional CPU–GPU interface rate. Its equivalent is 450 GB/s each way.</li><li><strong>Compute networking:</strong> 800 Gb/s is 100 GB/s per direction at the line-rate ceiling. Protocol overhead reduces application throughput.</li><li><strong>HBM:</strong> up to 8 TB/s is a local memory-interface specification. The direction toggle does not double it.</li></ul><h3>288 GB, 279 GB, or about 20 TB?</h3><p>NVIDIA’s architecture article describes a <strong>288 GB maximum per GPU</strong>, and notes that capacity varies by SKU. Other NVIDIA and cloud specifications quote 279 GB for particular configurations. The product page rounds total GPU memory to about 20 TB. This pilot uses the 288 GB architecture maximum in the package diagram, not a guarantee of allocatable memory.</p><p>72 × 288 GB = 20.736 TB at the architecture maximum. This is a calculated sum of distributed memories, not one equally fast shared pool. GB and TB here use decimal units; GiB and TiB are different units.</p><h3>Reference layout versus a specific machine</h3><p>The node diagram follows NVIDIA’s Enterprise reference: four ConnectX-8 adapters, one BlueField-3, and boot plus four cache devices. The DGX hardware guide lists a different BlueField count. Storage capacities, power, host memory, network switch tiers, and physical rack ordering can vary.</p><p>The cluster view is an illustrative two-rack path. It is neither a complete network bill of materials nor a performance simulation.</p>`;

function openDialog(kind) {
  const dialog = $('#info-dialog');
  if (kind === 'sources') {
    $('#dialog-title').textContent = 'Research & sources';
    $('#dialog-body').innerHTML = `<p>Primary documentation behind this pilot. Each component also links to its relevant sources. Checked November 1, 2026.</p><div class="source-list">${Object.values(sources).map((s, i) => `<article><span class="source-number">0${i + 1}</span><div><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a><small>${s.publisher}</small><p>${s.supports}</p></div></article>`).join('')}</div><div class="dialog-note">Publications sometimes differ in configuration and units. <button class="text-button" data-dialog="notes">Read the specification notes →</button></div>`;
  } else if (kind === 'scope') {
    $('#dialog-title').textContent = 'One pilot. A larger atlas.';
    $('#dialog-body').innerHTML = `<p>GB300 NVL72 is the first working system. We’ll refine this experience before adding the other agreed families.</p><ol class="coverage-list"><li>H100 / H200 servers</li><li>Grace Hopper / GH200 systems</li><li>B200 / GB200 servers and racks</li><li><strong>B300 / GB300 servers and racks <span class="pilot">CURRENT PILOT</span></strong></li><li>Rubin / Vera Rubin systems</li><li>DGX Spark</li><li>DGX Station</li></ol><p>CPUs, memory, switches, networking, and storage will be explained as connected parts of each system.</p>`;
  } else {
    $('#dialog-title').textContent = 'How to read these numbers';
    $('#dialog-body').innerHTML = noteContent + `<div class="dialog-note"><button class="text-button" data-dialog="sources">Open the primary sources →</button></div>`;
  }
  if (!dialog.open) dialog.showModal();
  $('#close-dialog').focus();
}

document.addEventListener('click', e => {
  const view = e.target.closest('[data-view]');
  const component = e.target.closest('[data-component]');
  const trace = e.target.closest('[data-trace]');
  const info = e.target.closest('[data-dialog]');
  const tour = e.target.closest('[data-tour]');
  const scroll = e.target.closest('[data-scroll]');
  if (view) { setView(view.dataset.view); }
  else if (component) {
    if (component.dataset.node) state.node = Number(component.dataset.node);
    if (component.dataset.go) setView(component.dataset.go);
    else { state.selected = component.dataset.component; render(); if (innerWidth <= 1000) $('#inspector').scrollIntoView({ behavior: 'instant', block: 'start' }); }
  } else if (trace) setTrace(trace.dataset.trace);
  else if (info) openDialog(info.dataset.dialog);
  else if (tour) stepTour(tour.dataset.tour);
  else if (scroll) $('#view-title').scrollIntoView({ behavior: 'instant', block: 'start' });
});
document.addEventListener('keydown', e => {
  const component = e.target.closest('[data-component]');
  if (component && ['Enter', ' '].includes(e.key)) { e.preventDefault(); component.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  const tab = e.target.closest('[data-trace]');
  if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
    e.preventDefault();
    const keys = Object.keys(traces);
    let i = keys.indexOf(state.trace);
    i = e.key === 'Home' ? 0 : e.key === 'End' ? keys.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length;
    setTrace(keys[i], true);
  }
});
$('#labels-button').addEventListener('click', () => { state.labels = !state.labels; render(); });
$('#reset-button').addEventListener('click', () => { state.node = 1; state.labels = true; state.tour = -1; state.zoom = 1; setView('rack'); });
function updateZoom() {
  const diagram = $('#diagram svg');
  diagram.style.width = `${state.zoom * 100}%`;
  diagram.style.minWidth = `${560 * state.zoom}px`;
  $('#zoom-fit').textContent = `${Math.round(state.zoom * 100)}%`;
  $('#zoom-out').disabled = state.zoom <= 1;
  $('#zoom-in').disabled = state.zoom >= 2;
}
$('#zoom-in').addEventListener('click', () => { state.zoom = Math.min(2, state.zoom + .25); updateZoom(); });
$('#zoom-out').addEventListener('click', () => { state.zoom = Math.max(1, state.zoom - .25); updateZoom(); });
$('#zoom-fit').addEventListener('click', () => { state.zoom = 1; updateZoom(); $('#diagram').scrollLeft = 0; });
$('#sources-button').addEventListener('click', () => openDialog('sources'));
$('#scope-button').addEventListener('click', () => openDialog('scope'));
$('#notes-button').addEventListener('click', () => openDialog('notes'));
$('#close-dialog').addEventListener('click', () => $('#info-dialog').close());
$('#info-dialog').addEventListener('click', e => { if (e.target === $('#info-dialog')) { const r = e.target.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close(); } });
$('#tour-button').addEventListener('click', () => stepTour('start'));
document.querySelectorAll('[name="bandwidth"]').forEach(el => el.addEventListener('change', e => { state.bandwidth = e.target.value; renderTrace(); }));
window.addEventListener('hashchange', () => { const v = location.hash.slice(1); if (views[v]) setView(v); });
state.trace = ({ rack: 'peer', node: 'host', gpu: 'memory', cluster: 'remote' })[state.view];
render();
