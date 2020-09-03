/* eslint-disable no-unused-vars */
const webpack = require('webpack');
const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');

const config = {
  entry: './index.mjs',
  resolve: {
    extensions: ['.mjs', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  target: 'node',
  plugins: [new NodemonPlugin()],
};

module.exports = config;
