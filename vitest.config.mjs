import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['dotenv/config'],
    fileParallelism: false,
    include: ['src/**/_test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/app.js', '**/_test/**'],
    },
  },
});
