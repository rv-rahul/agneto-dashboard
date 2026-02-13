'use strict';

const { DateTime } = require('luxon');
const { TIMEZONE } = require('../config/constants');

exports.getCurrentTime = (req, res) => {
  const now    = DateTime.now().setZone(TIMEZONE);
  const nowUtc = DateTime.now().setZone('UTC');

  res.json({
    success: true,
    data: {
      iso_cst:     now.toISO(),
      iso_utc:     nowUtc.toISO(),
      epoch_ms:    Date.now(),
      date_cst:    now.toISODate(),
      time_cst:    now.toFormat('HH:mm:ss'),
      display_cst: now.toFormat("cccc, LLLL d, yyyy  h:mm:ss a ZZZZ"),
      day_of_week: now.weekdayLong,
      is_weekday:  now.weekday >= 1 && now.weekday <= 5,
      timezone:    TIMEZONE,
      utc_offset:  now.toFormat('ZZ'),
    },
  });
};
