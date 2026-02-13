'use strict';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Team Agneto Dashboard API',
    version: '1.0.0',
    description:
      'REST API for the Team Agneto Raspberry Pi 4 Dashboard. Provides system stats, weather, team info, events, and time-based notifications.',
    contact: {
      name: 'Team Agneto',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health',        description: 'Server liveness check' },
    { name: 'Time',          description: 'Current server time (CST)' },
    { name: 'Weather',       description: 'OpenWeatherMap data & history' },
    { name: 'System Stats',  description: 'Raspberry Pi resource monitoring' },
    { name: 'Team',          description: 'Team member roster' },
    { name: 'Events',        description: 'Events, holidays & birthdays (CRUD)' },
    { name: 'Notifications', description: 'Time-window based notification schedule' },
  ],

  paths: {

    // ─── Health ────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Server health check',
        description: 'Returns server status, team name, and current timestamp.',
        responses: {
          200: {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status:    { type: 'string', example: 'ok' },
                    team:      { type: 'string', example: 'Team Agneto' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ─── Time ──────────────────────────────────────────────────────
    '/api/time': {
      get: {
        tags: ['Time'],
        summary: 'Get current server time',
        description: 'Returns the current time in CST and UTC with full metadata.',
        responses: {
          200: {
            description: 'Current server time',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/TimeData' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    // ─── Weather ───────────────────────────────────────────────────
    '/api/weather/current': {
      get: {
        tags: ['Weather'],
        summary: 'Get latest weather snapshot',
        description: 'Returns the most recent weather record stored in the database.',
        responses: {
          200: {
            description: 'Latest weather data',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/WeatherData' },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/weather/history': {
      get: {
        tags: ['Weather'],
        summary: 'Get weather history',
        description: 'Returns historical weather snapshots ordered newest-first.',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Number of records to return (1–200, default 48)',
            schema: { type: 'integer', default: 48, minimum: 1, maximum: 200 },
          },
        ],
        responses: {
          200: {
            description: 'Weather history records',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/WeatherData' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    '/api/weather/refresh': {
      post: {
        tags: ['Weather'],
        summary: 'Force weather refresh',
        description: 'Triggers an immediate fetch from OpenWeatherMap and stores the result.',
        responses: {
          200: {
            description: 'Freshly fetched weather data',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/WeatherData' },
                      },
                    },
                  ],
                },
              },
            },
          },
          503: {
            description: 'Weather API key not configured or fetch failed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // ─── System Stats ──────────────────────────────────────────────
    '/api/system-stats/current': {
      get: {
        tags: ['System Stats'],
        summary: 'Get live system stats',
        description: 'Reads current CPU, RAM, disk, and temperature from the Pi and stores a snapshot.',
        responses: {
          200: {
            description: 'Current system resource usage',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/SystemStats' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    '/api/system-stats/history': {
      get: {
        tags: ['System Stats'],
        summary: 'Get system stats history',
        description: 'Returns historical system stat snapshots ordered newest-first.',
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Number of records to return (1–288, default 12)',
            schema: { type: 'integer', default: 12, minimum: 1, maximum: 288 },
          },
        ],
        responses: {
          200: {
            description: 'System stats history',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/SystemStats' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    // ─── Team ──────────────────────────────────────────────────────
    '/api/team': {
      get: {
        tags: ['Team'],
        summary: 'Get team info',
        description: 'Returns the team name, active member count, and full member roster.',
        responses: {
          200: {
            description: 'Team information',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            team_name:    { type: 'string', example: 'Team Agneto' },
                            member_count: { type: 'integer', example: 5 },
                            members: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/TeamMember' },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    // ─── Events ────────────────────────────────────────────────────
    '/api/events': {
      get: {
        tags: ['Events'],
        summary: 'List all events',
        description: 'Returns events with optional filters by type and upcoming date.',
        parameters: [
          {
            name: 'type',
            in: 'query',
            description: 'Filter by event type',
            schema: { type: 'string', enum: ['event', 'holiday', 'birthday'] },
          },
          {
            name: 'upcoming',
            in: 'query',
            description: 'If true, returns only events on or after today',
            schema: { type: 'boolean' },
          },
        ],
        responses: {
          200: {
            description: 'List of events',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        count: { type: 'integer' },
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Event' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Events'],
        summary: 'Create a new event',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EventInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Event created',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/Event' },
                      },
                    },
                  ],
                },
              },
            },
          },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },

    '/api/events/{id}': {
      get: {
        tags: ['Events'],
        summary: 'Get a single event',
        parameters: [{ $ref: '#/components/parameters/EventId' }],
        responses: {
          200: {
            description: 'Event found',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/Event' },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Events'],
        summary: 'Update an event',
        description: 'Partial updates supported — only provide fields to change.',
        parameters: [{ $ref: '#/components/parameters/EventId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EventInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Event updated',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/Event' },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
          422: { $ref: '#/components/responses/ValidationError' },
        },
      },
      delete: {
        tags: ['Events'],
        summary: 'Delete an event',
        parameters: [{ $ref: '#/components/parameters/EventId' }],
        responses: {
          200: {
            description: 'Event deleted',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            deleted: { type: 'boolean', example: true },
                            id:      { type: 'integer', example: 1 },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ─── Notifications ─────────────────────────────────────────────
    '/api/notifications/schedule': {
      get: {
        tags: ['Notifications'],
        summary: 'Get notification schedule',
        description: 'Returns the full static notification schedule configuration.',
        responses: {
          200: {
            description: 'Notification schedule',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/NotificationSchedule' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    '/api/notifications/active': {
      get: {
        tags: ['Notifications'],
        summary: 'Get currently active notifications',
        description:
          'Returns notifications active right now based on CST server time. Angular polls this every 30 seconds.',
        responses: {
          200: {
            description: 'Active notifications',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            server_time_cst: { type: 'string', format: 'date-time' },
                            day_of_week:     { type: 'string', example: 'Friday' },
                            active_notifications: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  type:  { type: 'string', example: 'checkin' },
                                  label: { type: 'string', example: 'Daily Check-In Reminder' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },

  components: {
    parameters: {
      EventId: {
        name: 'id',
        in: 'path',
        required: true,
        description: 'Event ID',
        schema: { type: 'integer', minimum: 1 },
      },
    },

    responses: {
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: 'Event 99 not found' },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      msg:   { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    schemas: {
      SuccessEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error:   { type: 'string' },
        },
      },

      TimeData: {
        type: 'object',
        properties: {
          iso_cst:     { type: 'string', format: 'date-time' },
          iso_utc:     { type: 'string', format: 'date-time' },
          epoch_ms:    { type: 'integer' },
          date_cst:    { type: 'string', format: 'date', example: '2026-02-13' },
          time_cst:    { type: 'string', example: '09:01:00' },
          display_cst: { type: 'string', example: 'Friday, February 13, 2026  9:01:00 AM CST' },
          day_of_week: { type: 'string', example: 'Friday' },
          is_weekday:  { type: 'boolean' },
          timezone:    { type: 'string', example: 'America/Chicago' },
          utc_offset:  { type: 'string', example: '-06:00' },
        },
      },

      WeatherData: {
        type: 'object',
        properties: {
          id:            { type: 'integer' },
          city:          { type: 'string', example: 'Dallas' },
          country:       { type: 'string', example: 'US' },
          temp_f:        { type: 'number', example: 72.5 },
          feels_like_f:  { type: 'number', example: 70.1 },
          temp_min_f:    { type: 'number', example: 68.0 },
          temp_max_f:    { type: 'number', example: 75.0 },
          humidity:      { type: 'integer', example: 55 },
          pressure:      { type: 'integer', example: 1013 },
          description:   { type: 'string', example: 'clear sky' },
          icon_code:     { type: 'string', example: '01d', description: 'Use https://openweathermap.org/img/wn/{icon_code}@2x.png' },
          wind_speed_mph:{ type: 'number', example: 8.5 },
          wind_deg:      { type: 'integer', example: 180 },
          visibility_mi: { type: 'number', example: 6.21 },
          sunrise_utc:   { type: 'integer', example: 1707822000 },
          sunset_utc:    { type: 'integer', example: 1707862800 },
          fetched_at:    { type: 'string', format: 'date-time' },
        },
      },

      SystemStats: {
        type: 'object',
        properties: {
          id:           { type: 'integer' },
          cpu_percent:  { type: 'number', example: 12.5 },
          ram_percent:  { type: 'number', example: 45.2 },
          disk_percent: { type: 'number', example: 30.8 },
          cpu_temp_c:   { type: 'number', example: 48.3, nullable: true, description: 'null on non-Pi systems' },
          ram_used_mb:  { type: 'integer', example: 1843 },
          ram_total_mb: { type: 'integer', example: 4096 },
          disk_used_gb: { type: 'number', example: 9.2 },
          disk_total_gb:{ type: 'number', example: 29.8 },
          captured_at:  { type: 'string', format: 'date-time' },
        },
      },

      TeamMember: {
        type: 'object',
        properties: {
          id:          { type: 'integer' },
          full_name:   { type: 'string', example: 'Jane Doe' },
          email:       { type: 'string', format: 'email' },
          role:        { type: 'string', example: 'Developer' },
          birthday:    { type: 'string', format: 'date', nullable: true },
          joined_date: { type: 'string', format: 'date', nullable: true },
        },
      },

      Event: {
        type: 'object',
        properties: {
          id:           { type: 'integer' },
          title:        { type: 'string', example: 'Team Sprint Review' },
          description:  { type: 'string', nullable: true },
          event_type:   { type: 'string', enum: ['event', 'holiday', 'birthday'] },
          event_date:   { type: 'string', format: 'date' },
          end_date:     { type: 'string', format: 'date', nullable: true },
          all_day:      { type: 'boolean' },
          start_time:   { type: 'string', example: '09:00', nullable: true },
          end_time:     { type: 'string', example: '10:00', nullable: true },
          is_recurring: { type: 'boolean' },
          recur_rule:   { type: 'string', example: 'Annually', nullable: true },
          created_at:   { type: 'string', format: 'date-time' },
          updated_at:   { type: 'string', format: 'date-time' },
        },
      },

      EventInput: {
        type: 'object',
        required: ['title', 'event_date'],
        properties: {
          title:        { type: 'string', maxLength: 255, example: 'Team Sprint Review' },
          description:  { type: 'string', maxLength: 2000, nullable: true },
          event_type:   { type: 'string', enum: ['event', 'holiday', 'birthday'], default: 'event' },
          event_date:   { type: 'string', format: 'date', example: '2026-03-01' },
          end_date:     { type: 'string', format: 'date', nullable: true },
          all_day:      { type: 'boolean', default: true },
          start_time:   { type: 'string', example: '09:00', nullable: true },
          end_time:     { type: 'string', example: '10:00', nullable: true },
          is_recurring: { type: 'boolean', default: false },
          recur_rule:   { type: 'string', maxLength: 100, example: 'Annually', nullable: true },
        },
      },

      NotificationSchedule: {
        type: 'object',
        properties: {
          type:   { type: 'string', example: 'checkin' },
          label:  { type: 'string', example: 'Daily Check-In Reminder' },
          days:   { type: 'array', items: { type: 'string' }, example: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
          window: { type: 'string', example: '09:01 – 09:05 CST' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
