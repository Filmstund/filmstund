var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');

module.exports = {
	entry: [
		'webpack-dev-server/client?http://0.0.0.0:8080',
		'webpack/hot/only-dev-server',
		'./src/index.jsx' // Your appʼs entry point
	],
	devtool: process.env.WEBPACK_DEVTOOL || 'source-map',
	output: {
		path: __dirname + '/dist',
		publicPath: '/',
		filename: './bundle.js'
	},
	resolve: {
		extensions: ['', '.js', '.jsx']
	},
	module: {
		loaders: loaders
	},
	devServer: {
		historyApiFallback: true,
		contentBase: './dist',
		noInfo: true,
		hot: true,
		inline: true,
		proxy: {
			'/api/*': {
				target: 'http://localhost:3000',
				secure: false,
				rewrite(req) {
	      	req.url = req.url.replace(/^\/api/, '');
	      }
	    }
		},
	},
	plugins: [
		new webpack.NoErrorsPlugin()
	]
};
