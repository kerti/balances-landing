import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default [
  { ignores: ['dist/', '.astro/'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  {
    // eslint-plugin-astro v3 no longer wires a TS parser for component
    // frontmatter itself; point it at typescript-eslint's parser.
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
];
