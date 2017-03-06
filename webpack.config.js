const webpack = require('webpack');

module.exports = {
  entry: './lib/index.js',
  output: {
    filename: 'web/index.js',
    libraryTarget: 'var',
    library: 'tinyhttp',
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({ minimize: true })
  ]
};
