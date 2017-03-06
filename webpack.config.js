module.exports = {
  entry: './lib/index.js',
  output: {
    filename: 'web/index.js',
    libraryTarget: 'var',
    library: 'tinyhttp',
  },
};
