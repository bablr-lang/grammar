import { productions, productionFor, isSubtypeOf, objectEntries } from './utils.js';
import compose from 'iter-tools-es/methods/compose';
import every from 'iter-tools-es/methods/every';
import isString from 'iter-tools-es/methods/is-string';
import isArray from 'iter-tools-es/methods/is-array';

export { productions, productionFor, isSubtypeOf };

const isSymbol = (value) => typeof value === 'symbol';
const isType = (value) => isString(value) || isSymbol(value);
const empty = [][Symbol.iterator]();

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

export const buildCovers = (rawAliases) => {
  const aliases = new Map();

  for (const alias of objectEntries(rawAliases)) {
    if (!isType(alias[0])) throw new Error('alias[0] key must be a string or symbol');
    if (!isArray(alias[1])) throw new Error('alias[1] must be an array');
    if (!every(isType, alias[1])) throw new Error('alias[1] values must be strings or symbols');

    aliases.set(alias[0], new Set(alias[1]));
  }

  for (const [type, types] of aliases.entries()) {
    explodeSubtypes(aliases, aliases.get(type), types);
  }

  return new Map(aliases);
};

export const buildGrammar = (grammar, enhancers = empty) => {
  const { extends: BaseGrammar = Object, productions } = compose(...enhancers)(grammar);

  if (!productions) throw new Error('grammar must have productions');

  class Grammar extends BaseGrammar {}

  for (const { type, value } of productions) {
    Grammar.prototype[type] = value;
  }

  return Grammar;
};

export default buildGrammar;
