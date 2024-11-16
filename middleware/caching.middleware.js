const redisClient = require("../configs/redis.config");

async function cacheMiddleware(req, res, next) {
  const key = req.originalUrl; 

  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      console.log('Cache hit');
      return res.json(JSON.parse(cachedData));
    } else {
      console.log('Cache miss');
      next();
    }
  } catch (err) {
    console.error('Cache error:', err);
    next();
  }
}

module.exports = cacheMiddleware;
