import { ReadOnlyMap, ReadOnlySet, every, compose } from './utils.js';

const isIterable = (value) => Symbol.iterator in value;
const isString = (value) => typeof value === 'string';
const isSymbol = (value) => typeof value === 'symbol';
const isType = (value) => isString(value) || isSymbol(value);
const empty = [][Symbol.iterator]();
const _ = Symbol('_');

export const Fragment = Symbol.for('@cst-tokens/node/Fragment');

const buildTerminals = (productions, enhancers, grammar) => {
  const terminals = new Map();
  // const nodeTypes = aliases.get('Node');

  const enhancer = compose(...enhancers);

  for (let production of productions) {
    production = enhancer(production);

    const { type } = production;

    const baseProduction = terminals.get(type);

    terminals.set(type, {
      ...production,
      match(props) {
        return production.match(props, grammar, baseProduction);
      },
    });
  }

  return terminals;
};

const explodeSubtypes = (aliases, exploded, types) => {
  for (const type of types) {
    const explodedTypes = aliases.get(type);
    if (explodedTypes) {
      for (const explodedType of explodedTypes) {
        exploded.add(explodedType);
        const subtypes = aliases.get(explodedType);
        if (subtypes) {
          explodeSubtypes(aliases, exploded, subtypes);
        }
      }
    }
  }
};

const buildAliases = (rawAliases) => {
  const aliases = new Map();

  for (const alias of rawAliases) {
    if (!isType(alias[0])) throw new Error('alias[0] key must be a string or symbol');
    if (!isIterable(alias[1])) throw new Error('alias[1] must be an iterable');
    if (!every(isType, alias[1])) throw new Error('alias[1] values must be strings or symbols');

    aliases.set(alias[0], new Set(alias[1]));
  }

  for (const [type, types] of aliases.entries()) {
    explodeSubtypes(aliases, aliases.get(type), types);
  }

  return new ReadOnlyMap(aliases);
};

export class Grammar {
  constructor(grammar) {
    const { base, context, productions, enhancers, aliases: rawAliases = empty } = grammar;

    if (!productions) throw new Error('grammar must have productions');

    const aliases = buildAliases(rawAliases, productions);

    this[_] = { base, context, aliases };
    this[_].terminals = buildTerminals(productions, enhancers, this);
  }

  get context() {
    return this[_].context;
  }

  get aliases() {
    return this[_].aliases;
  }

  get size() {
    return this[_].terminals.size;
  }

  has(type) {
    return this[_].terminals.has(type) || (this[_].base ? this[_].base.has(type) : false);
  }

  get(type) {
    return this[_].terminals.has(type)
      ? this[_].terminals.get(type)
      : this[_].base
      ? this[_].base.get(type)
      : undefined;
  }

  set() {
    throw new Error('grammar.set() is unimplemented');
  }

  delete() {
    throw new Error('grammar.delete() is unimplemented');
  }

  clear() {
    throw new Error('grammar.clear() is unimplemented');
  }

  // isSubtypeOf?
  is(supertype, type) {
    return supertype === type || !!this[_].aliases.get(supertype)?.has(type);
  }

  keys() {
    return this[_].terminals.keys();
  }

  values() {
    return this[_].terminals.values();
  }

  entries() {
    return this[_].terminals.entries();
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

export default Grammar;
