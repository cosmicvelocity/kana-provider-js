const webpack = require('webpack');

module.exports = {
    mode: 'production',
    context: __dirname + '/src',
    entry: {
        javascript: './index.js'
    },
    output: {
        path: __dirname + '/build',
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader'
                    }
                ]
            }
        ]
    }
};
