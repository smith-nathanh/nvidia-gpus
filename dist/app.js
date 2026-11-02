import { systems, sources, readingSources, getModel, bandwidth, gpuCount, cpuCount, isRack } from './models.js';
import { diagram } from './diagrams.js';
import { readRoute, writeRoute, viewKeys } from './navigation.js';
import { lessonSteps, learningPage, figures, figureDialog } from './learning.js';

const $ = q => document.querySelector(q);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const defaults = { labels: true, bandwidth: 'oneway', tour: -1, zoom: 1 };
const defaultTrace = (model, view) => ({ rack: model.traces.peer ? 'peer' : 'host', node: 'host', gpu: 'memory', cluster: 'remote' })[view];

function normalized(route) {
  const systemId = Object.hasOwn(systems, route.systemId) ? route.systemId : 'gb300';
  const m = getModel(systemId), s = m.spec;
  const view = viewKeys.includes(route.view) ? route.view : s.defaultView;
  return {
    systemId, view,
    mode: systemId === 'gb300' && route.mode === 'learn' ? 'learn' : 'explore',
    lesson: Number.isInteger(route.lesson) ? Math.max(0, Math.min(3, route.lesson)) : 0,
    lens: ['groups', 'network', 'storage'].includes(route.lens) ? route.lens : 'groups',
    storyPath: ['memory', 'host', 'peer', 'remote'].includes(route.storyPath) ? route.storyPath : 'peer',
    placement: route.placement === 'split' ? 'split' : 'same',
    node: Math.max(1, Math.min(s.nodes, Number.isInteger(route.node) ? route.node : 1)),
    gpu: Math.max(0, Math.min(s.gpusPerNode - 1, Number.isInteger(route.gpu) ? route.gpu : 0)),
    selected: Object.hasOwn(m.components, route.selected) ? route.selected : m.views[view].selected,
    trace: Object.hasOwn(m.traces, route.trace) ? route.trace : defaultTrace(m, view)
  };
}
let state = { ...defaults, ...normalized(readRoute(location.hash || '#gb300/learn')) };
let model = getModel(state.systemId);

