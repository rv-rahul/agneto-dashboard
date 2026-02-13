'use strict';

const axios  = require('axios');
const logger = require('../config/logger');
const { query } = require('../config/database');

const OWM_BASE = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetches current weather from OpenWeatherMap and stores a snapshot in MySQL.
 * Called by the weather cron job every 30 minutes.
 */
async function fetchAndStore() {
  const city    = process.env.WEATHER_CITY    || 'Dallas';
  const country = process.env.WEATHER_COUNTRY || 'US';
  const apiKey  = process.env.WEATHER_API_KEY;
  const units   = process.env.WEATHER_UNITS   || 'imperial';

  if (!apiKey) {
    logger.warn('WEATHER_API_KEY not set — skipping weather fetch');
    return null;
  }

  const url = `${OWM_BASE}?q=${encodeURIComponent(city)},${country}&appid=${apiKey}&units=${units}`;
  const start = Date.now();
  let statusCode = null;

  try {
    const { data, status } = await axios.get(url, { timeout: 10_000 });
    statusCode = status;

    const row = {
      city:           data.name,
      country:        data.sys.country,
      temp_f:         data.main.temp,
      feels_like_f:   data.main.feels_like,
      temp_min_f:     data.main.temp_min,
      temp_max_f:     data.main.temp_max,
      humidity:       data.main.humidity,
      pressure:       data.main.pressure,
      description:    data.weather[0].description,
      icon_code:      data.weather[0].icon,
      wind_speed_mph: data.wind?.speed  ?? 0,
      wind_deg:       data.wind?.deg    ?? 0,
      visibility_mi:  data.visibility != null
        ? parseFloat((data.visibility / 1609.34).toFixed(2))
        : null,
      sunrise_utc:    data.sys.sunrise,
      sunset_utc:     data.sys.sunset,
    };

    await query(
      `INSERT INTO weather_data
         (city, country, temp_f, feels_like_f, temp_min_f, temp_max_f,
          humidity, pressure, description, icon_code,
          wind_speed_mph, wind_deg, visibility_mi, sunrise_utc, sunset_utc)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        row.city, row.country, row.temp_f, row.feels_like_f,
        row.temp_min_f, row.temp_max_f, row.humidity, row.pressure,
        row.description, row.icon_code, row.wind_speed_mph, row.wind_deg,
        row.visibility_mi, row.sunrise_utc, row.sunset_utc,
      ],
    );

    await logApiCall('openweathermap', url, statusCode, Date.now() - start, true, null);
    logger.debug(`Weather stored: ${row.temp_f}° in ${row.city}`);
    return row;

  } catch (err) {
    await logApiCall('openweathermap', url, statusCode, Date.now() - start, false, err.message);
    logger.error('Weather fetch failed:', err.message);
    throw err;
  }
}

async function logApiCall(service, endpoint, statusCode, responseMs, success, errorMessage) {
  try {
    await query(
      `INSERT INTO api_call_log (service, endpoint, status_code, response_ms, success, error_message)
       VALUES (?,?,?,?,?,?)`,
      [service, endpoint.substring(0, 499), statusCode, responseMs, success ? 1 : 0, errorMessage],
    );
  } catch (logErr) {
    logger.error('Failed to write api_call_log:', logErr.message);
  }
}

async function getLatest() {
  const [rows] = await query(
    'SELECT * FROM weather_data ORDER BY fetched_at DESC LIMIT 1',
    [],
  );
  return rows[0] || null;
}

async function getHistory(limit = 48) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 48, 1), 200);
  const [rows] = await query(
    'SELECT * FROM weather_data ORDER BY fetched_at DESC LIMIT ?',
    [safeLimit],
  );
  return rows;
}

module.exports = { fetchAndStore, getLatest, getHistory };
