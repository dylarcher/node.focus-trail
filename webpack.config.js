const path = require('path');

module.exports = {
  mode: 'development', // Can be 'production' or 'development'
  entry: './focus-flow.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: 'FocusFlow', // To make it accessible globally, if needed
    libraryTarget: 'umd', // Universal Module Definition
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  devtool: 'source-map', // For better debugging
};
