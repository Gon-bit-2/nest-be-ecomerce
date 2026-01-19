const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = function (options) {
  return {
    ...options,
    plugins: [
      ...options.plugins.filter((plugin) => !(plugin instanceof ForkTsCheckerWebpackPlugin)),
      new ForkTsCheckerWebpackPlugin({
        typescript: {
          memoryLimit: 4096,
        },
      }),
    ],
  }
}
