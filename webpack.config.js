const path = require("path")

module.exports = {
    mode: "production",

    entry: "./src/app/ui.tsx",

    output: {
        filename: "ui.js",
        path: path.resolve(__dirname, 'dist/app')
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx"]
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        "loader": "ts-loader"
                    }
                ]
            },
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },

    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
}