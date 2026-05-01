const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/user/reports/stats',
  method: 'GET',
  // I need a valid token for this to work, which is hard.
  // Alternatively, I can test the DB query directly to ensure it doesn't throw an error.
};
