'use strict';

const statsService = require('../services/systemStats.service');

exports.getCurrent = async (req, res, next) => {
  try {
    const data = await statsService.capture(); // Live read + stores to DB
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const data = await statsService.getHistory(req.query.limit);
    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};
