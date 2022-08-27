const fs = require('fs')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const {
  RuleSetUse,
  CleanPlugin,
  ProgressPlugin,
  HotModuleReplacementPlugin,
} = require('webpack')

const rootPath = fs.realpathSync(process.cwd());
const __DEV__ = process.env.NODE_ENV === 'development';
const __PROD__ = process.env.NODE_ENV === 'production';
const resolve = (realtivePath) => path.resolve(rootPath, realtivePath);
const outputPath = resolve('static')

const useStyle = (loader, options) => {
  const styleLoaders = [
    __PROD__ ? MiniCssExtractPlugin.loader : 'style-loader',
    {
      loader: 'css-loader',
      options: { importLoaders: loader ? 2 : 1 },
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          ident: 'postcss',
          config: false,
          plugins: [
            'postcss-flexbugs-fixes',
            [
              'postcss-preset-env',
              { autoprefixer: { flexbox: 'no-2009' }, stage: 3 },
            ],
            'postcss-normalize',
          ],
        },
      },
    },
  ];

  loader && styleLoaders.push({ loader, options });
  return styleLoaders;
};

module.exports = {
  mode: __DEV__ ? 'development' : __PROD__ ? 'production' : 'none',
  devtool: __PROD__ ? 'hidden-source-map' : 'eval-cheap-source-map',
  entry: {
    app: [resolve('client/index.tsx')],
  },
  output: {
    path: outputPath,
    filename: __DEV__ ? 'js/[name].js' : 'js/[name].[contenthash:10].js',
    chunkFilename: __DEV__
      ? 'js/[name].chunk.js'
      : 'js/[name].[contenthash:10].chunk.js',
    publicPath: __DEV__ ? '/' : './',
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': resolve('client'),
    },
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(j|t)sx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            options: {
              cacheDirectory: true,
              presets: [
                ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }],
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [__DEV__ && 'react-refresh/babel'].filter(Boolean),
            },
          },
          {
            test: /\.css$/,
            use: useStyle(),
          },
          {
            test: /\.s(c|a)ss$/,
            use: useStyle('sass-loader', {
              sassOptions: { javaScriptEnabled: true },
            }),
          },
          {
            test: /\.(png|jpe?g|gif|webp|svg)$/,
            type: 'asset',
            generator: { filename: 'images/[name].[hash:8][ext]' },
            parser: { dataUrlCondition: { maxSize: 1024 * 8 } },
          },
          {
            exclude:
              /\.(png|jpe?g|git|webp|svg|tsx?|jsx?|mjs|json|css|scss|sass|less|html|vue)$/,
            type: 'asset/resource',
            generator: { filename: 'assets/[name].[hash:8][ext]' },
          },
        ],
      },
    ],
  },
  plugins: [
    new ProgressPlugin(),
    new CleanWebpackPlugin({cleanOnceBeforeBuildPatterns: [outputPath]}),
    new HtmlWebpackPlugin({
      template: resolve('public/index.html'),
      title: 'Todo',
      ...(__PROD__ && {
        minify: { removeComments: true, removeTagWhitespace: true },
      }),
    }),
    __DEV__ && new HotModuleReplacementPlugin(),
    __DEV__ && new ReactRefreshPlugin({ overlay: { sockIntegration: 'whm' } }),
    __PROD__ &&
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:10].css',
        chunkFilename: 'css/[name].[contenthash:10].chunk.css',
      }),
  ].filter(Boolean),
  optimization: {
    minimize: __PROD__,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          compress: {
            drop_console: true,
            ecma: 5,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      maxSize: 1024 * 1024,
      minSize: (1024 * 1024) / 2,
    },
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 50000000,
    maxAssetSize: 30000000,
    assetFilter: (filename) => filename.endsWith('.js'),
  },
};
