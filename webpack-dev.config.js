'use strict';

const webpackConfig = require('./webpack.config');

module.exports = Object.assign({}, webpackConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        host: '0.0.0.0',
        port: 8080,
        contentBase: __dirname,
        compress: true,
        disableHostCheck: true,
        hot: true,
        watchOptions: {
            aggregateTimeout: 500,
            ignored: /node_modules/,
            poll: 500
        }
    }
});
