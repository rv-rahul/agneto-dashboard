'use strict';

const { DateTime }                         = require('luxon');
const { NOTIFICATION_WINDOWS, TIMEZONE }   = require('../config/constants');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Returns the full static schedule configuration.
 * The Angular frontend uses this to render a "Notification Settings" view.
 */
function getSchedule() {
  return NOTIFICATION_WINDOWS.map(w => ({
    type:   w.type,
    label:  w.label,
    days:   w.days.map(d => DAY_NAMES[d]),
    window: `${pad(w.startHour)}:${pad(w.startMin)} – ${pad(w.endHour)}:${pad(w.endMin)} CST`,
  }));
}

/**
 * Returns the list of notification types that are CURRENTLY active
 * based on server time in CST.
 *
 * Angular polls this endpoint every 30 seconds.
 * For each entry in active_notifications, the Angular app should show a
 * dismissible modal alert.
 */
function getActive() {
  const now = DateTime.now().setZone(TIMEZONE);

  // Luxon weekday: 1=Mon, 2=Tue, ..., 7=Sun
  // Our constants use: 0=Sun, 1=Mon, ..., 6=Sat
  const cstDay = now.weekday === 7 ? 0 : now.weekday;

  const active = NOTIFICATION_WINDOWS.filter(w => {
    if (!w.days.includes(cstDay)) return false;

    const h = now.hour;
    const m = now.minute;
    const afterStart = h > w.startHour || (h === w.startHour && m >= w.startMin);
    const beforeEnd  = h < w.endHour   || (h === w.endHour   && m <= w.endMin);

    return afterStart && beforeEnd;
  });

  return {
    server_time_cst:      now.toISO(),
    day_of_week:          now.weekdayLong,
    active_notifications: active.map(w => ({
      type:  w.type,
      label: w.label,
    })),
  };
}

module.exports = { getSchedule, getActive };
