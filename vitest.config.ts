import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
      // Coverage + lazy routes make some flow tests exceed the 5s default.
      testTimeout: 15_000,
      // Node 25+ ships its own `localStorage` global, which shadows the jsdom one
      // and is undefined without `--localstorage-file`. Disable it in test workers.
      execArgv: ['--no-experimental-webstorage'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/main.tsx', 'src/**/*.d.ts', 'src/shared/ui/**'],
        reporter: ['text-summary', 'html'],
        // Start modest; raise as coverage grows with product features.
        thresholds: { statements: 40, branches: 35, functions: 40, lines: 40 },
      },
    },
  }),
)
