const { healthCheck, ping, intensiveLoop } = require('./controllers/endpoints');

exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/ping', ping);
  app.get('/intensive', intensiveLoop);
};
