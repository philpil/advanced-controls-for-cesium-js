import test from 'node:test';
import assert from 'node:assert/strict';
import { bindMovablePanels } from '../dist/panels.js';

// Exercise production pointer and keyboard handlers at the DOM/viewport boundary.
function harness() {
  const surfaceEvents = {},
    surface = {
      innerWidth: 1000,
      innerHeight: 800,
      addEventListener: (type, fn) => (surfaceEvents[type] = fn),
    };
  const panels = [0, 1].map(() => {
    const events = {},
      captured = new Set();
    const grip = {
      addEventListener: (type, fn) => (events[type] = fn),
      setPointerCapture: (id) => captured.add(id),
      hasPointerCapture: (id) => captured.has(id),
      releasePointerCapture: (id) => captured.delete(id),
      focus() {},
    };
    const panel = {
      style: {},
      hidden: false,
      classList: { add() {}, remove() {} },
      querySelector: () => grip,
      getBoundingClientRect() {
        return {
          left: this.style.left ? parseFloat(this.style.left) : 700,
          top: this.style.top ? parseFloat(this.style.top) : 100,
          width: 250,
          height: Math.min(300, parseFloat(this.style.maxHeight) || 300),
        };
      },
    };
    return { panel, events, captured };
  });
  const reflow = bindMovablePanels(
    panels.map((p) => p.panel),
    surface,
  );
  const event = (x, y, extra = {}) => ({
    pointerId: 1,
    isPrimary: true,
    button: 0,
    clientX: x,
    clientY: y,
    preventDefault() {},
    ...extra,
  });
  return { panels, surface, surfaceEvents, reflow, event };
}
test('mouse and touch grips move each panel independently and clamp to visible bounds', () => {
  const { panels, event } = harness();
  const a = panels[0];
  a.events.pointerdown(event(710, 110));
  a.events.pointermove(event(410, 310, { pointerType: 'touch' }));
  assert.equal(a.panel.style.left, '400px');
  assert.equal(a.panel.style.top, '300px');
  assert.equal(panels[1].panel.style.left, undefined);
  a.events.pointermove(event(-1000, -1000));
  assert.equal(a.panel.style.left, '8px');
  assert.equal(a.panel.style.top, '8px');
  a.events.pointerup(event(0, 0));
  assert.equal(a.captured.size, 0);
  a.events.pointermove(event(100, 100));
  assert.equal(a.panel.style.left, '8px');
});
test('secondary pointer and right-click cannot start or hijack a panel move', () => {
  const { panels, event } = harness();
  const a = panels[0];
  a.events.pointerdown(event(0, 0, { button: 2 }));
  a.events.pointermove(event(100, 100));
  assert.equal(a.panel.style.left, undefined);
  a.events.pointerdown(event(710, 110));
  a.events.pointermove(event(200, 200, { pointerId: 2, isPrimary: false }));
  assert.equal(a.panel.style.left, undefined);
  a.events.pointercancel(event(710, 110));
  assert.equal(a.captured.size, 0);
});
test('keyboard movement and Home reset preserve responsive defaults', () => {
  const { panels, event } = harness();
  const a = panels[0];
  a.events.keydown(event(0, 0, { key: 'ArrowLeft' }));
  assert.equal(a.panel.style.left, '684px');
  a.events.keydown(event(0, 0, { key: 'ArrowUp', shiftKey: true }));
  assert.equal(a.panel.style.top, '36px');
  a.events.keydown(event(0, 0, { key: 'Home' }));
  for (const key of ['left', 'top', 'right', 'bottom', 'maxHeight'])
    assert.equal(a.panel.style[key], '');
});
test('viewport resize and reopened panels keep moved headers visible; blur releases capture', () => {
  const { panels, event, surface, surfaceEvents, reflow } = harness();
  const a = panels[0];
  a.events.pointerdown(event(710, 110));
  a.events.pointermove(event(740, 400));
  surfaceEvents.blur();
  assert.equal(a.captured.size, 0);
  surface.innerWidth = 390;
  surface.innerHeight = 240;
  surfaceEvents.resize();
  assert.equal(a.panel.style.left, '132px');
  assert.equal(a.panel.style.top, '8px');
  assert.equal(a.panel.style.maxHeight, '224px');
  a.panel.hidden = true;
  surface.innerWidth = 320;
  reflow();
  assert.equal(a.panel.style.left, '132px');
  a.panel.hidden = false;
  reflow();
  assert.equal(a.panel.style.left, '62px');
});
