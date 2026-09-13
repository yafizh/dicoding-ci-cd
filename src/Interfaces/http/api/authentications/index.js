const express = require('express');
const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const router = express.Router();
  const authenticationsHandler = new AuthenticationsHandler(container);

  routes(authenticationsHandler).forEach(({ method, path, handler }) => {
    router[method.toLowerCase()](path, handler);
  });

  return router;
};
