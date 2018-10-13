const path = require("path");

module.exports = {
    entry: "./src/client/main.ts",
    mode: "development",
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: /node_modules/,
                options: {
                    configFile: path.join(__dirname,"tsconfig.webpack.json")
                }
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts"]
    },
    output: {
        filename: "main.js",
        path: path.join(__dirname,"assets")
    }
}