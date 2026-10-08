import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const navigation = source.slice(
  source.indexOf('function closeShapeList('),
  source.indexOf('function entity('),
);

/** Minimal DOM and camera boundary: execute the production list/flight handlers. */
function harness() {
  const elements = new Map();
  function element() {
    return {
      hidden: true,
      children: [],
      attributes: {},
      append(...items) {
        this.children.push(...items);
      },
      replaceChildren() {
        this.children = [];
      },
      setAttribute(key, value) {
        this.attributes[key] = value;
      },
      querySelector() {
        return this.children.find((item) => item.tag === 'button');
      },
      focus() {},
    };
  }
  const flights = [];
  const state = {
    shapes: [
      { id: 'a', type: 'circle', radius: 1000 },
      { id: 'b', type: 'polygon', vertices: [{}, {}, {}] },
    ],
    selected: null,
    draft: null,
    reducedMotion: false,
    notices: [],
    getElement(id) {
      if (!elements.has(id)) elements.set(id, element());
      return elements.get(id);
    },
    document: {
      createElement(tag) {
        return { ...element(), tag };
      },
    },
    closeSelectionMenu() {},
    setMode(mode) {
      state.mode = mode;
    },
    select(id) {
      state.selected = id;
    },
    toast(message) {
      state.notices.push(message);
    },
    matchMedia: () => ({ matches: state.reducedMotion }),
    Cesium: {
      HeadingPitchRange: class {
        constructor(heading, pitch, range) {
          Object.assign(this, { heading, pitch, range });
        }
      },
    },
    viewer: {
      canvas: { focus() {} },
      camera: {
        cancelFlight() {},
        flyToBoundingSphere(bounds, options) {
          flights.push({ bounds, options });
        },
      },
    },
  };
  vm.runInNewContext(navigation, state);
  // Bounds maths is exercised separately against the pinned Cesium distribution.
  state.shapeFlightBounds = (shape) => ({ id: shape.id, radius: 123 });
  return { state, flights };
}

test('shape count opens every completed shape; selecting a row flies and selects it', () => {
  const { state, flights } = harness();
  state.toggleShapeList();
  const list = state.getElement('shapeList');
  assert.equal(list.hidden, false);
  assert.equal(state.getElement('shapeCount').attributes['aria-expanded'], 'true');
  assert.equal(list.children.length, 3);
  assert.equal(list.children[1].children[0].textContent, 'Circle 01');
  assert.equal(list.children[2].children[1].textContent, '3 vertices');
  list.children[2].onclick();
  assert.equal(state.selected, 'b');
  assert.equal(state.mode, 'select');
  assert.equal(list.hidden, true);
  assert.equal(flights[0].bounds.id, 'b');
  assert.equal(flights[0].options.offset.range, 0, 'Cesium fits the viewport automatically');
  assert.equal(flights[0].options.offset.pitch, -Math.PI / 2);
});

test('navigation protects drafts, ignores stale IDs and respects reduced motion', () => {
  const { state, flights } = harness();
  const draft = { vertices: [{}] };
  state.draft = draft;
  state.flyToShape('a');
  assert.equal(flights.length, 0);
  assert.equal(state.draft, draft);
  assert.equal(state.notices.length, 1);
  state.draft = null;
  state.flyToShape('deleted');
  assert.equal(flights.length, 0);
  state.reducedMotion = true;
  state.flyToShape('a');
  assert.equal(flights[0].options.duration, 0);
});

test('empty list explains how to add shapes and its toggle closes it', () => {
  const { state } = harness();
  state.shapes = [];
  state.toggleShapeList();
  assert.match(state.getElement('shapeList').children[0].textContent, /No shapes yet/);
  assert.equal(state.getElement('shapeList').children.length, 1);
  state.toggleShapeList();
  assert.equal(state.getElement('shapeList').hidden, true);
  assert.equal(state.getElement('shapeCount').attributes['aria-expanded'], 'false');
});
