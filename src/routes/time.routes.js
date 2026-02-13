'use strict';

const { Router } = require('express');
const ctrl       = require('../controllers/time.controller');

const router = Router();

router.get('/', ctrl.getCurrentTime); // Current server time in CST + UTC + epoch

module.exports = router;
