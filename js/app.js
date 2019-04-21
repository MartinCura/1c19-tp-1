const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  path = require('path'),
  cors = require('cors'),
  routes = require('./app/routes'),
  DEFAULT_BODY_SIZE_LIMIT = 1024 * 1024 * 10,
  DEFAULT_PARAMETER_LIMIT = 10000;

const bodyParserJsonConfig = () => ({
  parameterLimit: DEFAULT_PARAMETER_LIMIT,
  limit: DEFAULT_BODY_SIZE_LIMIT
});

const bodyParserUrlencodedConfig = () => ({
  extended: true,
  parameterLimit: DEFAULT_PARAMETER_LIMIT,
  limit: DEFAULT_BODY_SIZE_LIMIT
});

const app = express();

app.use(cors());

app.use('/docs', express.static(path.join(__dirname, 'docs')));

// Client must send "Content-Type: application/json" header
app.use(bodyParser.json(bodyParserJsonConfig()));
app.use(bodyParser.urlencoded(bodyParserUrlencodedConfig()));

morgan.token('req-params', req => req.params);
app.use(
  morgan(
    '[:date[clf]] :remote-addr - Request ":method :url" with params: :req-params. Response status: :status.'
  )
);

routes.init(app);

module.exports = app;
