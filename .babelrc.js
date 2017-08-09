const env = process.env.BABEL_ENV || process.env.NODE_ENV || '';

const presets = ['stage-2'];

const plugins = [
  'syntax-dynamic-import',
  'transform-async-to-generator',
  'transform-object-rest-spread',
  'transform-regenerator',
  'transform-runtime'
];

switch (env) {
  case 'cjs':
    presets.push([
      'env',
      {
        targets: {
          node: [
            'v8',
          ],
        },
        modules: 'commonjs',
        useBuiltIns: true,
      },
    ]);

    plugins.push('transform-es2015-modules-commonjs');
    break;

  case 'es6':
    presets.push([
      'env',
      {
        targets: {
          node: [
            'v8',
          ],
        },
        modules: false,
        useBuiltIns: true,
      },
    ]);

    plugins.push('lodash');
    plugins.push('./build/use-lodash-es');
    break;

  default:
    break;
}

module.exports = {
  presets,
  plugins,
};
