import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'Constrainautor': './src/Constrainautor.ts',
        'BitSet': './src/BitSet.ts'
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => 
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`
    },
    rollupOptions: {
      external: ['robust-predicates']
    }
  },
  plugins: [dts()]
});