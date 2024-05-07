import GzipPlugin from 'compression-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration, DefinePlugin } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const cd = (...args: string[]) => path.resolve(__dirname, ...args);

const buildDir = cd('./dist');

const config: ({}, { mode }) => Configuration = (_, { mode }) => {
  return {
    entry: {
      index: './src/index.tsx',
    },
    output: {
      filename: '[name].js',
      sourceMapFilename: '[file].map',
      path: buildDir,
      clean: true,
      publicPath: '/',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      plugins: [new TsconfigPathsPlugin()],
    },
    plugins: [
      new DefinePlugin({
        BUILD_TIMESTAMP: Date.now(),
      }),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          diagnosticOptions: {
            semantic: true,
            syntactic: true,
          },
          mode: 'write-references',
        },
      }),
      new HtmlWebpackPlugin({
        title: 'MOTD menu',
        minify: true,
        hash: true,
        inject: false,
        template: './src/template.ejs',
        chunks: ['index'],
      }),
      new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
      ...(mode === 'production' ? [new GzipPlugin()] : []),
    ],
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/i,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.(png|webm|woff2?|wav)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.svg$/i,
          type: 'asset/resource',
          resourceQuery: /url/,
        },
        {
          test: /\.svg$/i,
          issuer: /\.[jt]sx?$/,
          resourceQuery: { not: [/url/] },
          use: ['@svgr/webpack'],
        },
      ],
    },
    devtool: 'source-map',
    target: ['web'],
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
  };
};

export default config;
