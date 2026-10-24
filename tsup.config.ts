import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', 'rich-text': 'src/rich-text.ts', calendar: 'src/calendar.ts' },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react-router-dom'],
});
