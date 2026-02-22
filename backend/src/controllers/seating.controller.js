'use strict';

const seatingService = require('../services/seating.service');

exports.getSeed = async (req, res, next) => {
  try {
    const seed = await seatingService.getSeed();
    res.json({ success: true, data: { seed } });
  } catch (err) { next(err); }
};

exports.updateSeed = async (req, res, next) => {
  try {
    const { seed, password } = req.body;
    const data = await seatingService.updateSeed(seed, password);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
