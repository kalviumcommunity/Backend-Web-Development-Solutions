/**
 * config — SOLUTION: the ONLY file in the app that reads process.env.
 * Every other layer imports typed values from here.
 */
module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod',
  maxArticles: parseInt(process.env.MAX_ARTICLES, 10) || 50
};
