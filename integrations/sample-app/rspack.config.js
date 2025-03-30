import { defineConfig } from '@rspack/cli';
import path from 'path';
import ReactRefreshWebpackPlugin from '@rspack/plugin-react-refresh';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  entry: {
    client: './resources/views/client.tsx',
  },
  experiments: {
    css: true,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public/static'),
    publicPath: '/static/',
  },
  mode: 'development',
  devtool: 'source-map',
  target: 'web',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    tsConfig: path.resolve(
      __dirname,
      'resources',
      'views',
      'tsconfig.client.json',
    ),
  },
  module: {
    rules: [
      {
        test: /\.(jsx|tsx)$/,
        use: [
          {
            loader: 'builtin:swc-loader',
            options: {
              sourceMap: true,
              jsc: {
                parser: {
                  syntax: 'typescript',
                  tsx: true,
                },
                externalHelpers: true,
                preserveAllComments: false,
                transform: {
                  react: {
                    runtime: 'automatic',
                    throwIfNamespace: true,
                    useBuiltins: false,
                  },
                },
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [new ReactRefreshWebpackPlugin()],
  devServer: {
    port: 5173,
    hot: true,
    static: {
      directory: path.resolve(__dirname, 'public'),
      publicPath: '/',
    },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    ],
    historyApiFallback: true,
  },
});
