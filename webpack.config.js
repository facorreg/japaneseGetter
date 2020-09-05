/* eslint-disable no-unused-vars */
const webpack = require('webpack');
const path = require('path');
const NodemonPlugin = require('nodemon-webpack-plugin');

const config = {
  entry: './server.js',
  resolve: {
    extensions: ['.mjs', '.js'],
    alias: {
      utils: path.resolve(__dirname, 'src/utils/'),
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  target: 'node',
  plugins: [new NodemonPlugin()],
};

module.exports = config;