function focusHeading() { $('#view-title').focus({ preventScroll: true }); }
function render() {
  const focused = document.activeElement;
  const focusId = focused?.id;
  const focusKey = focused?.getAttribute('data-focus-key');
  const hadActionFocus = focused?.matches('button, [data-component]');
  const s = model.spec, rack = isRack(s), shared = s.layout === 'shared';
  document.title = `${s.name} · NVIDIA Systems Explorer`;
  $('#system-picker').value = s.id;
  $('#system-name').textContent = s.name;
  $('#system-family').textContent = s.family;
  const learning = state.mode === 'learn';
  document.body.classList.toggle('learning', learning);
  $('#learning-page').hidden = !learning;
  $('#experience-toggle').hidden = s.id !== 'gb300';
  $('#experience-toggle').textContent = learning ? 'Open architecture explorer →' : 'Start the visual lesson →';
  $('#nav-label').textContent = learning ? 'UNDERSTAND THIS SYSTEM' : 'EXPLORE THE ARCHITECTURE';
  $('#scale-nav').setAttribute('aria-label', learning ? 'Architecture lesson' : 'Architecture scale');
  $('.brand').href = learning ? '#gb300/learn?step=0' : '#rack';
  if (learning) { $('.brand').dataset.lesson = '0'; delete $('.brand').dataset.view; }
  else { $('.brand').dataset.view = 'rack'; delete $('.brand').dataset.lesson; }
  if (learning) {
    $('#scale-nav').innerHTML = lessonSteps.map(([title, sub], i) => `<button id="lesson-nav-${i}" class="scale-item ${state.lesson === i ? 'active' : ''}" data-lesson="${i}" ${state.lesson === i ? 'aria-current="step"' : ''}><span class="scale-number">0${i + 1}</span><span><strong>${title}</strong><small>${sub}</small></span></button>`).join('');
    $('#learning-page').innerHTML = learningPage(state);
    $('#tour').hidden = true;
    if (focusId) document.getElementById(focusId)?.focus({preventScroll:true});
    return;
  }
  $('#page-family').textContent = `${s.family.toUpperCase()} / ${rack ? 'RACK-SCALE' : s.layout === 'server' ? 'GPU SERVER' : 'CPU–GPU SYSTEM'}`;
  $('#page-title').textContent = s.name;
  $('#reference-summary').textContent = s.reference;
  $('#model-status').textContent = s.availability || 'Published configuration · sources checked Nov 1, 2026';
  $('#sidebar-summary').textContent = rack ? 'One rack. Multiple servers. One GPU fabric.' : shared ? 'One computer. CPU and GPU share one physical memory pool.' : 'Follow host memory, GPU memory, and the connections between them.';
  $('#scale-nav').innerHTML = viewKeys.map((key, i) => `<button id="nav-${key}" class="scale-item ${state.view === key ? 'active' : ''}" data-view="${key}" ${state.view === key ? 'aria-current="page"' : ''}><span class="scale-number">0${i + 1}</span><span><strong>${esc(model.views[key].name)}</strong><small>${esc(model.views[key].subtitle)}</small></span><span class="scale-arrow" aria-hidden="true">↗</span></button>`).join('');
  const capacity = s.gpuMemoryGB === null ? s.totalGpuMemory : `${s.gpuMemoryGB} GB`;
  const capacityScope = s.gpuMemoryGB === null ? 'HBM / system · reported total¹' : 'HBM / GPU¹';
  const stats = rack ? [[gpuCount(s), 'GPUs / NVLink domain'], [cpuCount(s), 'CPUs / rack'], [s.nodes, 'Compute nodes / rack'], [capacity, capacityScope]] : [[s.gpusPerNode, 'Primary GPUs / system'], [s.cpusPerNode, 'Host CPUs / system'], [capacity, shared ? 'Shared system memory' : capacityScope], [shared ? bandwidth(s.memoryGBps) : s.nvlinkBidirGBps ? s.gpusPerNode : '1', shared ? 'System memory bandwidth' : s.nvlinkBidirGBps ? 'GPUs / NVLink domain' : 'Primary GPU · no peer']];
  $('#stats').setAttribute('aria-label', `Specifications for ${s.reference}`);
  $('#stats').innerHTML = stats.map(([v, l]) => `<div class="stat"><span class="stat-value">${esc(v)}</span><span class="stat-label">${esc(l)}</span></div>`).join('');
  const crumbs = [{ label: s.name, view: 'rack', key: 'system' }];
  if (['node','gpu'].includes(state.view)) crumbs.push({ label: rack ? `Node ${String(state.node).padStart(2, '0')}` : 'Compute system', view: 'node', key: 'node' });
  if (state.view === 'gpu' && s.superchipsPerNode) crumbs.push({ label: `Superchip ${Math.floor(state.gpu / s.gpusPerSuperchip) + 1}`, component: 'superchip', go: 'node', key: 'superchip' });
  if (state.view === 'gpu') crumbs.push({ label: `GPU ${state.gpu}`, view: 'gpu', key: 'gpu' });
  if (state.view === 'cluster') crumbs.push({ label: rack ? 'Between racks' : 'Between systems', view: 'cluster', key: 'cluster' });
  $('#breadcrumbs').innerHTML = crumbs.map((c, i) => `${i ? '<span aria-hidden="true">/</span>' : ''}<button id="crumb-${c.key}" ${c.component ? `data-component="${c.component}" data-go="${c.go}"` : `data-view="${c.view}"`} ${i === crumbs.length - 1 ? 'aria-current="location"' : ''}>${esc(c.label)}</button>`).join('');
  $('#view-kicker').textContent = model.views[state.view].kicker;
  $('#view-title').textContent = model.views[state.view].title;
  $('#diagram').innerHTML = diagram(model, state);
  $('#labels-button').setAttribute('aria-pressed', String(state.labels));
  $('#label-indicator').textContent = state.labels ? 'ON' : 'OFF';
  renderInspector(); renderTrace(); renderTour(); renderReading(); updateZoom();
  const replacement = focusId && document.getElementById(focusId) || focusKey && [...document.querySelectorAll('[data-focus-key]')].find(el => el.dataset.focusKey === focusKey);
  if (replacement) replacement.focus({ preventScroll: true });
  else if (hadActionFocus) focusHeading();
}

