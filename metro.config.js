const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Completely disable the problematic externals feature
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Skip node:sea requests
      if (req.url && req.url.includes('node:sea')) {
        res.statusCode = 204;
        res.end();
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;