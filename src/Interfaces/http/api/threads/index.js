const express = require('express');
const ThreadsHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const router = express.Router();
  const threadsHandler = new ThreadsHandler(container);

  routes(threadsHandler).forEach(({ method, path, handler }) => {
    router[method.toLowerCase()](path, handler);
  });

  return router;
};
