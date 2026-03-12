// @ts-check
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },

  ...tseslint.configs.recommended,

  // Prettier
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Jest only for tests
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      boundaries,
    },

    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/**' },
        { type: 'application', pattern: 'src/application/**' },
        { type: 'infrastructure', pattern: 'src/infrastructure/**' },
        { type: 'http', pattern: 'src/interfaces/http/**' },
      ],
    },

    rules: {
      // =====================
      // TypeScript
      // =====================
      '@typescript-eslint/no-explicit-any': 'error',

      // =====================
      // Import sorting
      // =====================
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^node:'],
            ['^@?\\w'],
            ['^\\.'],
            ['^\\u0000'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',

      // =====================
      // Architectural boundaries
      // =====================
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'domain',
              allow: ['domain'],
            },
            {
              from: 'application',
              allow: ['domain', 'application'],
            },
            {
              from: 'http',
              allow: ['domain', 'application', 'http'],
            },
            {
              from: 'infrastructure',
              allow: ['domain', 'application', 'infrastructure'],
            },
          ],
        },
      ],
    },
  },
);
