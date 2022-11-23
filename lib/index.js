const { isArray } = Array;
const isString = (value) => typeof value === 'string';
const empty = [][Symbol.iterator]();

function* flat(nestedIterable) {
  for (const iterable of nestedIterable) yield* iterable;
}

const buildProductionByType = (productions, grammar) => {
  const { concreteTypesByType } = grammar;
  const productionByType = new Map();

  for (const [type, production] of productions) {
    const concreteTypes = concreteTypesByType.get(type);
    if (concreteTypes) {
      for (const concreteType of concreteTypes) {
        productions.set(concreteType);
      }
    } else {
      const nextProduction = productionByType.get(type);

      productionByType.set(type, function bindNext(props) {
        return production(props, grammar, nextProduction);
      });
    }
  }

  return productionByType;
};

const explodeSubtypes = (typesByType, exploded, types) => {
  for (const type of types) {
    const explodedTypes = typesByType.get(type);
    if (explodedTypes) {
      exploded.delete(type);
      for (const explodedType of explodedTypes) {
        exploded.add(explodedType);
        const subtypes = typesByType.get(explodedType);
        if (subtypes) {
          explodeSubtypes(typesByType, exploded, subtypes);
        }
      }
    }
  }
};

const buildConcreteTypesByType = (alises) => {
  const concreteTypesByType = new Map();

  for (const alias of alises) {
    if (!isString(alias[0])) throw new Error('alias[0] key must be a string');
    if (!isArray(alias[1])) throw new Error('alias[1] must be an array');
    if (!alias[1].every(isString)) throw new Error('alias[1] values must be strings');

    concreteTypesByType.set(alias[0], new Set(alias[1]));
  }

  for (const types of concreteTypesByType.values()) {
    explodeSubtypes(concreteTypesByType, types, types);
  }

  concreteTypesByType.set('Node', new Set(flat(concreteTypesByType.values())));

  return concreteTypesByType;
};

export class Grammar {
  constructor(grammar, base) {
    const { context, productions, aliases = empty } = grammar;

    this.base = base;
    this.context = context;
    this.concreteTypesByType = buildConcreteTypesByType(aliases);
    this.productionByType = buildProductionByType(productions, this);
  }

  get size() {
    return this.productionByType.size;
  }

  has(type) {
    return this.productionByType.has(type) || (this.base ? this.base.has(type) : false);
  }

  get(type) {
    return this.productionByType.has(type)
      ? this.productionByType.get(type)
      : this.base
      ? this.base.get(type)
      : undefined;
  }

  set() {
    throw new Error('grammar.set called on an immutable grammar');
  }

  delete() {
    throw new Error('grammar.delete called on an immutable grammar');
  }

  clear() {
    throw new Error('grammar.clear called on an immutable grammar');
  }

  is(supertype, type) {
    return supertype === type || this.concreteTypesByType.get(supertype).has(type);
  }

  keys() {
    return this.productionByType.keys();
  }

  values() {
    return this.productionByType.values();
  }

  entries() {
    return this.productionByType.entries();
  }

  forEach(fn) {
    for (const [key, value] of this) {
      fn(value, key);
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }
}