function renderReading() {
  const s = model.spec;
  const section = $('#reading-links');
  if (section.dataset.system === s.id) return;
  $('#reading-title').textContent = `Read more at NVIDIA · ${s.name}`;
  $('#reading-context').textContent = `Start with the product overview, then explore the hardware and architecture references below. Map reference: ${s.reference}. Publications may cover other variants; see configuration differences before comparing numbers. Links open in a new tab.`;
  section.innerHTML = readingSources[s.id].map(key => {
    const ref = sources[key];
    return `<article class="reading-card"><a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">${esc(ref.title)} <span aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a><p>${esc(ref.supports)}</p></article>`;
  }).join('');
  section.dataset.system = s.id;
}

function renderInspector() {
  const c = model.components[state.selected] || model.components[model.views[state.view].selected];
  const inspector = $('#inspector');
  const inspectionKey = `${state.systemId}/${state.node}/${state.gpu}/${state.selected}`;
  const changed = inspector.dataset.inspectionKey !== inspectionKey;
  const context = state.view === 'gpu' ? `${isRack(model.spec) ? `Node ${String(state.node).padStart(2, '0')}` : model.spec.name} · ${model.spec.superchipsPerNode ? `superchip ${Math.floor(state.gpu / model.spec.gpusPerSuperchip) + 1} · ` : ''}GPU ${state.gpu}` : isRack(model.spec) && state.view === 'node' ? `Node ${String(state.node).padStart(2, '0')}` : model.spec.name;
  $('#inspector').innerHTML = `<div class="eyebrow inspector-label"><span class="status-dot"></span> COMPONENT INSPECTOR</div><p class="selection-context">${esc(context)}</p><div class="eyebrow type-label">${esc(c.type)}</div><h2 id="inspector-title" tabindex="-1">${esc(c.title)}</h2><p class="component-description">${esc(c.text)}</p><dl class="facts">${c.facts.map(([k,v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><div class="insight"><span class="eyebrow">WHY THIS MATTERS</span><p>${esc(c.insight)}</p></div>${c.action ? `<button id="inspector-action" class="primary-button" data-view="${c.action[0]}">${esc(c.action[1])} <span aria-hidden="true">→</span></button>` : ''}${['gpu','hbm'].includes(state.selected) ? '<button id="memory-note" class="text-button memory-note" data-dialog="notes">¹ Memory and reference notes</button>' : ''}<details class="component-sources"><summary>Sources for this component <span>${c.sources.length}</span></summary><div>${c.sources.map(k => `<a href="${sources[k].url}" target="_blank" rel="noopener noreferrer">${esc(sources[k].title)} ↗</a>`).join('')}</div></details><button id="inspector-back" class="text-button inspector-back" data-scroll="diagram">Back to diagram ↑</button>`;
  inspector.dataset.inspectionKey = inspectionKey;
  if (changed) inspector.scrollTop = 0;
}
function renderTrace() {
  $('#trace-tabs').innerHTML = Object.entries(model.traces).map(([key,t], i) => `<button id="trace-${key}" role="tab" aria-selected="${state.trace === key}" aria-controls="trace-content" tabindex="${state.trace === key ? 0 : -1}" class="trace-tab ${state.trace === key ? 'active' : ''}" data-trace="${key}"><span class="trace-number">0${i + 1}</span><span><strong>${esc(t.name)}</strong><small>${esc(t.subtitle)}</small></span><span class="trace-tab-arrow" aria-hidden="true">↗</span></button>`).join('');
  const t = model.traces[state.trace], mode = state.bandwidth === 'both' ? 1 : 0;
  $('#trace-content').setAttribute('aria-labelledby', `trace-${state.trace}`);
  $('#trace-content').innerHTML = `<div class="trace-explanation"><div class="trace-chain">${t.chain.map((c, i) => `${i ? '<span aria-hidden="true">→</span>' : ''}<span class="chain-step">${esc(c)}</span>`).join('')}</div><h3>${esc(t.title)}</h3><p>${esc(t.body)}</p></div><div class="trace-rate"><strong>${esc(t.rate[mode])}</strong><span>${esc(t.rateLabel[mode])}</span><p>${esc(t.note)}</p></div>`;
}

