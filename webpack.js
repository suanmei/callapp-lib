const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const EslintFormatter = require('eslint-friendly-formatter');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  entry: resolve('index.js'),
  mode: 'production',
  devtool: false,
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'callappLib',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: resolve('index.js'),
        options: {
          formatter: EslintFormatter,
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['build']),
  ],
};
