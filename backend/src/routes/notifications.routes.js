'use strict';

const { Router } = require('express');
const ctrl       = require('../controllers/notifications.controller');

const router = Router();

router.get('/schedule', ctrl.getSchedule); // Full schedule config
router.get('/active',   ctrl.getActive);   // Currently active notifications (CST)

module.exports = router;
