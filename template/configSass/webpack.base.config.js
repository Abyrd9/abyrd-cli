
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader!sass-loader",
        })
			},
			{
        test: /\.(png|svg|jpg|gif)$/,
          use: [
            'file-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ 
      template: './src/index.html', 
      filename: './index.html',
    }),
    new ExtractTextPlugin({
			filename: 'style.css',
			allChunks: true,
			disable: process.env.NODE_ENV !== 'production'
		})
  ]
}