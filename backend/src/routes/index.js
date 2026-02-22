'use strict';

const { Router } = require('express');

const weatherRoutes       = require('./weather.routes');
const systemStatsRoutes   = require('./systemStats.routes');
const teamRoutes          = require('./team.routes');
const eventsRoutes        = require('./events.routes');
const notificationsRoutes = require('./notifications.routes');
const timeRoutes          = require('./time.routes');
const seatingRoutes       = require('./seating.routes');

const router = Router();

router.use('/weather',       weatherRoutes);
router.use('/system-stats',  systemStatsRoutes);
router.use('/team',          teamRoutes);
router.use('/events',        eventsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/time',          timeRoutes);
router.use('/seating',       seatingRoutes);

module.exports = router;
