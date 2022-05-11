# craco-plugin-single-spa-application

Convert your CRA project into a single-spa application without ejecting and losing update support of react-scripts

![](https://img.shields.io/npm/v/craco-plugin-single-spa-application.svg?style=flat)
![](https://img.shields.io/npm/dt/craco-plugin-single-spa-application.svg?style=flat)

## Install

```
npm install craco-plugin-single-spa-application --save-dev
```

## Usage

1. Add the plugin into your craco.config.js;

```typescript
singleSpaApplicationPlugin = require('craco-plugin-single-spa-application');

module.exports = {
    plugins: [{
        plugin: singleSpaApplicationPlugin,
        options: {
        orgName: "my-org",
        projectName: "my-app",
        entry: "src/single-spa-index.tsx", //defaults to src/index.js,
        orgPackagesAsExternal: false, // defaults to false. marks packages that has @my-org prefix as external so they are not included in the bundle
        reactPackagesAsExternal: true, // defaults to true. marks react and react-dom as external so they are not included in the bundle
        minimize: false, // defaults to false, sets optimization.minimize value
        outputFilename: single-spa-build.js // defaults to the values set for the "orgName" and "projectName" properties, in this case "my-org-my-app.js"
      },
    }]
}
```

2. Update the scripts section of your package.json as follows:

```json
  ...
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "craco:build": "craco build",
    "craco:start": "craco start",
    ...
```

3. Run `npm run craco:build` to generate your microfrontend app bundle. The output will be located under build folder and named as my-org-my-app.js

## License

Licensed under the MIT License, Copyright ©️ 2021 Hasan Ayan. See [LICENSE.md](LICENSE) for more information.
