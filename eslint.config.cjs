/**
 * typescript-eslint 8.65 is built against the TypeScript 6 JS API and throws outright when
 * `typescript` resolves to 7.x, which is what this project compiles with. The two are installed
 * side by side: `typescript` stays at 7.x for `tsc`, and `typescript-6` is an alias of 6.x kept
 * only for linting. Seeding the module cache hands the parser the 6.x API without changing what
 * anything else resolves — no type-aware rules are enabled, so this is parsing only.
 *
 * Drop this block, and the `typescript-6` devDependency, once typescript-eslint supports TS >= 7.1
 * (https://github.com/typescript-eslint/typescript-eslint/issues/10940).
 */
const Module = require('module')

const typescriptPath = require.resolve('typescript')
const typescript6 = new Module(typescriptPath)

typescript6.filename = typescriptPath
typescript6.loaded = true
typescript6.exports = require('typescript-6')
require.cache[typescriptPath] = typescript6

const js = require('@eslint/js')
const globals = require('globals')
const typescriptPlugin = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const jsxA11y = require('eslint-plugin-jsx-a11y')
const importPlugin = require('eslint-plugin-import')
const prettier = require('eslint-config-prettier/flat')

module.exports = [
  { ignores: ['dist/**', 'build/**', 'coverage/**', 'src/nasa'] },

  js.configs.recommended,
  ...typescriptPlugin.configs['flat/recommended'],
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,

  {
    files: ['**/*.{ts,tsx}'],

    // the import plugin was registered but left to the core rules below, as it was under eslintrc
    plugins: { import: importPlugin },

    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },

    settings: {
      // read straight off the installed React, as eslint-plugin-react's own `detect` reaches for
      // `context.getFilename()`, which ESLint 10 removed
      react: {
        version: require('react/package.json').version
      }
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      'no-invalid-this': 'off',
      'no-console': 'off',
      'no-var': 'off',
      'prefer-const': 1,
      'max-nested-callbacks': ['error', 6],
      'vars-on-top': 'off',
      'no-underscore-dangle': 'off',
      'func-style': 'off',
      'prefer-template': 'error',
      'no-loop-func': 'error',
      'prefer-arrow-callback': 'error',
      'no-dupe-class-members': 'off',
      '@typescript-eslint/no-dupe-class-members': 'error',
      'no-duplicate-imports': 'error',
      'one-var': ['error', 'never'],
      'react/prop-types': 'off',
      'react/no-unknown-property': 'off',
      'jsx-a11y/anchor-is-valid': ['warn', { aspects: ['invalidHref'] }]
    }
  },

  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', 'src/test/**'],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    }
  },

  prettier
]
