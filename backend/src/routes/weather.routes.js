'use strict';

const { Router }  = require('express');
const requireAuth = require('../middleware/auth'); // no-op now; JWT-ready
const ctrl        = require('../controllers/weather.controller');

const router = Router();

// To protect this entire group with JWT in the future, uncomment:
// router.use(requireAuth);

router.get('/current',  ctrl.getCurrent);
router.get('/history',  ctrl.getHistory);
router.post('/refresh', requireAuth, ctrl.forceRefresh); // already wired for future auth

module.exports = router;
