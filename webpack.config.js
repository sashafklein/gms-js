const path = require("path");

module.exports = {
  entry: "./src/index.js",
  node: { global: true },
  output: {
    libraryTarget: "umd",
    path: path.resolve(__dirname, "./build"),
    filename: "./index.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
};
