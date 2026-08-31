import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Esegue solo file *.test.ts fuori dalla cartella api-client (generata)
    include: ['src/**/*.test.ts'],
    exclude: ['src/api-client/**'],
    environment: 'node',
  },
});
