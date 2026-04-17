const { createRunOncePlugin } = require('@expo/config-plugins');
const pkg = require('./package.json');

// This module uses expo-module.config.json for native linking.
// No additional config plugin setup is required.
const withExpoInAppMessaging = (config) => config;

module.exports = createRunOncePlugin(withExpoInAppMessaging, pkg.name, pkg.version);
