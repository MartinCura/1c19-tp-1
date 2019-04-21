const { healthCheck, proxy, intensiveLoop } = require('./controllers/endpoints');

exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/proxy', proxy);
  app.get('/intensive', intensiveLoop);
};
