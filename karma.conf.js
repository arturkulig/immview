var webpackConfig = require('./webpack.config.js');

webpackConfig.module.loaders = webpackConfig.module.loaders.filter(entry => entry.loader !== 'uglify');
webpackConfig.devtool = 'inline-source-map';
webpackConfig.entry = './tests/index.js';
webpackConfig.externals = {
    immutable: 'Immutable'
};

module.exports = function(config) {
    config.set({

        basePath: '',

        frameworks: ['jasmine'],

        files: (process.env.TRAVIS ? ['node_modules/babel-polyfill/dist/polyfill.min.js'] : []).concat([
            'node_modules/immutable/dist/immutable.js',
        ]).concat([
            'tests/index.js',
        ]),

        exclude: [],

        preprocessors: {
            'tests/index.js': [
                'webpack',
                'sourcemap',
                // 'coverage',
            ],
        },

        webpack: webpackConfig,

        babelPreprocessor: {
            options: {
                presets: ['es2015'],
                sourceMap: 'inline',
            },
        },

        reporters: [
            'progress',
            // 'coverage',
        ],

        // coverageReporter: {
        //     type: 'html',
        //     dir: 'tests',
        //     subdir: 'coverage',
        //     file: 'coverage.html',
        // },

        port: 9876,

        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: process.env.TRAVIS ? ['PhantomJS'] : ['Chrome', 'Firefox'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
    });
};
