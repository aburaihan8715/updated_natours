import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
    rules: {
      'prefer-const': 'warn',
      'no-console': 'warn',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: 'req|res|next|val|error',
        },
      ],
    },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];
