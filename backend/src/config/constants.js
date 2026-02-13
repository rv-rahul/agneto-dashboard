'use strict';

module.exports = {
  TEAM_NAME: 'Team Agneto',
  TIMEZONE: 'America/Chicago', // CST/CDT — Luxon handles DST automatically

  /**
   * Notification schedule windows (CST).
   * days: 0=Sunday, 1=Monday, ... 6=Saturday
   *
   * Angular frontend polls GET /api/notifications/active every 30s.
   * If a notification is active, Angular shows a dismissible modal.
   */
  NOTIFICATION_WINDOWS: [
    {
      type: 'checkin',
      label: 'Daily Check-In Reminder',
      days: [1, 2, 3, 4, 5], // Mon–Fri
      startHour: 9,  startMin: 1,
      endHour:   9,  endMin:   5,
    },
    {
      type: 'checkout',
      label: 'Daily Check-Out Reminder',
      days: [1, 2, 3, 4, 5],
      startHour: 17, startMin: 0,
      endHour:   17, endMin:  10,
    },
    {
      type: 'timesheet',
      label: 'Submit Your Timesheet',
      days: [5], // Friday only
      startHour: 16, startMin: 0,
      endHour:   16, endMin:  15,
    },
    {
      type: 'lunch',
      label: 'Lunch Break',
      days: [1, 2, 3, 4, 5],
      startHour: 12, startMin: 0,
      endHour:   12, endMin:  15,
    },
  ],
};
