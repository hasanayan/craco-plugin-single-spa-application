const path = require("path");
const SystemJSPublicPathPlugin = require("systemjs-webpack-interop/SystemJSPublicPathWebpackPlugin");
const systemjsInterop = require("systemjs-webpack-interop/webpack-config");
const webpack = require("webpack");

const getWebpackMajorVersion = () => webpack.version.split(".")[0];

const buildOptimizations = (webpackConfig, minimize) => {
  const optimization = {
    ...webpackConfig.optimization,
    minimize,
    splitChunks: {
      chunks: "async",
      cacheGroups: { default: false },
    }
  }

  const webpackMajorVersion = getWebpackMajorVersion();
  if (webpackMajorVersion < 5) {
    optimization.namedModules = true;
    optimization.namedChunks = true;
  } else {
    optimization.moduleIds = "named";
    optimization.chunkIds = "named";
  }

  delete optimization.runtimeChunk;

  return optimization;
}

module.exports = {
  overrideWebpackConfig: ({
    webpackConfig,
    pluginOptions: {
      orgName,
      projectName,
      entry,
      orgPackagesAsExternal,
      reactPackagesAsExternal,
      externals: userExternals = [],
      minimize = false,
      outputFilename,
    },
    context: { env },
  }) => {
    if (typeof orgName !== "string") {
      throw Error(
        `craco-plugin-single-spa-application requires an orgName string`
      );
    }

    if (typeof projectName !== "string") {
      throw Error(
        `craco-plugin-single-spa-application requires an opts.projectName string`
      );
    }

    webpackConfig.entry = path.resolve(entry || "src/index.js");
    webpackConfig.output.filename = outputFilename || `${orgName}-${projectName}.js`;
    webpackConfig.output.libraryTarget = "system";
    webpackConfig.output.devtoolNamespace = projectName;
    webpackConfig.output.publicPath = "";

    webpackConfig.optimization = buildOptimizations(webpackConfig, minimize);

    webpackConfig.module.rules.push({ parser: { system: false } });

    let externals = ["single-spa", ...userExternals];

    if (reactPackagesAsExternal !== false)
      externals = [...externals, "react", "react-dom"];

    if (orgPackagesAsExternal === true)
      externals = [...externals, new RegExp(`^@${orgName}/`)];

    webpackConfig.externals = externals;

    disableCSSExtraction(webpackConfig);

    systemjsInterop.checkWebpackConfig(webpackConfig);

    return webpackConfig;
  },

  overrideCracoConfig: ({
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
  },
};

const disableCSSExtraction = (webpackConfig) => {
  webpackConfig.module.rules[1].oneOf.forEach((x) => {
    if (!x.use) return;

    if (Array.isArray(x.use)) {
      x.use.forEach((use) => {
        if (use.loader && use.loader.includes("mini-css-extract-plugin")) {
          use.loader = require.resolve("style-loader/dist/cjs.js");
          delete use.options;
        }
      });
    }
  });
};
