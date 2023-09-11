const { hasOwn, getOwnPropertySymbols } = Object;

export const objectEntries = (obj) => {
  return {
    *[Symbol.iterator]() {
      for (let key in obj) if (hasOwn(obj, key)) yield [key, obj[key]];
      const symTypes = getOwnPropertySymbols(obj);
      for (const type of symTypes) {
        yield [type, obj[type]];
      }
    },
  };
};

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
