import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import external from 'rollup-plugin-peer-deps-external';

const input = 'src/index.ts';

export default {
  input,
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    }
  ],
  plugins: [
    external(),
    typescript({ tsconfig: './tsconfig.json' }),
    terser()
  ]
};
