import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';

const input = {
  index: 'src/index.ts',
  media: 'src/media/index.ts',
  layout: 'src/layout/index.ts',
  colors: 'src/colors/index.ts',
  typography: 'src/typography/index.ts',
  theme: 'src/theme/index.ts'
};

export default {
  input,
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      entryFileNames: '[name].cjs.js',
      chunkFileNames: '_[name]-[hash].cjs.js'
    },
    {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      exports: 'named',
      entryFileNames: '[name].esm.js',
      chunkFileNames: '_[name]-[hash].esm.js'
    }
  ],
  plugins: [
    external(),
    typescript({ tsconfig: './tsconfig.json' }),
    terser()
  ]
};
