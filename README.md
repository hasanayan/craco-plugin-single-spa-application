# craco-plugin-single-spa-application

Convert your CRA project into a single-spa application without ejecting and losing update support of react-scripts

![](https://img.shields.io/npm/v/craco-plugin-single-spa-application.svg?style=flat)
![](https://img.shields.io/npm/dt/craco-plugin-single-spa-application.svg?style=flat)

## Dependencies

This plugins depends on CRACO so make sure to follow the installation instructions before installing and setting up this plugin. https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#installation

## Install

```
npm install craco-plugin-single-spa-application --save-dev
```

## Usage

1. Open the `craco.config.js` file and apply the following changes:

```typescript
singleSpaApplicationPlugin = require('craco-plugin-single-spa-application');

const singleSpaApplicationPlugin = {
  plugin: singleSpaApplicationPlugin,
  options: {
    orgName: "my-org",
    projectName: "my-app",
    entry: "src/single-spa-index.tsx", //defaults to src/index.js,
    orgPackagesAsExternal: false, // defaults to false. marks packages that has @my-org prefix as external so they are not included in the bundle
    reactPackagesAsExternal: true, // defaults to true. marks react and react-dom as external so they are not included in the bundle
    minimize: false, // defaults to false, sets optimization.minimize value
    outputFilename: "single-spa-build.js" // defaults to the values set for the "orgName" and "projectName" properties, in this case "my-org-my-app.js"
  },
}

// Keep any other configuration you are exporting from CRACO and add the plugin to the plugins array
module.exports = {
    plugins: [singleSpaApplicationPlugin]
}
```

2. Run `npm run craco:build` to generate your microfrontend app bundle. The output will be located under build folder and named as `my-org-my-app.js` or using the name defined in `outputFilename` option. 

## License

Licensed under the MIT License, Copyright ©️ 2021 Hasan Ayan. See [LICENSE.md](LICENSE) for more information.
