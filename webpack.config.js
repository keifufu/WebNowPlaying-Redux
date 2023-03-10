const path = require('path')

module.exports = {
  entry: {
    content: path.resolve(__dirname, 'src/extension/content/content.ts'),
    sw: path.resolve(__dirname, 'src/extension/sw/sw.ts')
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts']
  },
  output: {
    path: path.resolve(__dirname, 'dist/all'),
    filename: '[name].js',
    clean: false
  }
}