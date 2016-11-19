var webpack = require('webpack');
var path = require('path');
var loaders = require('./webpack.loaders');

module.exports = {
	entry: [
		'./src/index.jsx' // Your appʼs entry point
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	postcss() {
		return [require('precss'), require('autoprefixer')]
	},
	resolve: {
		extensions: ['', '.js', '.jsx']
	},
	module: {
		loaders: loaders
	}
};