function navigate(patch, { replace = false } = {}) {
  const old = state;
  const next = normalized({ ...state, ...patch });
  state = { ...state, ...next, tour: patch.tour ?? -1 };
  if (old.view !== state.view || old.systemId !== state.systemId) state.zoom = 1;
  model = getModel(state.systemId);
  const hash = writeRoute(state);
  if (location.hash !== hash) history[replace ? 'replaceState' : 'pushState'](null, '', hash);
  render();
}
function setView(view, selected = model.views[view]?.selected, extra = {}) {
  if (!model.views[view]) return;
  const changed = state.view !== view;
  navigate({mode:'explore', view, selected, trace: defaultTrace(model, view), ...extra});
  if (changed && !document.activeElement.id.startsWith('nav-')) $('#view-title').scrollIntoView({block:'start'});
}
function setTrace(key, focus = false) {
  const t = model.traces[key];
  if (!t) return;
  navigate({view:t.view, selected:t.component, trace:key});
  if (focus) $(`#trace-${key}`).focus({ preventScroll: true });
}
function restoreRoute() {
  if (location.hash === '#main') return;
  const next = normalized(readRoute(location.hash || '#gb300/learn'));
  if (writeRoute(next) === writeRoute(state)) return;
  state = { ...state, ...next, tour:-1, zoom:1 };
  model = getModel(state.systemId);
  render();
}

