const express = require('express');
const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = (container) => {
  const router = express.Router();
  const usersHandler = new UsersHandler(container);

  routes(usersHandler).forEach(({ method, path, handler }) => {
    router[method.toLowerCase()](path, handler);
  });

  return router;
};
