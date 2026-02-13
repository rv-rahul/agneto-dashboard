'use strict';

const weatherService = require('../services/weather.service');

exports.getCurrent = async (req, res, next) => {
  try {
    const data = await weatherService.getLatest();
    if (!data) {
      return res.status(404).json({ success: false, error: 'No weather data available yet. Try POST /api/weather/refresh.' });
    }
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const data = await weatherService.getHistory(req.query.limit);
    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

exports.forceRefresh = async (req, res, next) => {
  try {
    const data = await weatherService.fetchAndStore();
    res.json({ success: true, message: 'Weather data refreshed successfully', data });
  } catch (err) { next(err); }
};
