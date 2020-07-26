const env = process.env.BABEL_ENV || process.env.NODE_ENV || 'build';

const presets = [];
const plugins = [];

switch (env) {
  case 'cjs':
    presets.push([
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'commonjs',
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ]);
    break;

  case 'build':
  default:
    presets.push([
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: false,
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ]);

    plugins.push('lodash');
    plugins.push('./use-lodash-es');
    break;
}

module.exports = {
  presets,
  plugins,
};
