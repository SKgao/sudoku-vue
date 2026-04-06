import path from 'node:path'
import { defineConfig } from '@tarojs/cli'

export default defineConfig<'webpack5'>({
  projectName: 'sudoku-vue',
  date: '2026-04-06',
  designWidth: 375,
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'vue3',
  compiler: {
    type: 'webpack5'
  },
  cache: {
    enable: false
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      url: {
        enable: true,
        config: {
          limit: 1024
        }
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', path.resolve(__dirname, '..', 'src'))
      chain.resolve.alias.set('utils', path.resolve(__dirname, '..', 'src', 'utils'))
    }
  }
})
