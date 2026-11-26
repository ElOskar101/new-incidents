import js from '@eslint/js'
import globals from 'globals'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Module boundaries (deep modules): code reaches another module only through its
// `index.ts`. Inside a module, use relative imports.
//   - `@/features/<name>` and `@/shared/<name>` are modules (`shared/ui` and `shared/lib`
//     are plain toolboxes and may be imported file by file).
//   - `shared` never depends on `features`. Features never depend on each other: only
//     `App.tsx` composes them.
//   - A relative import never leaves its module, so the alias rules above cannot be bypassed.
//   - Network functions are called only from workflow hooks and feature services.
const ESCAPE_MESSAGE = 'Leave a module through the `@/` alias, not a relative path.'
const MODULE_PATTERNS = [
  {
    group: ['@/features/*/*', '@/shared/*/*', '!@/shared/ui/*', '!@/shared/lib/*'],
    message: 'Import from the module root (its index.ts), not from its internal files.',
  },
]
// Feature files sit at most one folder deep (`<feature>/<folder>/<file>`).
const FEATURE_PATTERNS = [
  { group: ['@/features', '@/features/*'], message: 'Features must not depend on each other.' },
  { group: ['../../*'], message: ESCAPE_MESSAGE },
]
const NETWORK_PATHS = [
  {
    name: '@/shared/api',
    importNames: ['requestJson'],
    message:
      'Call the network layer only from a feature workflow hook or service (hooks/ or services/).',
  },
]
const dependsOn = (modules, message) => ({ group: modules, message })
const restrict = ({ network = true, patterns = [] } = {}) => [
  'error',
  {
    paths: network ? NETWORK_PATHS : [],
    patterns: [...MODULE_PATTERNS, ...patterns],
  },
]

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.test.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Concise handlers like `onClick={() => setOpen(false)}` are idiomatic in React.
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrict() },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrict({
        patterns: [
          dependsOn(['@/features', '@/features/*'], 'Shared code must not depend on features.'),
          // Shared modules are one folder deep, so `../` always leaves the module.
          dependsOn(['../*'], ESCAPE_MESSAGE),
        ],
      }),
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrict({ patterns: FEATURE_PATTERNS }) },
  },

  {
    files: ['src/features/*/hooks/use-*-workflow.ts', 'src/features/*/services/**/*.ts'],
    rules: {
      'no-restricted-imports': restrict({ network: false, patterns: FEATURE_PATTERNS }),
    },
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    rules: {
      // Tests use non-null assertions and loose mocks to keep fixtures short.
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
])
