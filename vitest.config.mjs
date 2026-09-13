import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // expose describe/it/expect/vi as globals, like Jest did
    globals: true,
    // memuat variabel environment dari .env sebelum test dijalankan
    setupFiles: ['dotenv/config'],
    // test berbagi satu database Postgres, jadi berkas test harus
    // dijalankan berurutan (padanan `jest -i`)
    fileParallelism: false,
    include: ['src/**/_test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      // app.js hanya bootstrap server dan tidak diuji unit
      exclude: ['src/app.js', '**/_test/**'],
    },
  },
});
