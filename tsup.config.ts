import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'better-auth', 'better-auth/react', 'better-auth/client/plugins', '@better-auth/api-key/client', '@better-auth/oauth-provider/client'],
});
