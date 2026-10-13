/** @file Mouse, touch and keyboard movement for the two floating editor panels. */

/**
 * Keep a panel inside the visible viewport, including after a phone rotation.
 * If a panel is larger than the viewport, its header remains reachable.
 * All coordinates and dimensions are CSS pixels.
 * @param {{left:number,top:number}} position Desired top-left corner.
 * @param {{width:number,height:number}} size Current panel dimensions.
 * @param {{left:number,top:number,width:number,height:number}} viewport Visible bounds.
 * @returns {{left:number,top:number}} Clamped panel position.
 */
export function clampPanelPosition(position, size, viewport) {
  const left = viewport.left + 8,
    top = viewport.top + 8;
  return {
    left: Math.max(left, Math.min(position.left, viewport.left + viewport.width - size.width - 8)),
    top: Math.max(top, Math.min(position.top, viewport.top + viewport.height - size.height - 8)),
  };
}

/**
 * Bind one explicit header grip per panel. Form fields and close/action buttons
 * retain their normal behavior. Positions survive selection changes for this
 * page session; Home on the grip restores the responsive default position.
 * @param {HTMLElement[]} panels Floating, position:fixed editor panels.
 * @param {Window} [surface=window] Browser event/viewport boundary.
 * @returns {()=>void} Re-clamp moved panels after content or visibility changes.
 */
export function bindMovablePanels(panels, surface = window) {
  const states = panels.map((panel) => ({
    panel,
    grip: panel.querySelector('[data-panel-drag]'),
    position: null,
    drag: null,
  }));
  const viewport = () => ({
    left: surface.visualViewport?.offsetLeft || 0,
    top: surface.visualViewport?.offsetTop || 0,
    width: surface.visualViewport?.width || surface.innerWidth,
    height: surface.visualViewport?.height || surface.innerHeight,
  });
  const place = (state, desired) => {
    const bounds = viewport();
    state.panel.style.maxHeight = `${Math.max(44, bounds.height - 16)}px`;
    state.position = clampPanelPosition(desired, state.panel.getBoundingClientRect(), bounds);
    Object.assign(state.panel.style, {
      left: `${state.position.left}px`,
      top: `${state.position.top}px`,
      right: 'auto',
      bottom: 'auto',
    });
  };
  const finish = (state) => {
    const id = state.drag?.id;
    state.drag = null;
    state.panel.classList.remove('panel-dragging');
    if (id !== undefined && state.grip.hasPointerCapture(id)) state.grip.releasePointerCapture(id);
  };
  for (const state of states) {
    const { panel, grip } = state;
    const minimise = panel.querySelector('[data-panel-minimise]');
    const body = panel.querySelector('.panel-body');
    if (minimise && body) {
      const expandedLabel = minimise.getAttribute('aria-label');
      minimise.addEventListener('click', () => {
        // Only collapse UI: selected shapes and Cesium editing handles are untouched.
        const rect = panel.getBoundingClientRect();
        finish(state);
        body.hidden = !body.hidden;
        panel.classList.toggle('panel-minimised', body.hidden);
        minimise.setAttribute('aria-expanded', String(!body.hidden));
        minimise.setAttribute(
          'aria-label',
          body.hidden ? expandedLabel.replace('Minimise', 'Restore') : expandedLabel,
        );
        minimise.title = body.hidden ? 'Restore panel' : 'Minimise panel';
        minimise.textContent = body.hidden ? '+' : '−';
        // Keep the header in place, including bottom-anchored phone panels.
        place(state, { left: rect.left, top: rect.top });
      });
    }
    grip.addEventListener('pointerdown', (event) => {
      if (event.isPrimary === false || event.button !== 0) return;
      const rect = panel.getBoundingClientRect();
      state.drag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        left: rect.left,
        top: rect.top,
      };
      grip.setPointerCapture(event.pointerId);
      panel.classList.add('panel-dragging');
      grip.focus({ preventScroll: true });
      event.preventDefault();
    });
    grip.addEventListener('pointermove', (event) => {
      if (!state.drag || event.pointerId !== state.drag.id) return;
      place(state, {
        left: state.drag.left + event.clientX - state.drag.x,
        top: state.drag.top + event.clientY - state.drag.y,
      });
      event.preventDefault();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
      grip.addEventListener(type, (event) => {
        if (event.pointerId === state.drag?.id) finish(state);
      });
    grip.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Home') {
        finish(state);
        state.position = null;
        for (const key of ['left', 'top', 'right', 'bottom', 'maxHeight']) panel.style[key] = '';
        event.preventDefault();
        return;
      }
      const vectors = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const direction = vectors[event.key];
      if (!direction) return;
      const rect = panel.getBoundingClientRect(),
        step = event.shiftKey ? 64 : 16;
      place(state, { left: rect.left + direction[0] * step, top: rect.top + direction[1] * step });
      event.preventDefault();
    });
  }
  const reflow = () => {
    for (const state of states)
      if (state.position && !state.panel.hidden) place(state, state.position);
  };
  surface.addEventListener('resize', reflow);
  surface.addEventListener('blur', () => states.forEach(finish));
  surface.visualViewport?.addEventListener('resize', reflow);
  surface.visualViewport?.addEventListener('scroll', reflow);
  // Reopening a panel or switching between circle/polygon fields can change its height.
  if (surface.ResizeObserver) {
    const observer = new surface.ResizeObserver(reflow);
    states.forEach(({ panel }) => observer.observe(panel));
  }
  return reflow;
}
