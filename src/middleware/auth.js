'use strict';

/**
 * AUTH MIDDLEWARE PLACEHOLDER
 * ─────────────────────────────────────────────────────────────
 * Currently a no-op pass-through. Every protected route already
 * imports and applies this — so adding real JWT auth is a
 * single-file change with no route rewiring needed.
 *
 * TO ADD JWT AUTH LATER:
 * ─────────────────────────────────────────────────────────────
 * 1. Install:  npm install jsonwebtoken
 * 2. Add to .env:  JWT_SECRET=<strong-random-secret>
 * 3. Replace the exported function below with:
 *
 *    const jwt = require('jsonwebtoken');
 *
 *    module.exports = function requireAuth(req, res, next) {
 *      const authHeader = req.headers.authorization;
 *      if (!authHeader?.startsWith('Bearer ')) {
 *        return res.status(401).json({ success: false, error: 'Missing Authorization header' });
 *      }
 *      try {
 *        req.user = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
 *        next();
 *      } catch {
 *        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
 *      }
 *    };
 *
 * 4. Apply to specific routes in any route file:
 *    router.use(requireAuth);                         // entire router
 *    router.post('/events', requireAuth, ctrl.create); // single route
 * ─────────────────────────────────────────────────────────────
 */
// eslint-disable-next-line no-unused-vars
module.exports = function requireAuth(_req, _res, next) {
  next();
};
