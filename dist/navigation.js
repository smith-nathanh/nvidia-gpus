// Routes are complete bookmarks: history must retain the system and hardware identity.
export const viewKeys = ['rack', 'node', 'gpu', 'cluster'];
export function readRoute(hash) {
  const [path, query = ''] = hash.replace(/^#/, '').split('?');
  const parts = path.split('/');
  const legacy = viewKeys.includes(parts[0]);
  const params = new URLSearchParams(query);
  const integer = (key, fallback) => /^\d+$/.test(params.get(key) || '') ? Number(params.get(key)) : fallback;
  if (parts[0] === 'gb300' && parts[1] === 'learn') return {
    systemId: 'gb300', view: 'rack', mode: 'learn', lesson: Math.min(3, integer('step', 0)),
    storyPath: params.get('transfer') || 'peer', placement: params.get('placement') || 'same',
    lens: params.get('lens') || 'groups', node: 1, gpu: 0
  };
  return {
    systemId: legacy ? 'gb300' : parts[0] || 'gb300',
    view: (legacy ? parts[0] : parts[1]) || 'rack',
    node: integer('node', 1), gpu: integer('gpu', 0),
    selected: params.get('component'), trace: params.get('path')
  };
}
export function writeRoute(state) {
  if (state.systemId === 'gb300' && state.mode === 'learn') {
    const params = new URLSearchParams({ step: state.lesson || 0 });
    if (state.storyPath && state.storyPath !== 'peer') params.set('transfer', state.storyPath);
    if (state.placement && state.placement !== 'same') params.set('placement', state.placement);
    if (state.lens && state.lens !== 'groups') params.set('lens', state.lens);
    return `#gb300/learn?${params}`;
  }
  const params = new URLSearchParams({ node: state.node, gpu: state.gpu });
  if (state.selected) params.set('component', state.selected);
  if (state.trace) params.set('path', state.trace);
  return `#${state.systemId}/${state.view}?${params}`;
}
