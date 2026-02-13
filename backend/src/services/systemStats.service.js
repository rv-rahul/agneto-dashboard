'use strict';

const fs     = require('fs/promises');
const os     = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileP = promisify(execFile);

const { query } = require('../config/database');
const logger    = require('../config/logger');

/**
 * Read CPU temperature from the Raspberry Pi thermal zone.
 * Returns Celsius as a float, or null on non-Pi systems (Windows dev, etc.).
 */
async function readCpuTemp() {
  try {
    const raw = await fs.readFile('/sys/class/thermal/thermal_zone0/temp', 'utf8');
    return parseFloat((parseInt(raw.trim(), 10) / 1000).toFixed(2));
  } catch {
    return null; // Not a Pi or permission denied
  }
}

/**
 * Read current CPU usage percentage by sampling /proc/stat twice with a 200ms gap.
 * Falls back to Node.js os.loadavg() on Windows or when /proc is unavailable.
 */
async function readCpuPercent() {
  function parseStat(line) {
    const parts = line.split(/\s+/).slice(1).map(Number);
    const idle  = parts[3] + (parts[4] || 0); // idle + iowait
    const total = parts.reduce((a, b) => a + b, 0);
    return { idle, total };
  }

  try {
    const raw1  = await fs.readFile('/proc/stat', 'utf8');
    const line1 = raw1.split('\n').find(l => l.startsWith('cpu '));

    await new Promise(r => setTimeout(r, 200));

    const raw2  = await fs.readFile('/proc/stat', 'utf8');
    const line2 = raw2.split('\n').find(l => l.startsWith('cpu '));

    const s1 = parseStat(line1);
    const s2 = parseStat(line2);
    const diffIdle  = s2.idle  - s1.idle;
    const diffTotal = s2.total - s1.total;

    return parseFloat((100 * (1 - diffIdle / diffTotal)).toFixed(2));
  } catch {
    // Fallback: load average approximation (works on Windows dev machine)
    const [load1m] = os.loadavg();
    return parseFloat(Math.min(100, (load1m / os.cpus().length) * 100).toFixed(2));
  }
}

/**
 * Disk usage for the root partition via `df`.
 * Works on Linux (Pi) and macOS. On Windows dev, returns zeros gracefully.
 */
async function readDiskUsage() {
  try {
    const args = process.platform === 'win32'
      ? null // skip on Windows
      : ['-k', '--output=size,used', '/'];

    if (!args) return { disk_used_gb: 0, disk_total_gb: 0, disk_percent: 0 };

    const { stdout } = await execFileP('df', args);
    const lines = stdout.trim().split('\n');
    const [total, used] = lines[1].trim().split(/\s+/).map(Number);

    return {
      disk_used_gb:  parseFloat((used  / 1024 / 1024).toFixed(2)),
      disk_total_gb: parseFloat((total / 1024 / 1024).toFixed(2)),
      disk_percent:  parseFloat(((used / total) * 100).toFixed(2)),
    };
  } catch {
    return { disk_used_gb: 0, disk_total_gb: 0, disk_percent: 0 };
  }
}

/**
 * Captures a live snapshot of system resources and stores it in the database.
 * Called by the system stats cron job every 5 minutes.
 * Also called directly by GET /api/system-stats/current (live read).
 */
async function capture() {
  const [cpuPercent, cpuTempC, diskStats] = await Promise.all([
    readCpuPercent(),
    readCpuTemp(),
    readDiskUsage(),
  ]);

  const totalMem = os.totalmem();
  const freeMem  = os.freemem();
  const usedMem  = totalMem - freeMem;

  const stats = {
    cpu_percent:  cpuPercent,
    ram_percent:  parseFloat(((usedMem / totalMem) * 100).toFixed(2)),
    disk_percent: diskStats.disk_percent,
    cpu_temp_c:   cpuTempC,
    ram_used_mb:  Math.round(usedMem  / 1024 / 1024),
    ram_total_mb: Math.round(totalMem / 1024 / 1024),
    disk_used_gb: diskStats.disk_used_gb,
    disk_total_gb: diskStats.disk_total_gb,
  };

  await query(
    `INSERT INTO system_stats
       (cpu_percent, ram_percent, disk_percent, cpu_temp_c,
        ram_used_mb, ram_total_mb, disk_used_gb, disk_total_gb)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      stats.cpu_percent, stats.ram_percent, stats.disk_percent,
      stats.cpu_temp_c,  stats.ram_used_mb, stats.ram_total_mb,
      stats.disk_used_gb, stats.disk_total_gb,
    ],
  );

  logger.debug(
    `System stats: CPU ${stats.cpu_percent}%, RAM ${stats.ram_percent}%, ` +
    `Disk ${stats.disk_percent}%, Temp ${stats.cpu_temp_c ?? 'N/A'}°C`
  );

  return stats;
}

async function getLatest() {
  const [rows] = await query(
    'SELECT * FROM system_stats ORDER BY captured_at DESC LIMIT 1',
    [],
  );
  return rows[0] || null;
}

async function getHistory(limit = 12) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 288);
  const [rows] = await query(
    'SELECT * FROM system_stats ORDER BY captured_at DESC LIMIT ?',
    [safeLimit],
  );
  return rows;
}

module.exports = { capture, getLatest, getHistory, readCpuTemp };
