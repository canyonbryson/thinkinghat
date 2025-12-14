const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo awareness
config.watchFolders = [workspaceRoot];

// Modern RN/Metro monorepo aids
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// (Optional) Pin Babel runtime version for helpers
config.transformer = {
  ...config.transformer,
  enableBabelRuntime: "7",
};

module.exports = config;
