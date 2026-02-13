'use strict';

const { query }     = require('../config/database');
const { TEAM_NAME } = require('../config/constants');

/**
 * Returns team name, active member count, and full active member list.
 * Used by GET /api/team.
 */
async function getTeamInfo() {
  const [[countRow]] = await query(
    'SELECT COUNT(*) AS total FROM team_members WHERE is_active = 1',
    [],
  );

  const [members] = await query(
    `SELECT id, full_name, email, role, birthday, joined_date
     FROM team_members
     WHERE is_active = 1
     ORDER BY full_name ASC`,
    [],
  );

  return {
    team_name:    TEAM_NAME,
    member_count: countRow.total,
    members,
  };
}

module.exports = { getTeamInfo };
