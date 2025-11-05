/* config-overrides.js */
const tsImportPluginFactory = require('ts-import-plugin')
const { getLoader,injectBabelPlugin } = require("react-app-rewired");
const rewireLess = require('react-app-rewire-less');

process.env.GENERATE_SOURCEMAP = "false";

module.exports = function override(config, env) {

    config = rewireLess(config, env);

    config = injectBabelPlugin(['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }], config);
    config = rewireLess.withLoaderOptions({
        modifyVars: { "@primary-color": "#1DA57A" },
    })(config, env);

    return config;
}