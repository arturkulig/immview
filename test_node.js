var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var Jasmine = require('jasmine');

function runJasmine() {
    var jasmine = new Jasmine();
    jasmine.loadConfig({
        spec_dir: './',
        spec_files: [
            'tmp_test_bundle.js'
        ],
        helpers: []
    });
    jasmine.configureDefaultReporter({
        showColors: true
    });
    return new Promise(function (resolve, reject) {
        jasmine.onComplete(function(passed) {
            (passed ? resolve : reject)();
        });
        jasmine.execute();
    });
}

function getWebpackConfig() {
    var webpackConfig = require('./webpack.config.js');
    
    webpackConfig.entry = path.resolve(__dirname, 'tests/index.js');
    webpackConfig.output = {
        path: __dirname,
        filename: 'tmp_test_bundle.js',
    };
    webpackConfig.externals = null;
    return webpackConfig;
}

function promisify(resolve, reject) {
    return function(err, result) {
        if (!err) {
            resolve(result);
        } else {
            reject(err);
        }
    };
}

function startWebpack() {
    new Promise(function (resolve, reject) {
        webpack(getWebpackConfig())
            .run(promisify(resolve, reject));
    })
        .then(function() {
            return new Promise(function (resolve, reject) {
                fs.stat(
                    path.resolve(__dirname, 'tmp_test_bundle.js'),
                    promisify(resolve, reject)
                );
            });
        })
        .then(function(stat) {
            if (stat.isFile()) {
                return runJasmine();
            }
        })
        .catch(function(err) {
            console.error('ERROR!', err);
            process.exitCode = 1;
        })
        .then(function() {
            fs.unlink(path.resolve(__dirname, 'tmp_test_bundle.js'));
            fs.unlink(path.resolve(__dirname, 'tmp_test_bundle.js.map'));
        })
    ;
}

startWebpack();
