import { defineConfig } from 'vite-plus';

// Single canonical lint + format standard for the whole workspace — there are no
// per-package lint/fmt overrides. `vp check` (run from the repo root) applies this
// to every package. Apps' own vite.config.ts files carry build settings only.
const IGNORE_PATTERNS: string[] = [
  '**/dist/**',
  '**/dist-baseline/**',
  '**/node_modules/**',
  '**/.vite-ssg-temp/**',
  'pnpm-lock.yaml',
];

export default defineConfig({
  run: { cache: true },
  lint: {
    plugins: ['eslint', 'typescript', 'oxc', 'unicorn', 'import', 'vue', 'promise'],
    categories: {
      correctness: 'error',
      suspicious: 'error',
      perf: 'error',
      pedantic: 'error',
    },
    env: {
      browser: true,
      node: true,
      vue: true,
    },
    ignorePatterns: IGNORE_PATTERNS,
    rules: {
      'eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      eqeqeq: ['error', 'smart'],
      'import/no-default-export': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'no-inline-comments': 'off',
      'no-warning-comments': 'off',
      'import/no-unassigned-import': ['error', { allow: ['**/*.css', '**/*.scss'] }],
    },
    overrides: [
      {
        // Cross-cutting (file-pattern-based), not package-specific.
        files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
        rules: {
          'typescript/no-explicit-any': 'off',
          'eslint/max-lines': 'off',
          'eslint/max-lines-per-function': 'off',
        },
      },
    ],
  },
  fmt: {
    singleQuote: true,
    sortImports: {
      internalPattern: ['@/'],
      newlinesBetween: false,
    },
    ignorePatterns: IGNORE_PATTERNS,
  },
});
