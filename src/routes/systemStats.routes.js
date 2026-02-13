'use strict';

const { Router } = require('express');
const ctrl       = require('../controllers/systemStats.controller');

const router = Router();

router.get('/current', ctrl.getCurrent); // Live read + store in DB
router.get('/history', ctrl.getHistory); // DB snapshots, ?limit=12

module.exports = router;
