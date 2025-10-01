import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
codex/setup-project-with-eslint-and-vitest
    plugins: [react(), tsconfigPaths()],
=======
    plugins: [react()],
main
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
codex/setup-project-with-eslint-and-vitest
        '@': path.resolve(__dirname, '.'),
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      passWithNoTests: true,
      coverage: {
        reporter: ['text', 'html', 'lcov'],
        thresholds: {
          lines: 0,
          functions: 0,
          statements: 0,
          branches: 0,
        },
      },
    },
=======
        '@': path.resolve(__dirname, './src'),
      },
    },
main
  };
});
