'use strict';

const notificationsService = require('../services/notifications.service');
const { query }            = require('../config/database');
const logger               = require('../config/logger');

exports.getSchedule = (req, res, next) => {
  try {
    const data = notificationsService.getSchedule();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getActive = async (req, res, next) => {
  try {
    const result = notificationsService.getActive();

    // Fire-and-forget: log each active notification for the audit trail
    for (const n of result.active_notifications) {
      query(
        'INSERT INTO notifications_log (notification_type, client_ip) VALUES (?,?)',
        [n.type, req.ip],
      ).catch(err => logger.error('notifications_log insert failed:', err.message));
    }

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};
