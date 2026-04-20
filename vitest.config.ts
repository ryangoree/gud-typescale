/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    alias: {
      '#src/': '/src/',
    },
    coverage: {
      include: ['src/**/*.ts'],
    },
  },
});
