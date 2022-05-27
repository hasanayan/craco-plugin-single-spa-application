const SystemJSPublicPathPlugin = require("systemjs-webpack-interop/SystemJSPublicPathWebpackPlugin");

const overrideCracoConfig = ({
  cracoConfig,
  pluginOptions: { orgName, projectName, rootDirectoryLevel },
}) => {
  if (!cracoConfig.webpack) cracoConfig.webpack = {};
  if (!cracoConfig.webpack.plugins) cracoConfig.webpack.plugins = {};
  if (!cracoConfig.webpack.plugins.remove)
    cracoConfig.webpack.plugins.remove = [];

  cracoConfig.webpack.plugins.remove.push("HtmlWebpackPlugin");
  cracoConfig.webpack.plugins.remove.push("MiniCssExtractPlugin");

  cracoConfig.webpack.plugins.add = [
    ...(cracoConfig.webpack.plugins.add || []),
    new SystemJSPublicPathPlugin({
      systemjsModuleName: `@${orgName}/${projectName}`,
      rootDirectoryLevel: rootDirectoryLevel,
    }),
  ];

  cracoConfig.devServer = cracoConfig.devServer || {};
  cracoConfig.devServer.historyApiFallback = true;
  cracoConfig.devServer.compress = true;
  cracoConfig.devServer.headers = {
    ...cracoConfig.devServer.headers,
    "Access-Control-Allow-Origin": "*",
  };

  return cracoConfig;
}

module.exports = overrideCracoConfig
