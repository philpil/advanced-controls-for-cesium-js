import test from 'node:test';
import assert from 'node:assert/strict';
import { bindViewControls } from '../dist/views.js';

function harness() {
  const modes = { SCENE3D: 3, SCENE2D: 2, COLUMBUS_VIEW: 1, MORPHING: 0 };
  const event = () => ({
    listeners: [],
    addEventListener(fn) {
      this.listeners.push(fn);
    },
    fire() {
      this.listeners.forEach((fn) => fn());
    },
  });
  const buttons = Object.fromEntries(
    ['globe', 'flat', 'tilted'].map((name) => [
      name,
      {
        attributes: {},
        disabled: false,
        classList: { toggle() {} },
        setAttribute(key, value) {
          this.attributes[key] = value;
        },
        addEventListener(type, fn) {
          this[type] = fn;
        },
      },
    ]),
  );
  const state = { blocked: false, before: 0, after: 0, requests: 0, calls: [], notices: [] };
  const scene = {
    mode: modes.SCENE3D,
    morphStart: event(),
    morphComplete: event(),
    requestRender() {
      state.requests++;
    },
  };
  for (const [method, mode] of [
    ['morphTo3D', 3],
    ['morphTo2D', 2],
    ['morphToColumbusView', 1],
  ])
    scene[method] = (duration) => {
      state.calls.push([method, duration]);
      scene.mode = modes.MORPHING;
      scene.morphStart.fire();
      scene.mode = mode;
      scene.morphComplete.fire();
    };
  const refresh = bindViewControls({
    scene,
    modes,
    buttons,
    beforeChange() {
      state.before++;
      return !state.blocked;
    },
    afterChange() {
      state.after++;
    },
    notify(message) {
      state.notices.push(message);
    },
  });
  return { state, scene, modes, buttons, refresh };
}
test('custom controls call the correct native Cesium methods and track actual view', () => {
  const { state, buttons } = harness();
  assert.equal(buttons.globe.attributes['aria-pressed'], 'true');
  buttons.flat.click();
  assert.equal(buttons.flat.attributes['aria-pressed'], 'true');
  buttons.tilted.click();
  assert.equal(buttons.tilted.attributes['aria-pressed'], 'true');
  buttons.globe.click();
  assert.equal(buttons.globe.attributes['aria-pressed'], 'true');
  assert.deepEqual(state.calls, [
    ['morphTo2D', 0],
    ['morphToColumbusView', 0],
    ['morphTo3D', 0],
  ]);
  assert.equal(state.before, 3);
  assert.equal(state.after, 3);
  assert.equal(state.requests, 3);
});
test('unfinished drafts block mode changes; the active button is a no-op', () => {
  const { state, buttons } = harness();
  buttons.globe.click();
  assert.equal(state.before, 0);
  state.blocked = true;
  buttons.flat.click();
  assert.equal(state.calls.length, 0);
  assert.equal(state.after, 0);
  assert.equal(buttons.globe.attributes['aria-pressed'], 'true');
});
test('transient morph disables controls and completion restores the actual state', () => {
  const { scene, modes, buttons } = harness();
  scene.mode = modes.MORPHING;
  scene.morphStart.fire();
  for (const button of Object.values(buttons)) assert.equal(button.disabled, true);
  scene.mode = modes.COLUMBUS_VIEW;
  scene.morphComplete.fire();
  for (const button of Object.values(buttons)) assert.equal(button.disabled, false);
  assert.equal(buttons.tilted.attributes['aria-pressed'], 'true');
});
test('native transition failures report the error without falsely selecting a new mode', () => {
  const { scene, state, buttons } = harness();
  scene.morphTo2D = () => {
    throw new Error('Example failure');
  };
  buttons.flat.click();
  assert.match(state.notices[0], /Example failure/);
  assert.equal(buttons.globe.attributes['aria-pressed'], 'true');
  assert.equal(buttons.flat.attributes['aria-pressed'], 'false');
});
