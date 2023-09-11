const { hasOwn, getOwnPropertySymbols } = Object;

const identity = (x) => x;

export function compose(...fns) {
  if (!fns.length) fns = [identity];
  return fns.reduce((f, g) => (x) => f(g(x)));
}

export function every(pred, iterable) {
  for (const value of iterable) {
    if (!pred(value)) return false;
  }
  return true;
}

export function isSubtypeOf(grammar, supertype, type) {
  return supertype === type || !!grammar.aliases.get(supertype)?.has(type);
}

export const productionFor = (type, value) => ({ type, value });

export const productions = (obj) => {
  return {
    *[Symbol.iterator]() {
      for (let type in obj) {
        if (hasOwn(obj, type)) {
          yield { type, value: obj[type] };
        }
      }
      const symTypes = getOwnPropertySymbols(obj);
      for (const type of symTypes) {
        yield { type, value: obj[type] };
      }
    },
  };
};
