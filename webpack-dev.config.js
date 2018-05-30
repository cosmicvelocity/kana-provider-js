'use strict';

const path = require('path');
const webpackConfig = require('./webpack.config');

module.exports = Object.assign({}, webpackConfig, {
    mode: 'development',
    devtool: 'source-map',
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        contentBase: path.join(__dirname, '/'),
        disableHostCheck: true,
        hot: true,
        watchOptions: {
            aggregateTimeout: 500,
            ignored: /node_modules/,
            poll: 500
        }
    }
});