function tourSteps() {
  const s = model.spec;
  return [
    {view:'rack', component:'rack', title:'Find the system boundary', text:isRack(s) ? `This rack has ${gpuCount(s)} GPUs across ${s.nodes} independent server nodes, joined by one GPU fabric.` : `${s.name} is one computer. Start by separating it from the other systems on the network.`},
    {view:'node', component:'node', title:'Count CPUs and GPUs', text:`One node contains ${s.cpusPerNode} CPU${s.cpusPerNode > 1 ? 's' : ''} and ${s.gpusPerNode} GPU${s.gpusPerNode > 1 ? 's' : ''}. ${s.superchipsPerNode ? `Each superchip pairs one CPU with ${s.gpusPerSuperchip} GPU${s.gpusPerSuperchip > 1 ? 's' : ''}.` : 'These are x86 hosts with PCIe connections to the GPU subsystem.'}`},
    {view:'node', component:s.cpusPerNode === 2 ? 'cpuLink' : s.hostKind === 'shared' ? 'hbm' : 'c2c', title:s.cpusPerNode === 2 ? 'Follow the host-side connection' : 'Follow coherent memory access', text:s.cpusPerNode === 2 ? 'CPU 0 and CPU 1 communicate over their host-side interconnect. It is separate from the GPU peer fabric.' : s.hostKind === 'shared' ? 'CPU and GPU share the same physical LPDDR memory. Count its capacity once.' : 'C2C connects the CPU and GPU coherently. HBM and host RAM still have different access speeds.'},
    {view:'gpu', component:'hbm', title:'Inspect memory close to compute', text:s.layout === 'shared' ? 'GB10 uses shared LPDDR5X, not a dedicated HBM pool.' : s.gpuMemoryGB === null ? 'Each GPU has local HBM3e. The selected DGX datasheet reports system totals, leaving individual capacity and bandwidth unspecified; inspect the memory notes for the source differences.' : `${s.gpuMemoryGB} GB of ${s.memoryType} belongs to one GPU in this reference. ${s.computeDies} compute ${s.computeDies === 1 ? 'die forms' : 'dies form'} that logical accelerator.`},
    {view:'cluster', component:'network', title:'Cross the system boundary', text:`${s.nicName} connects separate computers or rack domains. The network does not extend the local physical-memory boundary.`}
  ];
}
function renderTour() {
  const el = $('#tour');
  el.hidden = state.tour < 0;
  if (el.hidden) return;
  const steps = tourSteps(), t = steps[state.tour];
  el.innerHTML = `<div><span class="eyebrow">GUIDED TOUR / ${state.tour + 1} OF ${steps.length}</span><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></div><div class="tour-controls"><button id="tour-prev" data-tour="prev" ${state.tour === 0 ? 'disabled' : ''} aria-label="Previous tour step">←</button><button id="tour-next" class="primary-button" data-tour="next">${state.tour === steps.length - 1 ? 'Finish tour ✓' : 'Next step →'}</button><button id="tour-close" data-tour="close" aria-label="Close guided tour">×</button></div>`;
}
function stepTour(action) {
  if (action === 'close' || action === 'next' && state.tour === tourSteps().length - 1) {
    state.tour = -1; renderTour(); $('#tour-button').focus({preventScroll:true}); return;
  }
  const index = action === 'start' ? 0 : Math.max(0, state.tour + (action === 'next' ? 1 : -1));
  const t = tourSteps()[index];
  setView(t.view, t.component, {tour:index});
  $('#tour-next').focus({ preventScroll:true });
  $('#view-title').scrollIntoView({block:'start'});
}
function updateZoom() {
  const map = $('#diagram .architecture-map');
  if (map) map.style.zoom = state.zoom;
  $('#zoom-fit').textContent = `${Math.round(state.zoom * 100)}%`;
  $('#zoom-out').disabled = state.zoom <= 1;
  $('#zoom-in').disabled = state.zoom >= 2;
}

