import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json';

const name = 'CryptoMarketPriceInserter';

const terserOptions = {
  output: {
    comments: false,
  },
};

export default [
  {
    input: 'src/index.js',
    output: {
      file: `dist/${pkg.name}.js`,
      format: 'umd',
      name,
    },
    plugins: [
      nodeResolve({ browser: true }),
      commonjs(),
      terser(terserOptions),
    ],
  },
  {
    input: 'src/index.js',
    output: {
      file: `dist/${pkg.name}.es5.js`,
      format: 'umd',
      name,
    },
    plugins: [
      nodeResolve({ browser: true }),
      commonjs(),
      babel({ include: ['src/**/*'], babelHelpers: 'runtime' }),
      terser(terserOptions),
    ],
  },
];
