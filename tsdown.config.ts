import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/lib/index.ts'],
  outDir: 'dist/lib',
  format: ['esm', 'cjs'],
  target: 'esnext',
  dts: true,
  minify: true,
  shims: true,
  sourcemap: true,
  publint: true,
});
