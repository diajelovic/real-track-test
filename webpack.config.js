import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";

export default {
  context: path.resolve(path.dirname("./"), "client"),
  entry: "./entry.client.tsx",
  output: {
    path: path.resolve(path.dirname("./"), "./public"),
    filename: "bundle.js",
  },
  mode: "development",
  module: {
    rules: [
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "RealTracTest",
      template: "index.html",
    }),
    new MiniCssExtractPlugin(),
  ],
};
