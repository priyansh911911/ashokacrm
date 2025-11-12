// Simple cache utility for better performance
export const cache = {
  set: (key, data, ttl = 60000) => { // Default 1 minute TTL
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl
      }));
    } catch (e) {
      console.warn('Cache set failed:', e);
    }
  },

  get: (key) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      
      return parsed.data;
    } catch (e) {
      localStorage.removeItem(key);
      return null;
    }
  },

  clear: (pattern) => {
    if (pattern) {
      // Clear keys matching pattern
      Object.keys(localStorage).forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      // Clear all cache
      Object.keys(localStorage).forEach(key => {
        if (key.endsWith('_cache')) {
          localStorage.removeItem(key);
        }
      });
    }
  },

  // Preload data in background
  preload: async (key, fetchFn, ttl = 60000) => {
    const cached = cache.get(key);
    if (cached) return cached;
    
    try {
      const data = await fetchFn();
      cache.set(key, data, ttl);
      return data;
    } catch (e) {
      console.warn('Cache preload failed:', e);
      return null;
    }
  }
};