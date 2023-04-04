const _actual = Symbol('_actual');

export function every(pred, iterable) {
  for (const value of iterable) {
    if (!pred(value)) return false;
  }
  return true;
}

export class ReadOnlySet {
  constructor(set) {
    this[_actual] = set;
  }

  static from(values) {
    return new ReadOnlySet(new Set(values));
  }

  get size() {
    return this[_actual].size;
  }

  has(type) {
    return this[_actual].has(type);
  }

  add() {
    throw new Error('readOnlySet.add is unimplemented');
  }

  delete() {
    throw new Error('readOnlySet.delete is unimplemented');
  }

  clear() {
    throw new Error('readOnlySet.clear is unimplemented');
  }

  keys() {
    return this[_actual].keys();
  }

  values() {
    return this[_actual].values();
  }

  entries() {
    return this[_actual].entries();
  }

  forEach(fn) {
    return this[_actual].forEach(fn);
  }

  [Symbol.iterator]() {
    return this[_actual][Symbol.iterator]();
  }
}

export class ReadOnlyMap {
  constructor(map) {
    this[_actual] = map;
  }

  static from(entries) {
    return new ReadOnlyMap(new Map(entries));
  }

  get size() {
    return this[_actual].size;
  }

  has(type) {
    return this[_actual].has(type);
  }

  get(type) {
    return this[_actual].get(type);
  }

  set() {
    throw new Error('readOnlyMap.set is unimplemented');
  }

  delete() {
    throw new Error('readOnlyMap.delete is unimplemented');
  }

  clear() {
    throw new Error('readOnlyMap.clear is unimplemented');
  }

  keys() {
    return this[_actual].keys();
  }

  values() {
    return this[_actual].values();
  }

  entries() {
    return this[_actual].entries();
  }

  forEach(fn) {
    return this[_actual].forEach(fn);
  }

  [Symbol.iterator]() {
    return this[_actual][Symbol.iterator]();
  }
}
