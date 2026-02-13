'use strict';

const eventsService = require('../services/events.service');

exports.list = async (req, res, next) => {
  try {
    const data = await eventsService.list(req.query);
    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const data = await eventsService.getOne(parseInt(req.params.id, 10));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const data = await eventsService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await eventsService.update(parseInt(req.params.id, 10), req.body);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await eventsService.remove(parseInt(req.params.id, 10));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};
