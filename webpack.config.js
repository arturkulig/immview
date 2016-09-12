// jscs:disable
var path = require('path');
var webpack = require('webpack');

var config = {
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: __dirname + '/dist',
        filename: 'immview.js',
        library: 'immview',
        libraryTarget: 'umd',
    },
    externals: {
        immutable: 'immutable',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules\/immutable\/dist\/immutable\.js/,
                loader: 'babel',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-object-rest-spread', 'transform-flow-strip-types'],
                },
            },
        ],
    },
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env':{
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]
};

if (process.env.NODE_ENV === 'production') {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compressor: {
            pure_getters: true,
            unsafe: true,
            unsafe_comps: true,
            screw_ie8: true,
            warnings: false
        }
    }));
}

module.exports = config;
