const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const toolName = 'gerdu';
const entry_file = path.resolve(__dirname, 'src', 'index.js');
const output_path = path.resolve('bin');
const environment = process.env.NODE_ENV || 'development';

// plugins
const ShebangPlugin = require('webpack-shebang-plugin');

module.exports = {
  mode: environment,
  entry: { 'index.js': entry_file },
  target: 'node',
  devtool: 'source-map',
  output: {
    path: output_path,
    filename: `${toolName}.js`,
  },
  plugins: [
    new ShebangPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.(ts|js)x?$/,
        exclude: /(node_modules)/,
        use: ['babel-loader'],
        include: path.resolve(__dirname, 'src'),
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [
      path.resolve(__dirname, './src'),
      'node_modules', path.resolve(__dirname, 'node_modules'),
    ],
    alias: {
      '@app': path.resolve(__dirname, './src/'),
      '@test': path.resolve(__dirname, './test/'),
      '@root': path.resolve(__dirname, './'),
    },
  },
};
