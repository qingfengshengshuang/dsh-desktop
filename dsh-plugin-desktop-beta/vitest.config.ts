import { defineConfig } from 'vitest/config'

export default defineConfig({
  // dshmarket 1.70.1 ships its own `undici`; without deduping, the transport
  // mock in tests/dshmarket-compat.spec.ts patches the hoisted copy while the
  // market talks through the nested one and reaches the live registry.
  resolve: {
    dedupe: ['undici'],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    globalSetup: process.platform === 'win32' ? ['../scripts/prepare-test-electron.mjs'] : [],
    // Keep patched packages in Vitest's module graph so mocks reach their
    // fs/promises and undici imports instead of using the live filesystem/network.
    server: {
      deps: {
        inline: ['@deepseek-ai/dsh-host-directory-picker-browse', '@deepseek-ai/dsh-native-command', 'dshmarket'],
      },
    },
    // Profile integration tests create a full package-junction closure; higher
    // Windows file concurrency makes their latency depend on NTFS/Defender load.
    maxWorkers: process.platform === 'win32' ? 2 : undefined,
  },
})
