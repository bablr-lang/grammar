# @cst-tokens/grammar

The `Grammar` class helps you build grammars that define operations whose results are defined over a set of CST node types (or AST node types for that matter).

## Features:

- Grammars are defined as a sequence of productions. Written as `new Grammar({ productions: Iterable<[type, production]> })`. Productions later in the sequence overwrite productions earlier in the sequence.
- Aliases. Written as `new Grammar({ aliases: Iterable<[supertype, subtypes[]]> })`, an alias `grammar.get(type)` will return the bottommost production which is, or is an alias for `type`.
- The `Node` alias always exists. It refers to all defined concrete types.
- Implements the javascript [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) API.
- Grammars are immutable. `grammar.set()`, `grammar.delete()`, and `grammar.clear()` are errors.
- `new Grammar({ base: new Grammar() }).base`. Grammars can be nested, and inherit productions from base grammars except where they are explicitly overridden.
- Production chaining -- productions are `(props, grammar, next) => result` where `next` is the production that was overridden (if any). It is the responsibility of the user not to call `next` if it does not exist.

## Usage

```js
import { Grammar } from '@cst-tokens/grammar';
import { objectEntries, wrap } from '@cst-tokens/helpers/iterable';
// import { aliases } = from 'some-grammar/version';

const aliases = [
  ['Statement', ['ReturnStatement', 'ExpressionStatement']],
  ['Expression', ['PrefixExpression', 'SuffixExpression']],
];

const needsParens = new Grammar({
  aliases: wrap(aliases),
  productions: objectEntries({
    PrefixExpression(props) {
      props.path.parent === 'SuffixExpression';
    },
    SuffixExpression(props) {
      props.path.parent === 'PrefixExpression';
    },
    Node() {
      return false;
    },
  }),
});
```