function openDialog(kind) {
  const s = model.spec;
  $('#info-dialog').classList.remove('figure-dialog');
  if (kind === 'sources') {
    $('#dialog-title').textContent = `Sources · ${s.name}`;
    $('#dialog-body').innerHTML = `<p>Primary references for the selected configuration. Checked November 1, 2026. Document differences are recorded in the specification notes.</p><div class="source-list">${s.sources.map((key, i) => { const ref = sources[key]; return `<article><span class="source-number">${String(i + 1).padStart(2,'0')}</span><div><a href="${ref.url}" target="_blank" rel="noopener noreferrer">${esc(ref.title)} ↗</a><small>${esc(ref.publisher)}</small><p>${esc(ref.supports)}</p></div></article>`; }).join('')}</div><button class="text-button" data-dialog="notes">Read configuration and bandwidth notes →</button>`;
  } else if (kind === 'scope') {
    $('#dialog-title').textContent = 'Architecture guide';
    $('#dialog-body').innerHTML = `<p>Ten reference configurations across the agreed families. Select a system to explore its actual CPU, GPU, memory and network arrangement.</p><div class="coverage-list">${Object.values(systems).map(ref => `<button data-system="${ref.id}"><strong>${esc(ref.name)}</strong><span>${esc(ref.family)} · ${isRack(ref) ? `${gpuCount(ref)}-GPU rack domain` : `${ref.gpusPerNode} GPU${ref.gpusPerNode > 1 ? 's' : ''} / system`}</span></button>`).join('')}</div><p>These are selected reference configurations, not an enumeration of every OEM, PCIe, SXM, NVL or memory-capacity variant.</p>`;
  } else {
    $('#dialog-title').textContent = `Specification notes · ${s.name}`;
    $('#dialog-body').innerHTML = `<p><strong>Reference:</strong> ${esc(s.reference)}.</p><h3>Configuration and source differences</h3><ul>${s.notes.map(note => `<li>${esc(note)}</li>`).join('')}</ul><h3>Bandwidth has a direction and a scope</h3><p>Peer NVLink rates sum send and receive at one GPU. One-direction equivalents divide that symmetric interface budget by two. The budget is shared across peers. A sum across many GPU interfaces is not a dedicated pairwise transfer speed.</p><p>Network rates use bits (Gb/s). Divide by eight to obtain bytes (GB/s) before protocol overhead. A card aggregate is not necessarily a single-port rate. CPU–GPU peaks refer to an interface or group, not a guaranteed full-rate link on every schematic branch.</p><p>Memory-interface specifications keep their published convention. Selecting send + receive does not double HBM or shared LPDDR bandwidth. Published peaks are not measured workload performance.</p><h3>Capacity and physical locality</h3><p>${s.layout === 'shared' ? 'Spark has a single physical LPDDR5X pool shared by CPU and GPU.' : 'Coherent or aggregate memory does not make all memory one physically uniform pool. CPU RAM and GPU HBM have different local and remote costs.'} GB and TB use decimal units here. GiB and TiB are different units.</p><h3>Reading the map</h3><p>These are logical architecture maps. Group boundaries describe compute and memory relationships, not physical die placement, exact PCIe lanes, rack-unit placement, or a network bill of materials.</p><button class="text-button" data-dialog="sources">Open the primary sources →</button>`;
  }
  if (!$('#info-dialog').open) $('#info-dialog').showModal();
  $('#close-dialog').focus();
}
function selectSystem(id) {
  if (!Object.hasOwn(systems, id)) return;
  const m = getModel(id), view = m.spec.defaultView;
  if ($('#info-dialog').open) $('#info-dialog').close();
  navigate({systemId:id, mode:id === 'gb300' ? 'learn' : 'explore', lesson:0, lens:'groups', storyPath:'peer', placement:'same', view, node:1, gpu:0, selected:m.views[view].selected, trace:defaultTrace(m,view)});
  $('#system-picker').focus({preventScroll:true});
  window.scrollTo({top:0, behavior:'instant'});
}

