const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
  },
  {
    method: 'GET',
    path: '/',
    handler: (request, response) => response.json({
      value: 'Hello world!',
    }),
  },
];

module.exports = routes;
