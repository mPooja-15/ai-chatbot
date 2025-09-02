const NodeCache = require('node-cache');

// Cache configuration
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every minute
  maxKeys: 1000 // Maximum number of keys in cache
});

// Cache middleware for specific routes
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    // Store original res.json method
    const originalJson = res.json;
    
    // Override res.json method to cache the response
    res.json = function(data) {
      cache.set(key, data, duration);
      originalJson.call(this, data);
    };
    
    next();
  };
};

// Cache utility functions
const cacheUtils = {
  // Set cache with custom TTL
  set: (key, value, ttl = 300) => cache.set(key, value, ttl),
  
  // Get cache value
  get: (key) => cache.get(key),
  
  // Delete cache key
  del: (key) => cache.del(key),
  
  // Clear all cache
  flush: () => cache.flushAll(),
  
  // Get cache statistics
  getStats: () => cache.getStats(),
  
  // Check if key exists
  has: (key) => cache.has(key),
  
  // Set multiple keys
  mset: (keyValuePairs, ttl = 300) => {
    const pairs = {};
    keyValuePairs.forEach(([key, value]) => {
      pairs[key] = value;
    });
    cache.mset(pairs, ttl);
  }
};

module.exports = {
  cache,
  cacheMiddleware,
  cacheUtils
};
