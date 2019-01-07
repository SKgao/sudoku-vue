const path = require('path')
const resolve = (dir) => {
  return path.join(__dirname, dir)
}

module.exports = {
  lintOnSave: true,
  // 别名配置
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('utils', resolve('src/utils'))
      .set('store', resolve('src/store'))
  }
}
