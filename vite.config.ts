import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const isPackageBuild = process.env.BUILD_MODE === 'package';

export default defineConfig({
  base: './',
  build: isPackageBuild ? {
    lib: {
      entry: resolve(process.cwd(), 'src/index.ts'),
      formats: ['es', 'cjs', 'umd'],
      name: 'edgeruler',
      fileName: (format, entryName) => {
        switch(format) {
          case 'es':
            return 'edgeruler.js';
          case 'cjs':
            return 'edgeruler.cjs';
          case 'umd':
            return 'edgeruler.umd.cjs';
          default:
            return 'edgeruler.js';
        }
      }
    }
  } : {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  },
  plugins: [dts()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version)
  }
});