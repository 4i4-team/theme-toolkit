import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';

const input = {
  index: 'src/index.ts',
  media: 'src/adapters/styled-components/media.ts',
  layout: 'src/subsystems/layout/index.ts',
  colors: 'src/subsystems/colors/index.ts',
  typography: 'src/subsystems/typography/index.ts',
  theme: 'src/core/theme/index.ts'
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
