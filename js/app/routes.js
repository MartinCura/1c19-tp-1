const { healthCheck, timeout, intensiveLoop } = require('./controllers/endpoints');

exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/timeout', timeout);
  app.get('/intensive', intensiveLoop);
};
