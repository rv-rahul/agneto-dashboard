'use strict';

const { Router } = require('express');
const ctrl       = require('../controllers/seating.controller');

const router = Router();

router.get('/',  ctrl.getSeed);     // GET /api/seating
router.put('/',  ctrl.updateSeed);  // PUT /api/seating  { seed, password }

module.exports = router;
