'use strict';

const { body, param, validationResult } = require('express-validator');

/** Runs after validation rules and short-circuits with a 422 if there are errors. */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg })),
    });
  }
  next();
};

/** Validates :id param is a positive integer. */
const validateEventId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer'),
  handleValidation,
];

/** Validates POST/PUT body for creating or updating an event. */
const validateEvent = [
  body('title')
    .trim()
    .notEmpty().withMessage('title is required')
    .isLength({ max: 255 }).withMessage('title must be 255 characters or fewer'),

  body('event_type')
    .optional()
    .isIn(['event', 'holiday', 'birthday'])
    .withMessage('event_type must be one of: event, holiday, birthday'),

  body('event_date')
    .notEmpty().withMessage('event_date is required')
    .isISO8601().withMessage('event_date must be a valid date (YYYY-MM-DD)'),

  body('end_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('end_date must be a valid date (YYYY-MM-DD)'),

  body('description')
    .optional({ nullable: true })
    .isLength({ max: 2000 }).withMessage('description must be 2000 characters or fewer'),

  body('all_day')
    .optional()
    .isBoolean().withMessage('all_day must be true or false'),

  body('start_time')
    .optional({ nullable: true })
    .matches(/^\d{2}:\d{2}(:\d{2})?$/)
    .withMessage('start_time must be in HH:MM or HH:MM:SS format'),

  body('end_time')
    .optional({ nullable: true })
    .matches(/^\d{2}:\d{2}(:\d{2})?$/)
    .withMessage('end_time must be in HH:MM or HH:MM:SS format'),

  body('is_recurring')
    .optional()
    .isBoolean().withMessage('is_recurring must be true or false'),

  body('recur_rule')
    .optional({ nullable: true })
    .isLength({ max: 100 }).withMessage('recur_rule must be 100 characters or fewer'),

  handleValidation,
];

module.exports = { validateEvent, validateEventId };
