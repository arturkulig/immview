var path = require("path");
module.exports = {
    "entry": path.resolve(__dirname, "src/index.js"),
    "output": {
        path: __dirname + "/dist",
        filename: "immview.js",
        library: "immview",
        libraryTarget: "umd"
    },
    externals: {
        "immstruct": "immstruct",
        "Immutable": "Immutable"
    },
    "module": {
        "loaders": [
            {
                test: /\.js$/,
                loader: "babel",
                query: {
                    presets: ["es2015"]
                }
            }
        ]
    },
    devtool: "source-map"
};