// The selector survives renders; options and event bindings are installed once.
const families = ['Hopper', 'Grace Hopper', 'Blackwell', 'Blackwell Ultra', 'Vera Rubin', 'Personal AI systems'];
$('#system-picker').innerHTML = families.map(family => `<optgroup label="${esc(family)}">${Object.values(systems).filter(s => s.family === family).map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</optgroup>`).join('');
$('#system-picker').addEventListener('change', e => selectSystem(e.target.value));
document.addEventListener('click', e => {
  const learningAction = e.target.closest('[data-lesson], [data-lens], [data-story-path], [data-placement], [data-figure], [data-explore]');
  if (learningAction) {
    e.preventDefault();
    const d = learningAction.dataset;
    if (d.figure && figures[d.figure]) {
      $('#info-dialog').classList.add('figure-dialog');
      $('#dialog-title').textContent = figures[d.figure].title;
      $('#dialog-body').innerHTML = figureDialog(d.figure);
      $('#info-dialog').showModal();
      $('#close-dialog').focus();
    } else if (d.explore) {
      setView(d.explore);
      focusHeading();
      $('#view-title').scrollIntoView({block:'start'});
    } else if (d.lesson !== undefined) {
      navigate({mode:'learn', lesson:Number(d.lesson)});
      $('#learning-title').focus({preventScroll:true});
      $('#main').scrollIntoView({block:'start'});
    } else {
      navigate(d.lens ? {lens:d.lens} : d.storyPath ? {storyPath:d.storyPath} : {placement:d.placement});
    }
    return;
  }
  const view = e.target.closest('[data-view]');
  const component = e.target.closest('[data-component]');
  const trace = e.target.closest('[data-trace]');
  const info = e.target.closest('[data-dialog]');
  const tour = e.target.closest('[data-tour]');
  const system = e.target.closest('[data-system]');
  if (view) { e.preventDefault(); setView(view.dataset.view); }
  else if (component) {
    const extra = {};
    if (component.dataset.node !== undefined) extra.node = Number(component.dataset.node);
    if (component.dataset.gpu !== undefined) extra.gpu = Number(component.dataset.gpu);
    if (component.dataset.go) setView(component.dataset.go, component.dataset.component, extra);
    else {
      navigate({selected:component.dataset.component, ...extra});
      if (innerWidth <= 1200 && e.detail > 0) {
        $('#inspector-title').focus({preventScroll:true});
        $('#inspector-title').scrollIntoView({block:'start'});
      }
    }
  } else if (trace) setTrace(trace.dataset.trace);
  else if (info) openDialog(info.dataset.dialog);
  else if (tour) stepTour(tour.dataset.tour);
  else if (system) selectSystem(system.dataset.system);
  else if (e.target.closest('[data-scroll]')) { focusHeading(); $('#view-title').scrollIntoView({block:'start'}); }
});
document.addEventListener('keydown', e => {
  const tab = e.target.closest('[data-trace]');
  if (!tab || !['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
  e.preventDefault();
  const keys = Object.keys(model.traces), current = keys.indexOf(state.trace);
  const i = e.key === 'Home' ? 0 : e.key === 'End' ? keys.length - 1 : (current + (e.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length;
  setTrace(keys[i], true);
});
$('#labels-button').addEventListener('click', () => { state.labels = !state.labels; render(); });
$('#experience-toggle').addEventListener('click', () => {
  if (state.mode === 'learn') {
    setView('rack');
    focusHeading();
    $('#view-title').scrollIntoView({block:'start'});
  } else {
    navigate({mode:'learn', lesson:0});
    $('#learning-title').focus({preventScroll:true});
    $('#main').scrollIntoView({block:'start'});
  }
});
$('#reset-button').addEventListener('click', () => {
  state = {...state, ...defaults};
  document.querySelector('[name="bandwidth"][value="oneway"]').checked = true;
  setView(model.spec.defaultView, model.views[model.spec.defaultView].selected, {node:1,gpu:0});
});
$('#zoom-in').addEventListener('click', () => { state.zoom = Math.min(2, state.zoom + .25); updateZoom(); });
$('#zoom-out').addEventListener('click', () => { state.zoom = Math.max(1, state.zoom - .25); updateZoom(); });
$('#zoom-fit').addEventListener('click', () => { state.zoom = 1; updateZoom(); $('#diagram').scrollLeft = 0; });
$('#sources-button').addEventListener('click', () => openDialog('sources'));
$('#scope-button').addEventListener('click', () => openDialog('scope'));
$('#notes-button').addEventListener('click', () => openDialog('notes'));
$('#close-dialog').addEventListener('click', () => $('#info-dialog').close());
$('#info-dialog').addEventListener('click', e => {
  if (e.target !== $('#info-dialog')) return;
  const r = e.target.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.target.close();
});
$('#tour-button').addEventListener('click', () => stepTour('start'));
document.querySelectorAll('[name="bandwidth"]').forEach(el => el.addEventListener('change', e => { state.bandwidth = e.target.value; renderTrace(); }));
window.addEventListener('popstate', restoreRoute);
window.addEventListener('hashchange', restoreRoute);
history.replaceState(null, '', writeRoute(state));
render();
