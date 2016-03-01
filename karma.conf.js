var webpackConfig = require('./webpack.config.js');

webpackConfig.module.loaders = webpackConfig.module.loaders.filter(entry => entry.loader !== 'uglify');
webpackConfig.devtool = 'inline-source-map';
webpackConfig.entry = './tests/index.js';
webpackConfig.externals = null;

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: (process.env.TRAVIS ? ['node_modules/babel-polyfill/dist/polyfill.min.js'] : []).concat([
            //'node_modules/immutable/dist/immutable.js',
        ]).concat([
            'tests/index.js',
            //'src/index.js',
            //'tests/*.spec.js',
        ]),

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'tests/index.js': ['webpack', 'sourcemap', 'coverage'],
        },

        webpack: webpackConfig,

        babelPreprocessor: {
            options: {
                presets: ['es2015'],
                sourceMap: 'inline',
            },
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: 'tests',
            subdir: 'coverage',
            file: 'coverage.html',
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: process.env.TRAVIS ? ['PhantomJS'] : ['Chrome'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
    });
};
