const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Performance optimizations
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
    compress: {
      drop_console: true,
      reduce_funcs: false,
    },
  },
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Optimize resolver
config.resolver = {
  ...config.resolver,
  // Add performance-oriented resolver options
  resolverMainFields: ['react-native', 'browser', 'main'],
  // Enable symlinks resolution
  followSymlinks: true,
  // Block list for unnecessary files
  blockList: [
    /.*\.test\.(js|jsx|ts|tsx)$/,
    /.*\/__tests__\/.*/,
    /.*\.spec\.(js|jsx|ts|tsx)$/,
    /.*\.stories\.(js|jsx|ts|tsx)$/,
  ],
};

// Remove custom cache configuration - Metro handles this automatically

// Enable RAM bundle for Android
config.serializer = {
  ...config.serializer,
  processModuleFilter: (module) => {
    // Exclude test files and stories from bundle
    if (
      module.path.includes('__tests__') ||
      module.path.includes('.test.') ||
      module.path.includes('.spec.') ||
      module.path.includes('.stories.')
    ) {
      return false;
    }
    return true;
  },
};

module.exports = config;
