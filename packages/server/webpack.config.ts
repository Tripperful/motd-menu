import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const cd = (...args: string[]) => path.resolve(__dirname, ...args);
const buildDir = cd('./dist');

const config: () => Configuration = () => {
  return {
    entry: {
      index: './src/index.ts',
    },
    output: {
      filename: '[name].js',
      sourceMapFilename: '[file].map',
      path: buildDir,
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.js'],
      plugins: [new TsconfigPathsPlugin()],
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          diagnosticOptions: {
            semantic: true,
            syntactic: true,
          },
          mode: 'write-references',
        },
      }),
      new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
    ],
    module: {
      rules: [
        {
          test: /\.(t|j)s$/i,
          exclude: /node_modules/,
          use: 'ts-loader',
        },
        {
          test: /\.sql$/i,
          exclude: /node_modules/,
          use: 'raw-loader',
        },
      ],
    },
    devtool: 'source-map',
    target: ['node'],
  };
};

export default config;
