const path = require("path");
const systemjsInterop = require("systemjs-webpack-interop/webpack-config");
const webpack = require("webpack");

const getWebpackMajorVersion = () => webpack.version.split(".")[0];

const buildOptimizations = (webpackMajorVersion, webpackConfig, minimize) => {
  const optimization = {
    ...webpackConfig.optimization,
    minimize,
    splitChunks: {
      chunks: "async",
      cacheGroups: { default: false },
    }
  }

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

const buildExternals = (webpackConfig, reactPackagesAsExternal, orgPackagesAsExternal, orgName) => {
  const externals = [];

  if (webpackConfig.externals) {
    if (Array.isArray(webpackConfig.externals)) {
      externals.push(...webpackConfig.externals);
    } else {
      externals.push(webpackConfig.externals);
    }
  }

  externals.push("single-spa");

  if (!!reactPackagesAsExternal) {
    externals.push("react", "react-dom");
  }

  if (!!orgPackagesAsExternal) {
    externals.push(new RegExp(`^@${orgName}/`));
  }

  return externals;
}

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

const overrideWebpackConfig = ({
  webpackConfig,
  pluginOptions: {
    orgName,
    projectName,
    entry,
    orgPackagesAsExternal,
    reactPackagesAsExternal,
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

  const webpackMajorVersion = getWebpackMajorVersion();
  webpackConfig.optimization = buildOptimizations(webpackMajorVersion, webpackConfig, minimize);
  webpackConfig.externals = buildExternals(webpackConfig, reactPackagesAsExternal, orgPackagesAsExternal, orgName);

  // Reference: https://github.com/systemjs/systemjs#compatibility-with-webpack
  if (webpackMajorVersion < 5) {
    webpackConfig.module.rules.push({ parser: { system: false } });
  }

  disableCSSExtraction(webpackConfig);

  // Reference: https://github.com/joeldenning/systemjs-webpack-interop/pull/28
  if (webpackMajorVersion < 5) {
    systemjsInterop.checkWebpackConfig(webpackConfig);
  }

  return webpackConfig;
}

module.exports = overrideWebpackConfig
