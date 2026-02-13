'use strict';

const { Router } = require('express');
const ctrl       = require('../controllers/team.controller');

const router = Router();

router.get('/', ctrl.getTeamInfo); // Team name + member count + member list

module.exports = router;
