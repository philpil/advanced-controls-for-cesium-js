/** @file Bounded in-memory undo history. Saves still belong to the current device. */
export function createHistory(limit = 50) {
  let entries = [],
    cursor = -1;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  return {
    reset(shapes) {
      entries = [clone(shapes)];
      cursor = 0;
    },
    record(shapes) {
      if (JSON.stringify(entries[cursor]) === JSON.stringify(shapes)) return;
      entries = entries.slice(0, cursor + 1);
      entries.push(clone(shapes));
      if (entries.length > limit + 1) entries.shift();
      cursor = entries.length - 1;
    },
    undo() {
      return this.canUndo ? clone(entries[--cursor]) : null;
    },
    redo() {
      return this.canRedo ? clone(entries[++cursor]) : null;
    },
    get canUndo() {
      return cursor > 0;
    },
    get canRedo() {
      return cursor < entries.length - 1;
    },
  };
}
