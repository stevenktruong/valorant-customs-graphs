module.exports = {
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    module: {
        loaders: [
            // Typescript
            { test: /\.tsx?$/, loader: "ts-loader" }
        ],
    },
};
